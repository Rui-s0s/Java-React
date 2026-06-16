import { Navbar } from './components/Navbar.js';
import { VideoPlayer } from './components/VideoPlayer.js';
import { LiveChat } from './components/LiveChat.js';
import { PlaylistsContainer } from './components/Playlists/PlaylistsContainer.js';
import * as api from './utils/api.js'; // Import all API functions

import './index.css';
import './App.css';

let state = {
  playlists: [], // Will be loaded from backend
  tags: [],     // THIS WILL BE FILLED WITH TAGS BACKEND
  username: localStorage.getItem('yt_clone_username') || null,
  currentVideo: null,
  currentVideoComments: [], // Comments for the currently playing video
  showChat: true,
  expandedPlaylists: [],
  isCreatingPlaylist: false,
  editingPlaylistId: null,
  newPlaylistName: '',
  addingToPlaylist: null,
  editingVideoId: null,
  newVideoTitle: '',
  newVideoUrl: '',
  step: 1,
  isLoading: true, 
  searchTag: '',
  isTagsModalOpen: false,
  editingTagIndex: null,
  editingTagValue: '',
};

// --- COMPONENT INSTANCES ---
let player = null;
let chat = null;
let playlistsUI = null;

const root = document.getElementById('app-root');

// --- THE UPDATE LOOP (The Engine) ---
async function updateUI() {
  const mainLayout = document.querySelector('.main-layout');

  if (!mainLayout) {
    return renderShell();
  }

  // Video Player
  if (state.currentVideo) {
    const playerProps = getPlayerProps();

    if (!player) {
      player = new VideoPlayer(playerProps);
      mainLayout.prepend(player.container);
    } else {
      player.update(playerProps);
    }
  } else if (player) {
    player.container.remove();
    player = null;
  }

  // Live Chat
  if (state.showChat && state.currentVideo) {
    const comments = state.currentVideoComments;

    if (!chat) {
      chat = new LiveChat(
        comments,
        handleSendMessage,
        state.username,
        handleSetUsername
      );

      mainLayout.appendChild(chat.container);
    } else {
      chat.update(comments, state.username);
    }
  } else if (chat) {
    chat.container.remove();
    chat = null;
  }

  // Playlists
  if (playlistsUI) {
    playlistsUI.update(getPlaylistProps());
  }
}

// --- LOGIC HANDLERS ---

async function handleSendMessage(text) {
  if (!state.currentVideo || !state.username) return;

  try {
    await api.addComment(state.currentVideo.id, state.username, text);
    // After adding a comment, re-fetch comments for the current video
    await fetchCurrentVideoData(state.currentVideo.id);
    updateUI();
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("Failed to add comment.");
  }
}

function handleSetUsername(name) {
  state.username = name;
  localStorage.setItem('yt_clone_username', name);
  updateUI();
}

async function handleLikeDislike(type) {
  if (!state.currentVideo) return;

  try {
    if (type === 'like') {
      await api.likeVideo(state.currentVideo.id);
    } else {
      await api.dislikeVideo(state.currentVideo.id);
    }
    await fetchCurrentVideoData(state.currentVideo.id); // Re-fetch to get updated counts
    updateUI();
  } catch (error) {
    console.error(`Error ${type}ing video:`, error);
    alert(`Failed to ${type} video.`);
  }
}

async function handlePlaylistSubmit(e) {
  const value = e.target.value ? e.target.value.trim() : state.newPlaylistName.trim();

  if (e.key === 'Enter') {
    if (!value) return;

    try {
      if (state.editingPlaylistId) {
        await api.updatePlaylist(state.editingPlaylistId, value);
        state.editingPlaylistId = null;
      } else {
        await api.createPlaylist(value);
        state.isCreatingPlaylist = false;
      }
      state.newPlaylistName = '';
      await fetchAllPlaylistsAndRender(); // Re-fetch all playlists
    } catch (error) {
      console.error("Error saving playlist:", error);
      alert("Failed to save playlist.");
    }
  } else if (e.key === 'Escape') {
    state.isCreatingPlaylist = false;
    state.editingPlaylistId = null;
    state.newPlaylistName = '';
    updateUI();
  }
}

async function handleVideoSubmit(e, playlistId) {
  const value = e.target.value.trim();

  if (e.key === 'Enter') {
    if (state.step === 1 && value) {
      state.newVideoTitle = value;
      state.step = 2;
      updateUI();
    } 
    else if (state.step === 2 && value) {
      state.newVideoUrl = value; // Changed from newVideoLink

      try {
        if (state.editingVideoId) {
          await api.updateVideo(state.editingVideoId, state.newVideoTitle, state.newVideoUrl);
        } else {
          await api.addVideoToPlaylist(playlistId, state.newVideoTitle, state.newVideoUrl);
        }
        resetVideoForm();
        await fetchAllPlaylistsAndRender(); // Re-fetch all playlists
      } catch (error) {
        console.error("Error saving video:", error);
        alert("Failed to save video.");
      }
    }
  } else if (e.key === 'Escape') {
    resetVideoForm();
    updateUI();
  }
}

