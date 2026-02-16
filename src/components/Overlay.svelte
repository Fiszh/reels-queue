<script lang="ts">
    import { onMount } from "svelte";
    import {
        connection_status,
        link_queue,
        sent_by,
        twitch_channel,
    } from "../storage";
    import QueueDisplay from "./QueueDisplay.svelte";
    import { get } from "svelte/store";
    import { setUrl } from "../content";
    import { ArrowBigRight, Power, Trash, History } from "lucide-svelte";

    let next_button: HTMLButtonElement;

    let clear_button: HTMLButtonElement;

    let connect_button: HTMLButtonElement;

    let check_version: HTMLButtonElement;

    let queue: queue_link[];
    let inputed_channel: string;

    let irc_connection_status: string = "not_connected";

    const faked_queue: queue_link[] = [
        // LEAVING THIS FOR TESTING :P
        {
            link: "https://www.instagram.com/reel/DUWVd4ZESB5/",
            by: "uniidev",
            id: 1,
        },
        {
            link: "https://www.instagram.com/reel/DUaOnKCjty7",
            by: "sennyk4",
            id: 1,
        },
        {
            link: "https://www.instagram.com/p/DUYjOf3Dtfm/",
            by: "zoil",
            id: 1,
        },
    ];

    async function checkVersion() {
        const version = chrome.runtime.getManifest().version;

        const res = await fetch(
            "https://api.github.com/repos/Fiszh/reels-queue/tags",
        );

        if (!res.ok) return alert("Failed to get latest GitHub version!");

        const data = await res.json();

        if (!data) return alert("No data from GitHub, please try again!");

        if (data[0]?.["name"]?.endsWith(version)) {
            return alert("Already on newest version!");
        } else {
            alert("Update available, opening download page!");

            chrome.runtime.sendMessage({
                type: "open-tab",
                url: `https://github.com/Fiszh/reels-queue/releases/tag/${data[0]["name"]}`,
            });
        }
    }

    function connectToIRC() {
        if (!inputed_channel || !inputed_channel.length) return alert("Invalid channel name...");

        chrome.runtime.sendMessage({ type: "connect_twitch", inputed_channel });
    }

    const clearQueue = () => link_queue.set([]);

    onMount(() => {
        queue = get(link_queue);
        link_queue.subscribe((data) => (queue = data));

        inputed_channel = get(twitch_channel);
        twitch_channel.subscribe((data) => (inputed_channel = data));

        irc_connection_status = get(connection_status);
        connection_status.subscribe((data) => (irc_connection_status = data));

        next_button.addEventListener("click", () => {
            if (queue[0]?.link) {
                setUrl(queue[0]?.link, queue[0]?.by);
            } else {
                alert("No reels in queue!");
            }
        });

        if (inputed_channel && inputed_channel.length) connectToIRC();
    });
</script>

<div class="overlay">
    <p id="topbar">
        <img
            src="https://static.cdninstagram.com/rsrc.php/v4/yI/r/VsNE-OHk_8a.png"
            alt="logo"
        />
        <span id="title">
            Instagram Reels Queue
            <span id="by">By: uniiDev</span>
        </span>
    </p>

    <main id="queue_main">
        <p id="queuedBy">
            Current reel queued by: <span id="sent_by">{$sent_by}</span>
        </p>

        <!-- <Options {count} /> -->
        <QueueDisplay queue={link_queue} />

        <button
            bind:this={clear_button}
            onclick={clearQueue}
            id="clearQueue"
            class="button"
        >
            <Trash size="1rem" /> Clear Queue</button
        >

        <span id="connect" class="button"
            ><input
                bind:value={$twitch_channel}
                type="text"
                class="button"
                placeholder="channel..."
            />
            <button
                class="button"
                id="connect-button"
                title="Connect"
                bind:this={connect_button}
                onclick={connectToIRC}
            >
                <Power size="1rem" />
            </button>
        </span>

        <button bind:this={next_button} id="next" class="button"
            >Next <ArrowBigRight size="1rem" /></button
        >

        <button bind:this={check_version} class="button" onclick={checkVersion}
            >Check Version <History size="1rem" /></button
        >
    </main>

    <span id="connection_status"
        >Connection Status: <p class={irc_connection_status}>
            {irc_connection_status}
        </p></span
    >

    <span id="version">v{chrome.runtime.getManifest().version}</span>
</div>

<style lang="scss">
    #topbar {
        background: linear-gradient(to right, #9333ea, #db2777, #f97316);
        padding: 0.75rem;
        display: flex;
        align-items: center;

        #title {
            display: flex;
            flex-direction: column;
            font-size: 0.85rem;

            #by {
                font-size: 0.7rem;
                color: #ffffffcc;
            }
        }
    }

    .overlay {
        position: fixed;
        display: flex;
        flex-direction: column;
        top: 1%;
        right: 1%;
        overflow: hidden;
        height: 30rem;
        min-width: 17rem;
        width: 17dvw;
        z-index: 10000000;
        border-radius: 0.5rem;

        background: #111111;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid #2a2a2a;

        text-align: left;

        padding-bottom: 0.25rem;
        box-sizing: border-box;
    }

    #queue_main {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: white;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 0.75rem;
        gap: 0.5rem;
        box-sizing: border-box;
    }

    #version {
        padding-block: 0.25rem;
        box-sizing: border-box;
        text-align: center;
    }

    p {
        all: unset;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        font-weight: bolder;

        img {
            max-height: 1.75rem;
        }

        border-bottom: 1px solid;
        border-image: linear-gradient(
                to right,
                #33333300 5%,
                #333 15%,
                #333 85%,
                #33333300 95%
            )
            1;
    }

    #queuedBy {
        text-overflow: wrap;
        word-break: break-all;
        display: flex;
        flex-direction: column;
        text-align: left;
        align-items: flex-start;
        width: 100%;

        #sent_by {
            color: #9ca3af;
        }
    }

    .button {
        all: unset;
        text-align: center;
        background-color: #262626;
        border-radius: 0.5rem;
        padding: 0.2rem;
        box-sizing: border-box;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;

        &:is(button):hover {
            background-color: #2c2c2c;
        }

        width: 100%;

        display: inline-flex;
        justify-content: center;
        gap: 0.25rem;
    }

    #next {
        background: linear-gradient(to right, #0095f6, #0081d6);

        &:hover {
            background: linear-gradient(to right, #0081d6, #006bb3);
        }
    }

    input[type="text"] {
        cursor: text;
    }

    #connect-button {
        size-adjust: 1/1;
        height: auto;
        width: 1.75rem;
    }

    #connect {
        display: flex;
        gap: 0.25rem;
    }

    input {
        width: 100%;
    }

    #clearQueue {
        background: linear-gradient(to right, #dc2626, #b91c1c);

        &:hover {
            background: linear-gradient(to right, #b91c1c, #991b1b);
        }
    }
    #connection_status {
        display: inline-flex;
        justify-content: center;
        gap: 0.25rem;

        .not_connected {
            color: #ef4444;
        }

        .connecting {
            color: #f59e0b;
        }

        .open {
            color: #22c55e;
        }

        .close,
        .reconnect_limit_reached {
            color: #b91c1c;
        }

        p {
            all: unset;
        }
    }
</style>
