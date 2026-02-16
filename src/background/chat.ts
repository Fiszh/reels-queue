import { connection_status, link_queue } from '../storage';

interface ParsedMessage {
  raw: string;
  tags: {
    rawTags: Record<string, any>;
    tags: Record<string, any>;
    merged: Record<string, any>;
  } | Record<string, any>;
  prefix: Record<string, string>;
  command: string;
  channel: string;
  message: string;
}

let TTV_IRC_WS: WebSocket | null;
export let IRC_is_connected = false;

let can_reconnect = true;

let reconnectAttempts = 0;
const MAX_RECONNECTS = 10;

let heartbeatInterval: ReturnType<typeof setTimeout> | undefined = undefined;
let heartbeatTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

connection_status.set("not_connected");

export function connect(channel_name: string) {
  console.log(channel_name);
  if (IRC_is_connected) return;

  connection_status.set('connecting');

  TTV_IRC_WS = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

  TTV_IRC_WS.addEventListener('open', () => {
    reconnectAttempts = 0;

    TTV_IRC_WS?.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
    TTV_IRC_WS?.send(`NICK justinfan${Math.floor(Math.random() * 9999)}`);
    TTV_IRC_WS?.send(`JOIN #${channel_name}`);
    console.log('Connected to Twitch IRC WebSocket');

    connection_status.set('open');

    IRC_is_connected = true;

    // FIX TRY
    heartbeatInterval = setInterval(() => {
      if (TTV_IRC_WS?.readyState === WebSocket.OPEN) {
        TTV_IRC_WS?.send('PING');

        clearTimeout(heartbeatTimeout as NodeJS.Timeout);
        heartbeatTimeout = setTimeout(() => {
          console.warn('No PONG, reconnecting...');
          TTV_IRC_WS?.close();
        }, 20000);
      }
    }, 20000);
  });

  TTV_IRC_WS.addEventListener('message', (event) => {
    try {
      const messagesSplit = event.data.split('\r\n');

      for (const line of messagesSplit) {
        if (!line) continue;
        const parsed = parseIrcLine(line);

        switch (parsed.command) {
          case "PING":
            TTV_IRC_WS?.send('PONG :tmi.twitch.tv');

            break;
          case "RECONNECT":
            disconnect();

            return;
          case "PONG":
            clearTimeout(heartbeatTimeout as NodeJS.Timeout);

            break;
          case "CLEARCHAT":
            if (parsed.tags.merged["target-user-id"]) {
              link_queue.update(arr => arr.filter(item => String(item["id"]) !== String(parsed.tags.merged["target-user-id"])));
            }

            break;
          case "PRIVMSG":
            const regex = /https:\/\/www\.instagram\.com\/(reel|reels|p)\/[A-Za-z0-9_-]+\/?/g;

            const matches = parsed.message.match(regex);

            if (matches && matches.length) {
              const parsed_link: queue_link = {
                link: matches[0],
                by: parsed.tags.merged["username"],
                id: parsed.tags.merged["user-id"],
              }

              parsed_link.link = parsed_link.link.replace(/\/reels\//g, "/reel/");

              link_queue.update(links => {
                const already_in_queue = links.find(link => link.link == parsed_link.link);

                if (links.length < 100 && !already_in_queue) links = [...links, parsed_link]; // MAX 100 LINKS

                return links;
              });
            }

            break;
          default:
            //console.log("UNKNOWN PARSED COMMAND", parsed.command, parsed);

            break;
        }
      }
    } catch (err) {
      console.error('Error in message handler:', err);
    }
  });

  TTV_IRC_WS.addEventListener('close', () => {
    console.log('Disconnected from Twitch IRC');

    clearInterval(heartbeatInterval as NodeJS.Timeout);
    clearTimeout(heartbeatTimeout as NodeJS.Timeout);

    IRC_is_connected = false;

    if (!can_reconnect) {
      can_reconnect = true;

      connection_status.set('not_connected');
      return;
    };

    reconnectAttempts++;

    if (reconnectAttempts <= MAX_RECONNECTS) {
      setTimeout(() => connect(channel_name), 1000 * reconnectAttempts);

      connection_status.set('close');
    } else {
      connection_status.set('reconnect_limit_reached');

      return;
    }
  });

  TTV_IRC_WS.addEventListener('error', (err) => console.error('WebSocket error:', err));
}

export function disconnect(reconnect?: boolean) {
  if (typeof reconnect == "boolean" && !reconnect) can_reconnect = false;

  if (TTV_IRC_WS) {
    TTV_IRC_WS.close();
    TTV_IRC_WS = null;
  }

  IRC_is_connected = false;

  clearInterval(heartbeatInterval as NodeJS.Timeout);
  clearTimeout(heartbeatTimeout as NodeJS.Timeout);
}

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\//g, "&#x2F;");
}

