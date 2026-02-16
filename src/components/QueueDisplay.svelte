<script lang="ts">
    import { type Writable } from "svelte/store";
    import { setUrl } from "../content";

    interface Props {
        queue: Writable<queue_link[]>;
    }

    let { queue }: Props = $props();
</script>

<div class="container">
    {#each $queue as queue_link}
        <button onclick={() => setUrl(queue_link.link, queue_link.by)}>
            <span>{queue_link.link}</span>
            <span id="user">from: {queue_link.by} (id: {queue_link.id})</span>
        </button>
    {/each}
</div>

<style lang="scss">
    .container {
        all: unset;
        width: 100%;
        height: 100%;
        border-radius: 0.5em;
        overflow-y: auto;
        overflow-x: hidden;

        padding: 0.25rem;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        background-color: #262626;

        button {
            all: unset;
            cursor: pointer;
            border: 1px solid #333;
            padding-block: 0.25rem;
            box-sizing: border-box;
            border-radius: 0.5rem;
            background-color: rgba(0, 0, 0, 0.25);
            color: #0081d8;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-weight: bold;

            &:hover {
                color: #008be8;
                background-color: rgba(0, 0, 0, 0.2);
            }

            #user {
                color: #818181;
            }

            span {
                display: inline-block;
                max-width: 85%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                text-align: center;
            }
        }
    }
</style>
