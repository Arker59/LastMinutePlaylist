"use-strict";

chrome.runtime.onInstalled.addListener(() => {

    console.log("test fait");

    //test contextmenus
    chrome.contextMenus.create({
        id: '1',
        title: 'You selected \"%s\"',
        contexts: ['selection'],
    });

});
