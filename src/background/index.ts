import { connect, disconnect } from "./chat";

// Background service workers
// https://developer.chrome.com/docs/extensions/mv3/service_workers/

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'connect_twitch') {
        console.log(msg);
        disconnect();
        connect(msg.inputed_channel);
    }
});

// NOTE: If you want to toggle the side panel from the extension's action button,
// you can use the following code:
// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
//    .catch((error) => console.error(error));
