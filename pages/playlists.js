"use-strict";

let currentPlaylistId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadPlaylists();
  bindCreatePlaylist();
});

async function loadPlaylists() {
  const { playlists = [] } = await chrome.storage.local.get("playlists");
  const ul = document.getElementById("playlists");
  ul.innerHTML = "";

  if (playlists.length === 0) {
    ul.innerHTML = "<li>Aucune playlist</li>";
    clearPlaylistDetails();
    return;
  }

  playlists.forEach(playlist => {
    const li = document.createElement("li");
    li.textContent = `${playlist.name} (${playlist.items.length})`;
    li.style.cursor = "pointer";

    li.addEventListener("click", () => {
      currentPlaylistId = playlist.id;
      renderPlaylistDetails(playlist);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Supprimer";
    deleteBtn.style.marginLeft = "10px";

    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await deletePlaylist(playlist.id);
    });

    li.appendChild(deleteBtn);
    ul.appendChild(li);
  });
}

function bindCreatePlaylist() {
  const btn = document.getElementById("create-playlist");
  btn.addEventListener("click", async () => {
    const input = document.getElementById("new-playlist-name");
    const name = input.value.trim();
    if (!name) return;

    const { playlists = [] } = await chrome.storage.local.get("playlists");

    playlists.push({
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      items: []
    });

    await chrome.storage.local.set({ playlists });

    input.value = "";
    loadPlaylists();
  });
}

async function deletePlaylist(playlistId) {
  const { playlists = [] } = await chrome.storage.local.get("playlists");
  const updated = playlists.filter(p => p.id !== playlistId);

  await chrome.storage.local.set({ playlists: updated });

  if (currentPlaylistId === playlistId) {
    currentPlaylistId = null;
    clearPlaylistDetails();
  }

  loadPlaylists();
}

function renderPlaylistDetails(playlist) {
  document.getElementById("playlist-title").textContent = playlist.name;

  const ul = document.getElementById("playlist-items");
  ul.innerHTML = "";

  if (playlist.items.length === 0) {
    ul.innerHTML = "<li>Aucun élément</li>";
    return;
  }

  playlist.items.forEach(item => {
    const li = document.createElement("li");

    const link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.title;
    link.target = "_blank";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Supprimer";
    deleteBtn.style.marginLeft = "10px";

    deleteBtn.addEventListener("click", async () => {
      await removeItemFromPlaylist(item.id);
    });

    li.appendChild(link);
    li.appendChild(deleteBtn);
    ul.appendChild(li);
  });
}

async function removeItemFromPlaylist(itemId) {
  if (!currentPlaylistId) return;

  const { playlists = [] } = await chrome.storage.local.get("playlists");
  const playlist = playlists.find(p => p.id === currentPlaylistId);
  if (!playlist) return;

  playlist.items = playlist.items.filter(i => i.id !== itemId);

  await chrome.storage.local.set({ playlists });

  renderPlaylistDetails(playlist);
  loadPlaylists();
}

function clearPlaylistDetails() {
  document.getElementById("playlist-title").textContent =
    "Sélectionne une playlist";
  document.getElementById("playlist-items").innerHTML = "";
}
