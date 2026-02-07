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
        background-color: rgba(255, 255, 255, 0.25);
        border-radius: 0.5em;
        overflow-y: auto;
        overflow-x: hidden;

        button {
            all: unset;
            cursor: pointer;
            border-bottom: 1px solid #6e6e6e;
            background-color: rgba(0, 0, 0, 0.25);
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-weight: bold;
            
            #user {
                color: rgb(238, 242, 255);
            }

            span {
                display: inline-block;
                max-width: 85%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                text-align: center;
            }

            &:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }
        }
    }
</style>
