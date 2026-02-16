import { connect, disconnect, IRC_is_connected } from "./chat";

// Background service workers
// https://developer.chrome.com/docs/extensions/mv3/service_workers/

chrome.tabs.onRemoved.addListener(async () => {
    const tabs = await chrome.tabs.query({});
    const hasExtensionTab = tabs.some(tab => tab.url?.includes("instagram"));
    if (!hasExtensionTab && IRC_is_connected) {
        console.log("Last extension tab closed, disconnecting WebSocket");
        disconnect(false);
    }
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'connect_twitch') {
        console.log(msg);
        disconnect();
        connect(msg.inputed_channel);
    } else if (msg.type === "open-tab") {
        chrome.tabs.create({
            url: msg.url,
            active: true
        });
    }
});

// NOTE: If you want to toggle the side panel from the extension's action button,
// you can use the following code:
// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
//    .catch((error) => console.error(error));
