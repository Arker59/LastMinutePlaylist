"use-strict";

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("button1").addEventListener("click", function(){
        chrome.tabs.create({
            url: chrome.runtime.getURL("pages/playlists.html")
        });
    });
});