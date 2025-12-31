"use strict";

function showPlaylistSaverBanner(message, type = "error") {
  
  if (document.getElementById("playlist-saver-banner")) return;

  const banner = document.createElement("div");
  banner.id = "playlist-saver-banner";
  banner.textContent = message;

  Object.assign(banner.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    padding: "12px 16px",
    textAlign: "center",
    fontSize: "14px",
    fontFamily: "system-ui, sans-serif",
    zIndex: "2147483647",
    color: "#fff",
    backgroundColor: type === "error" ? "#c0392b" : "#2ecc71",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
  });

  document.documentElement.appendChild(banner);

  setTimeout(() => {
    banner.style.transition = "opacity 0.3s ease";
    banner.style.opacity = "0";
    setTimeout(() => banner.remove(), 300);
  }, 2500);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "PLAYLIST_SAVER_BANNER") {
    showPlaylistSaverBanner(message.text, message.level);
  }
});