function resetVideoForm() {
  state.addingToPlaylist = null;
  state.editingVideoId = null;
  state.newVideoTitle = '';
  state.newVideoUrl = ''; 
  state.step = 1;
}

// --- TAG MODAL LOGIC HANDLERS ---

function handleToggleTags() {
  state.isTagsModalOpen = !state.isTagsModalOpen;
  // Reset fields when opening/closing
  state.editingTagIndex = null;
  state.editingTagValue = '';
  updateUI();
}

function handleCloseTags() {
  state.isTagsModalOpen = false;
  state.editingTagIndex = null;
  state.editingTagValue = '';
  updateUI();
}

async function handleUpdateTag(index, newValue) {
  if (!state.currentVideo) return;

  const cleanValue = newValue.trim();

  const currentTagNames =
    (state.currentVideo.tags || [])
      .map(tag => tag.name);

  if (cleanValue === '') {
    state.editingTagIndex = null;
    state.editingTagValue = '';
    updateUI();
    return;
  }

  // New tag
  if (index >= currentTagNames.length) {
    currentTagNames.push(cleanValue);
  }
  // Existing tag
  else {
    currentTagNames[index] = cleanValue;
  }

  try {
    await api.updateVideoTags(
      state.currentVideo.id,
      currentTagNames
    );

    await fetchCurrentVideoData(
      state.currentVideo.id
    );

    state.editingTagIndex = null;
    state.editingTagValue = '';

    updateUI();
  } catch (error) {
    console.error("Error updating tags:", error);
    alert("Failed to update tags.");
  }
}

function handleAddTag() {
  if (!state.currentVideo) return;

  state.editingTagIndex = state.currentVideo.tags.length;
  state.editingTagValue = '';

  updateUI();
}

// --- INITIAL SHELL RENDER ---
function renderShell() {
  root.innerHTML = `
    <div class="app-container">
      <div id="nav-target"></div>

      <main class="main-layout ${!state.showChat ? 'hide-chat' : ''}">
        <div id="playlists-target"></div>
      </main>
    </div>
  `;

  // Navbar
  document.getElementById('nav-target').innerHTML =
    Navbar(state.searchTag);

  const searchInput =
    document.getElementById('tag-search');

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      state.searchTag = e.target.value.trim();
      updateUI();
    }

    if (e.key === 'Escape') {
      e.target.value = '';
      state.searchTag = '';
      updateUI();
    }
  });

  // Playlists
  playlistsUI = new PlaylistsContainer(
    getPlaylistProps()
  );

  document
    .getElementById('playlists-target')
    .appendChild(playlistsUI.container);

  updateUI();
}

// --- PROPS GENERATORS (The "State Selectors") ---

function getPlayerProps() {
  return {
    video: state.currentVideo,
    likes: state.currentVideo?.likes || 0,
    dislikes: state.currentVideo?.dislikes || 0,
    showChat: state.showChat,
    onLike: () => handleLikeDislike('like'),
    onDislike: () => handleLikeDislike('dislike'),
    onToggleChat: () => { state.showChat = !state.showChat; updateUI(); },

    // PASSING MODAL VARIABLES & ACTIONS DOWN
    isTagsModalOpen: state.isTagsModalOpen,
    editingTagIndex: state.editingTagIndex,
    editingTagValue: state.editingTagValue,
    
    onToggleTags: handleToggleTags,
    onCloseTags: handleCloseTags,
    onAddTag: handleAddTag,
    onUpdateTag: handleUpdateTag,
    
    onSetEditingTagIndex: (index) => {
      state.editingTagIndex = index;
      updateUI();
    },

    onSetEditingTagValue: (value) => {
      state.editingTagValue = value;
    }
  };
}

