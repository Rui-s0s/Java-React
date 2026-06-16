
const API_BASE_URL = '/api'; // Vite proxy handles redirection to backend

async function callApi(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API call failed: ${response.statusText}`);
  }

  // Handle No Content responses (e.g., DELETE)
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// --- Playlists ---
export const fetchPlaylists = () => callApi('/playlists');
export const createPlaylist = (name) => callApi('/playlists', 'POST', { name });
export const updatePlaylist = (id, name) => callApi(`/playlists/${id}`, 'PUT', { name });
export const deletePlaylist = (id) => callApi(`/playlists/${id}`, 'DELETE');

// --- Videos ---
export const getVideoById = (id) => callApi(`/videos/${id}`);
export const addVideoToPlaylist = (playlistId, title, url) => callApi(`/playlists/${playlistId}/videos`, 'POST', { title, url });
export const updateVideo = (id, title, url) => callApi(`/videos/${id}`, 'PUT', { title, url });
export const deleteVideo = (id) => callApi(`/videos/${id}`, 'DELETE');

// --- Comments ---
export const addComment = (videoId, author, text) => callApi(`/videos/${videoId}/comments`, 'POST', { author, text });
export const fetchVideoComments = (videoId) => callApi(`/videos/${videoId}/comments`);

// --- Likes/Dislikes ---
export const likeVideo = (videoId) => callApi(`/videos/${videoId}/like`, 'PATCH');
export const dislikeVideo = (videoId) => callApi(`/videos/${videoId}/dislike`, 'PATCH');

// --- Tags ---
export const getAllTags = () => callApi('/tags');
export const updateVideoTags = (videoId, tagNamesArray) => callApi(`/videos/${videoId}/tags`, 'PUT', { tags: tagNamesArray });