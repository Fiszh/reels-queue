import { mount } from "svelte";
import Overlay from "../components/Overlay.svelte";
import { count, link_queue } from "../storage";

// Content scripts
// https://developer.chrome.com/docs/extensions/mv3/content_scripts/

export function setUrl(url: string, user: string) {
    link_queue.update((data) => data.filter((link) => link.link != url));

    const URL = new URLPattern(url);

    window.location.href = url + `?queued_by=${user}`;
}

// Some svelte component on the page
mount(Overlay, { target: document.body });
