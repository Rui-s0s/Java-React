import { VideoItem } from './VideoItem.js';

export class PlaylistItem {
  constructor(props) {
    this.props = props;
    this.container = document.createElement('div');
    this.container.className = 'playlist-item-container';
    this.initEvents();
    this.render();
  }

  update(newProps) {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  initEvents() {
    this.container.addEventListener('click', (e) => {
      const { 
        playlist, onToggle, onStartEdit, onDelete, 
        onStartAddVideo, onSelectVideo, onEditVideo, onDeleteVideo 
      } = this.props;

      // Toggle Header
      if (e.target.closest('.playlistHeader') && !e.target.closest('.headerActions')) {
        onToggle(playlist.id);
      }
      // Edit Playlist Name
      if (e.target.closest('.edit-playlist-btn')) {
        e.stopPropagation();
        onStartEdit(e, playlist);
      }
      // Delete Playlist
      if (e.target.closest('.delete-playlist-btn')) {
        e.stopPropagation();
        onDelete(e, playlist.id);
      }
      // Add Video Button
      if (e.target.closest('.add-video-btn')) {
        e.stopPropagation();
        onStartAddVideo(playlist.id);
      }

      // Video Selection
      const videoItem = e.target.closest('.videoItem');
      if (videoItem && !e.target.closest('.headerActions')) {
        const videoId = videoItem.dataset.videoId;
        // Backend IDs are Long (numbers), frontend might have them as strings from DOM
        const video = playlist.videos.find(v => v.id.toString() === videoId.toString());
        if (video) onSelectVideo(video);
      }

      // Edit Video
      const editVideoBtn = e.target.closest('.editBtn');
      if (editVideoBtn) {
        e.stopPropagation();
        const videoId = editVideoBtn.closest('.videoItem').dataset.videoId;
        const video = playlist.videos.find(v => v.id.toString() === videoId.toString());
        if (video) onEditVideo(e, playlist.id, video);
      }

      // Delete Video
      const deleteVideoBtn = e.target.closest('.delete-btn');
      if (deleteVideoBtn) {
        e.stopPropagation();
        const videoId = deleteVideoBtn.closest('.videoItem').dataset.videoId;
        onDeleteVideo(e, playlist.id, videoId);
      }
    });

    // Handle Input changes/submits via delegation
    this.container.addEventListener('keydown', (e) => {
      const isPlaylistInput = e.target.classList.contains('playlist-name-input');
      const isVideoInput = e.target.classList.contains('video-input');

      if (e.key === 'Enter' || e.key === 'Escape') {
        if (isPlaylistInput) {
          e.stopPropagation();
          this.props.onEditSubmit?.(e);
        } else if (isVideoInput) {
          e.stopPropagation();
          this.props.onVideoSubmit(e, this.props.playlist.id);
        }
      }
    });
  }

  render() {
    const { 
      playlist, isExpanded, isEditing, editingName, 
      currentVideoId, addingToPlaylist, step, 
      newVideoTitle, newVideoUrl, editingVideoId 
    } = this.props;

    // 1. Template for the Header (Editing vs Viewing)
    const headerHtml = isEditing ? `
      <div style="margin-bottom: 8px;">
        <input type="text" class="inlineInput playlist-name-input" 
               value="${editingName}" autofocus>
      </div>
    ` : `
      <div class="playlistHeader">
        <span style="flex: 1;">${playlist.name}</span>
        <div class="headerActions">
          <button class="iconBtn edit-playlist-btn">✏️</button>
          <button class="iconBtn delete-playlist-btn">🗑️</button>
        </div>
        <span style="margin-left: 8px;">${isExpanded ? '▼' : '▶'}</span>
      </div>
    `;

    // 2. Template for Video List and "Add Video" form
    let bodyHtml = '';
    if (isExpanded) {
      const videosHtml = playlist.videos.map(video => VideoItem({
        video,
        playlistId: playlist.id,
        currentVideoId,
        onSelect: this.props.onSelectVideo,
        onEdit: this.props.onEditVideo,
        onDelete: this.props.onDeleteVideo
      })).join('');

      const addFormHtml = (addingToPlaylist === playlist.id) ? `
        <div style="margin-top: 8px;">
          <input type="text" class="inlineInput video-input" autofocus
            placeholder="${step === 1 
              ? (editingVideoId ? `Edit title for ${editingName || 'video'}` : `Add title to ${playlist.name}`)
              : (editingVideoId ? `Edit URL for ${newVideoTitle || 'video'}` : `Add URL for ${newVideoTitle || 'video'}`)}"
            value="${step === 1 ? (newVideoTitle || '') : newVideoUrl}"
            style="border-color: #cc0000;">
          <div class="form-footer">Press Enter to ${step === 1 ? 'continue' : 'finish'}, Esc to cancel</div>
        </div>
      ` : `
        <button class="add-video-btn">+ Add Video to ${playlist.name}</button>
      `;

      bodyHtml = `<div class="videoList">${videosHtml}${addFormHtml}</div>`;
    }

    this.container.innerHTML = `${headerHtml}${bodyHtml}`;

    // Auto-focus logic (standard JS equivalent to React's autoFocus prop)
    const activeInput = this.container.querySelector('input[autofocus]');
    if (activeInput) setTimeout(() => activeInput.focus(), 0);
  }
}