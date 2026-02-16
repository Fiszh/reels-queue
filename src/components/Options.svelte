<script lang="ts">
    import { user_settings } from "../storage";

    const updateSetting = (key: string, val: any) =>
        user_settings.update((current) => ({ ...current, [key]: val }));
</script>

<main>
    {#each Object.entries($user_settings) as [key, value]}
        <div class="setting">
            <p>{key}</p>
            {#if typeof value === "string" || typeof value === "number"}
                <input
                    type={typeof value}
                    {value}
                    on:input={(e) => updateSetting(key, e.currentTarget.value)}
                />
            {:else if typeof value === "boolean"}
                <input
                    type="checkbox"
                    checked={value}
                    on:change={(e) =>
                        updateSetting(key, e.currentTarget.checked)}
                />
            {/if}
        </div>
    {/each}
</main>

<style lang="scss">
    :global(body) {
        margin: 0;
        padding: 0.5rem;
        box-sizing: border-box;
        background: #111111;
        color: white;
        font-weight: bold;
    }

    main {
        display: flex;
        flex-direction: column;
    }

    .setting {
        display: flex;
        justify-content: space-between;
        align-items: center;

        border-bottom: 1px solid;
        border-image: linear-gradient(
                to right,
                #33333300 5%,
                #333 15%,
                #333 85%,
                #33333300 95%
            )
            1;

        &:last-child {
            border-bottom: 0px solid;
        }

        input[type="string"],
        input[type="number"] {
            all: unset;
            background-color: #ffffff0c;
            border-radius: 0.25rem;
            height: 100%;
            padding: 0.25rem;
            text-align: center;
            box-sizing: border-box;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    }
</style>
