"use strict";

const VIDEO_PROVIDERS = [
  {
    name: "YouTube",
    match: url =>
      (url.hostname.includes("youtube.com") && url.searchParams.has("v")) ||
      url.hostname === "youtu.be"
  },
  {
    name: "SoundCloud",
    match: url =>
      url.hostname.includes("soundcloud.com")
  },
  {
    name: "Vimeo",
    match: url =>
      url.hostname.includes("vimeo.com")
  },
  {
    name: "Dailymotion",
    match: url =>
      url.hostname.includes("dailymotion.com")
  },
  {
    name: "Twitch",
    match: url =>
      url.hostname.includes("twitch.tv")
  }
];

function isValidVideoUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return VIDEO_PROVIDERS.some(provider => provider.match(url));
  } catch {
    return false;
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const { playlists } = await chrome.storage.local.get("playlists");

  if (!playlists) {
    await chrome.storage.local.set({ playlists: [] });
  }

  createContextMenus();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.playlists) {
    createContextMenus();
  }
});

async function createContextMenus() {
  chrome.contextMenus.removeAll();

  const { playlists = [] } = await chrome.storage.local.get("playlists");

  chrome.contextMenus.create({
    id: "playlist-saver-root",
    title: "Last Minute Playlist",
    contexts: ["page", "link", "video"]
  });

  chrome.contextMenus.create({
    id: "add-to-playlist",
    title: "Ajouter à la playlist",
    parentId: "playlist-saver-root",
    contexts: ["page", "link", "video"]
  });

  chrome.contextMenus.create({
    id: "playlists",
    title: "Voir les playlists",
    parentId: "playlist-saver-root",
    contexts: ["page", "link", "video"]
  });

  playlists.forEach(playlist => {
    chrome.contextMenus.create({
      id: `playlist-${playlist.id}`,
      title: playlist.name,
      parentId: "add-to-playlist",
      contexts: ["page", "link", "video"]
    });
  });

  chrome.contextMenus.create({
    id: "separator",
    type: "separator",
    parentId: "add-to-playlist",
    contexts: ["page", "link", "video"]
  });

  chrome.contextMenus.create({
    id: "open-playlists",
    title: "Voir plus…",
    parentId: "add-to-playlist",
    contexts: ["page", "link", "video"]
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url =
    info.linkUrl ||
    info.srcUrl ||
    info.pageUrl;

  const title = tab?.title || "Sans titre";

  if (info.menuItemId.startsWith("playlist-")) {
    const playlistId = info.menuItemId.replace("playlist-", "");
    await addItemToPlaylist(playlistId, title, url, tab);
    return;
  }

  if (info.menuItemId === "open-playlists" || info.menuItemId === "playlists") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("pages/playlists.html")
    });
  }
});

async function addItemToPlaylist(playlistId, title, url, tab) {
  if (!isValidVideoUrl(url)) {
    console.warn("URL rejetée :", url);

    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "PLAYLIST_SAVER_BANNER",
        text: "URL rejetée : ce lien n’est pas une vidéo valide",
        level: "error"
      });
    }

    return;
  }

  const { playlists = [] } = await chrome.storage.local.get("playlists");
  const playlist = playlists.find(p => p.id === playlistId);

  if (!playlist) return;

  playlist.items.push({
    id: crypto.randomUUID(),
    title,
    url,
    addedAt: Date.now()
  });

  await chrome.storage.local.set({ playlists });
}