function getPlaylistProps() {
  return {
    playlists: state.searchTag
    ? state.playlists.map(pl => ({
        ...pl,
        videos: pl.videos.filter(v =>
          (v.tags || []).some(tag =>
            tag.name.toLowerCase().includes(
              state.searchTag.toLowerCase()
            )
          )
        )
      }))
    : state.playlists,
    isCreating: state.isCreatingPlaylist,
    onStartCreate: () => { state.isCreatingPlaylist = true; updateUI(); },
    onPlaylistSubmit: handlePlaylistSubmit,
    newPlaylistName: state.newPlaylistName,
    onNewPlaylistNameChange: (val) => { state.newPlaylistName = val; },

    expandedPlaylists: state.expandedPlaylists,
    editingPlaylistId: state.editingPlaylistId,

    onTogglePlaylist: (id) => {
      state.expandedPlaylists = state.expandedPlaylists.includes(id)
        ? state.expandedPlaylists.filter(p => p !== id)
        : [...state.expandedPlaylists, id];
      updateUI();
    },
    onStartEditPlaylist: (e, pl) => {
      state.editingPlaylistId = pl.id;
      state.newPlaylistName = pl.name;
      updateUI();
    },
    onDeletePlaylist: async (e, id) => {
      if (confirm("Delete playlist?")) {
        try {
          await api.deletePlaylist(id);
          // If the deleted playlist contained the current video, clear currentVideo
          const deletedPlaylist = state.playlists.find(p => p.id === id);
          if (deletedPlaylist && deletedPlaylist.videos.some(v => v.id === state.currentVideo?.id)) {
            state.currentVideo = null;
            state.currentVideoComments = [];
          }
          await fetchAllPlaylistsAndRender();
        } catch (error) {
          console.error("Error deleting playlist:", error);
          alert("Failed to delete playlist.");
        }
      }
    },

    // Video Logic
    currentVideoId: state.currentVideo?.id,
    onSelectVideo: async (video) => { 
      state.currentVideo = video; 
      await fetchCurrentVideoData(video.id); // video.id is already a number from backend
      updateUI(); 
      window.scrollTo(0,0); 
    },
    onStartAddVideo: (playlistId) => { 
      state.addingToPlaylist = parseInt(playlistId, 10); // Ensure numeric ID
      state.step = 1; 
      updateUI(); 
    },
    onEditVideo: (e, plId, vid) => {
      state.addingToPlaylist = parseInt(plId, 10);
      state.editingVideoId = vid.id; // vid.id is already a number from backend
      state.newVideoTitle = vid.title;
      state.newVideoUrl = vid.url;
      state.step = 1;
      updateUI();
    },
    onDeleteVideo: async (e, plId, vidId) => {
      if (confirm("Delete video?")) {
        try {
          // Using deleteVideoFromPlaylist if it's implemented and preferred, otherwise deleteVideo
          // For now, assuming deleteVideo will suffice for removing the video entirely
          await api.deleteVideo(vidId);
          if (state.currentVideo?.id === vidId) {
            state.currentVideo = null;
            state.currentVideoComments = [];
          }
          await fetchAllPlaylistsAndRender();
        } catch (error) {
          console.error("Error deleting video:", error);
          alert("Failed to delete video.");
        }
      }
    },
    onVideoSubmit: handleVideoSubmit,
    onNewVideoTitleChange: (val) => { state.newVideoTitle = val; },
    onNewVideoLinkChange: (val) => { state.newVideoUrl = val; },

    // Video State
    addingToPlaylist: state.addingToPlaylist,
    step: state.step,
    newVideoTitle: state.newVideoTitle,
    newVideoUrl: state.newVideoUrl,           // This was newVideoLink maybe now it will work
    editingVideoId: state.editingVideoId
    };
    }

    // --- DATA FETCHING & INITIALIZATION ---
    async function fetchAllPlaylistsAndRender() {
      try {
        state.playlists = await api.fetchPlaylists();

        // If there's no current video selected, try to set the first one from the fetched playlists.
        // Or, if a video was previously selected, try to find its updated version in the fetched playlists.
        if (!state.currentVideo && state.playlists.length > 0 && state.playlists[0].videos.length > 0) {
          state.currentVideo = state.playlists[0].videos[0];
          await fetchCurrentVideoData(state.currentVideo.id);
        } else if (state.currentVideo) {
          // A video was selected, find its updated data in the new playlists
          let foundUpdatedVideo = null;
          for (const pl of state.playlists) {
            foundUpdatedVideo = pl.videos.find(v => v.id === state.currentVideo.id);
            if (foundUpdatedVideo) {
              break;
            }
          }
          if (foundUpdatedVideo) {
            state.currentVideo = foundUpdatedVideo;
            await fetchCurrentVideoData(state.currentVideo.id); // Also re-fetch comments and full details
          } else {
            // Current video was deleted from backend or its playlist
            state.currentVideo = null;
            state.currentVideoComments = [];
          }
        }
        updateUI();
      } catch (error) {
        console.error("Error fetching playlists:", error);
        alert("Failed to load playlists.");
        state.playlists = []; // Clear playlists on error
        state.currentVideo = null;
        state.currentVideoComments = [];
        updateUI();
      }
    }

    async function fetchCurrentVideoData(videoId) {
      try {
        const video = await api.getVideoById(videoId); // Fetch the complete video object
        state.currentVideo = video; // Update currentVideo with fresh data
        state.currentVideoComments = video.comments || []; // Update comments directly from fetched video
      } catch (error) {
        console.error("Error fetching video data or comments:", error);
        state.currentVideo = null; // Clear video if it can't be fetched
        state.currentVideoComments = [];
      }
    }

    // Initial application boot
    async function init() {
      state.isLoading = true;
      renderShell(); // Render initial shell with loading state

      try {
        state.playlists = await api.fetchPlaylists();
        if (state.playlists.length > 0 && state.playlists[0].videos.length > 0) {
          state.currentVideo = state.playlists[0].videos[0];
          await fetchCurrentVideoData(state.currentVideo.id);
        }
      } catch (error) {
        console.error("Initial data fetch failed:", error);
        alert("Failed to load initial data.");
      } finally {
        state.isLoading = false;
        updateUI();
      }
    }

    init();