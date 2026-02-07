import { mount } from "svelte";
import Overlay from "../components/Overlay.svelte";
import { link_queue, sent_by } from "../storage";

// Content scripts
// https://developer.chrome.com/docs/extensions/mv3/content_scripts/

export function setUrl(url: string, user: string) {
    link_queue.update((data) => data.filter((link) => link.link != url));

    const clean = new URL(url);
    clean.search = "";

    sent_by.set(user);

    window.location.href = clean.toString();
}

// Some svelte component on the page
mount(Overlay, { target: document.body });
