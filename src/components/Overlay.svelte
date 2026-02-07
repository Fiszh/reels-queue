<script lang="ts">
    import { onMount } from "svelte";
    import { connection_status, link_queue, twitch_channel } from "../storage";
    import QueueDisplay from "./QueueDisplay.svelte";
    import { get } from "svelte/store";
    import { setUrl } from "../content";
    import { ArrowBigRight, Power, Trash } from "lucide-svelte";

    let next_button: HTMLButtonElement;

    let clear_button: HTMLButtonElement;

    let connect_button: HTMLButtonElement;

    let queue: queue_link[];
    let inputed_channel: string;

    let irc_connection_status: string = "not_connected";

    const faked_queue: queue_link[] = [ // LEAVING THIS FOR TESTING :P
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

    let queuedBy: string | null = "";

    function connectToIRC() {
        if (!inputed_channel || !inputed_channel.length) {
            alert("Invalid channel name...");
            return;
        }

        chrome.runtime.sendMessage({ type: "connect_twitch", inputed_channel });
    }

    const clearQueue = () => {link_queue.set([])};

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        queuedBy = params.get("queued_by");

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
    <p>
        <img
            src="https://static.cdninstagram.com/rsrc.php/v4/yI/r/VsNE-OHk_8a.png"
            alt="logo"
        /> 
        <span id="title">
            Instagram Reels Queue
            <span id="by">By: uniiDev</span>
        </span>
    </p>

    <p id="queuedBy">
        Current reel queued by: <span>{queuedBy || "None"}</span>
    </p>

    <!-- <Options {count} /> -->
    <QueueDisplay queue={link_queue} />

    <button bind:this={clear_button} onclick={clearQueue} id="clearQueue"> <Trash size="1rem"/> Clear Queue</button>

    <span id="connect"
        ><input bind:value={$twitch_channel} placeholder="channel..." />
        <button
            id="connect-button"
            title="Connect"
            bind:this={connect_button}
            onclick={connectToIRC}
        >
            <Power size="1rem" />
        </button>
    </span>

    <button bind:this={next_button} id="next">Next <ArrowBigRight size="1rem"/></button>

    Connection Status: {irc_connection_status}
</div>

<style lang="scss">
    .overlay {
        position: fixed;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        top: 1%;
        right: 1%;
        background-color: rgba(0, 0, 0, 0.75);
        color: white;
        border-radius: 1rem;
        border: 1px solid #333;
        padding: 0.5rem;
        height: 35dvh;
        min-width: 17rem;
        width: 17dvw;
        text-align: center;
        z-index: 10000000; // we love css dude
    }

    p {
        all: unset;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 1rem;
        font-weight: bolder;
        justify-content: center;

        img {
            max-height: 1.75rem;
        }

        padding-block: 0.25rem;
        box-sizing: border-box;

        border-bottom: 1px solid;
        border-image: linear-gradient(
                to right,
                #33333300 5%,
                #333 20%,
                #333 80%,
                #33333300 95%
            )
            1;
    }

    #queuedBy {
        text-overflow: wrap;
        word-break: break-all;
        text-align: center;
        display: flex;
        flex-direction: column;
    }

    #clearQueue,
    #connect-button,
    input,
    #next {
        all: unset;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.25);
        border-radius: 0.5rem;
        padding: 0.2rem;
        box-sizing: border-box;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;

        display: inline-flex;
        justify-content: center;
        gap: 0.25rem;

        &:hover {
            background-color: rgba(255, 255, 255, 0.35);
        }
    }

    input {
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

    #title {
        display: flex;
        flex-direction: column;
        text-align: left;

        #by {
            font-size: 0.75rem;
        }
    }

    #clearQueue {
        background-color: rgba(255, 0, 0, 0.9);

        &:hover {
            background-color: rgba(255, 0, 0, 1);
        }
    }
</style>