/*NOTE PARSING MIGHT NOT WORK 100%*/
function parseIrcLine(raw: string): ParsedMessage {
  let parsed = {
    raw,
    "tags": {
      rawTags: {},
      tags: {},
      merged: {}
    },
    prefix: {},
    command: "",
    channel: "",
    message: ""
  };

  try {
    // SPLIT TAGS AND REST
    let lineTags = "";
    let rawPrefix = "";
    let line = raw;

    if (line.startsWith('@')) {
      const [tagsPart, ...restParts] = line.split(" ");
      lineTags = tagsPart.slice(1);
      line = restParts.join(" ");

      rawPrefix = line.split(" ")[0];

      const end = line.indexOf(' ');
      line = line.slice(end + 1);
    }

    if (line.startsWith(':')) {
      const end = line.indexOf(' ');
      line = line.slice(end + 1);
    }

    const space = line.indexOf(' ');
    const command = space === -1 ? line : line.slice(0, space);
    const trailing = space === -1 ? null : line.slice(space + 1).replace(/^:/, '');

    // GET PARTS OF REST
    const [channel, ...messageParts] = (trailing || "").split(" ");

    // GET AND CLEAN MESSAGE
    const message = messageParts.join(" ");
    let cleanMessage = message.startsWith(":") ? message.slice(1) : message;

    // CLEAN AND GET PREFIX
    const clean = rawPrefix.startsWith(":") ? rawPrefix.slice(1) : rawPrefix;

    const [nickPart, host] = clean.split("@");
    const [nick, user] = nickPart.split("!");

    const prefix = { nick, user, host };

    // GENERATE RAW AND PARSED TAGS
    const ircEscapedChars: Record<string, string> = { s: " ", n: "\n", r: "\r", ":": ";", "\\": "\\" };

    const tagsSplit = lineTags.split(";");

    const rawTags = Object.fromEntries(
      tagsSplit.map((tag: string) => {
        const [key, value] = tag.split("=");
        const unescaped = value?.replace(/\\(.)/g, (_, c) => ircEscapedChars[c] ?? c) ?? null;
        return [key, unescaped];
      })
    );

    const isNumber = (str: string) => !isNaN(Number(str));

    const tags: Record<string, any> = {};
    const TAG_VALUE_REGEX = /([^,\/]+)\/([^,]+)/g;
    const EMOTE_POSITIONS_REGEX = /([^\/:]+):([\d,-]+)/g;

    Object.entries(rawTags).forEach(([key, value]) => {
      if (isNumber(value) && value !== "") {
        const numberValue = Number(value);

        tags[key] = numberValue > 1 ? numberValue : Boolean(numberValue);
      } else {
        let matches = [];
        let matchesType = "TAG_VALUE_REGEX";

        if (value.includes(':')) {
          matches = [...value.matchAll(EMOTE_POSITIONS_REGEX)];

          matchesType = "EMOTE_POSITIONS_REGEX";
        } else {
          matches = [...value.matchAll(TAG_VALUE_REGEX)];
        }

        if (matches.length) {
          for (const match of matches) {
            const [, id, nums] = match;

            if (matchesType == "TAG_VALUE_REGEX") {
              if (!tags[key]) { tags[key] = {} };

              tags[key][id] = nums;
            } else if (matchesType == "EMOTE_POSITIONS_REGEX") {
              if (!tags[key]) { tags[key] = [] };

              tags[key][id] = [...nums.split(",")];
            }
          }
        } else {
          tags[key] = value;
        }
      }
    });

    function addTag(key: string, value: any) {
      if (Object.values(rawTags).length) rawTags[key] = value;
      if (Object.values(tags).length) tags[key] = value;
    }

    // INSTERT USERNAME INTO TAGS
    if (prefix["nick"]) {
      addTag("username", prefix["nick"]);
    }

    // ADD ACTION TAG
    if (typeof cleanMessage === "string" && cleanMessage.startsWith('\x01ACTION') && cleanMessage.endsWith('\x01')) {
      addTag("action", true);

      cleanMessage = cleanMessage.slice(8, -1);
    } else {
      addTag("action", false);
    }

    // MERGE RAW AND NORMAL TAGS
    const merged = {
      ...Object.fromEntries(Object.entries(rawTags).map(([key, value]) => [`${key}-raw`, value])),
      ...tags
    };

    // RETURN PARSED
    parsed = {
      "raw": line,
      "tags": {
        rawTags,
        tags,
        merged
      },
      prefix,
      command,
      channel,
      message: cleanMessage
    };
  } catch (err) {
    console.error("Failed parsing:", raw, " With the error:", err);
  } finally {
    return parsed;
  }
}