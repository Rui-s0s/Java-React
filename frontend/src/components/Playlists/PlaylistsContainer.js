import { PlaylistItem } from './PlaylistItem.js';
import './Playlists.css';

export class PlaylistsContainer {
  constructor(props) {
    this.props = props;
    this.playlistInstances = []; // Store child component objects
    
    this.container = document.createElement('section');
    this.container.className = 'description-section';

    this.initEvents();
    this.render();
  }

  update(newProps) {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  initEvents() {
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('newBtn')) {
        this.props.onStartCreate();
      }
    });

    this.container.addEventListener('keydown', (e) => {
      const isPlaylistCreateInput = e.target.classList.contains('playlist-create-input');
      if (!isPlaylistCreateInput) return; // Only handle the specific "New Playlist" top-level input
      
      if (e.key === 'Enter' || e.key === 'Escape') {
        this.props.onPlaylistSubmit(e);
      }
    });
  }

  render() {
    const { playlists, isCreating, newPlaylistName, expandedPlaylists, editingPlaylistId } = this.props;

    // 1. Create the shell HTML
    this.container.innerHTML = `
      <div class="playlists-wrapper">
        <div class="headerRow">
          <h3 class="title">Playlists</h3>
          ${!isCreating ? `<button class="newBtn">+ New Playlist</button>` : ''}
        </div>

        ${isCreating ? `
          <div style="margin-bottom: 16px;">
            <input type="text" class="inlineInput playlist-create-input" 
                   placeholder="Enter playlist name..." autofocus value="${newPlaylistName}">
            <div class="form-footer">Press Enter to create, Esc to cancel</div>
          </div>
        ` : ''}

        <div class="playlist-items-list"></div>
      </div>
    `;

    // 2. Render Children (The PlaylistItem instances)
    const listContainer = this.container.querySelector('.playlist-items-list');
    
    playlists.forEach(playlist => {
    const itemComponent = new PlaylistItem({
      playlist,
      isExpanded: expandedPlaylists.includes(playlist.id),
      isEditing: editingPlaylistId === playlist.id,
      editingName: this.props.newPlaylistName,
      
      onToggle: this.props.onTogglePlaylist,
      onStartEdit: this.props.onStartEditPlaylist,
      onDelete: this.props.onDeletePlaylist,
      onSelectVideo: this.props.onSelectVideo,
      onStartAddVideo: this.props.onStartAddVideo,
      onEditVideo: this.props.onEditVideo,
      onDeleteVideo: this.props.onDeleteVideo,
      onVideoSubmit: this.props.onVideoSubmit,
      
      currentVideoId: this.props.currentVideoId,
      addingToPlaylist: this.props.addingToPlaylist,
      step: this.props.step,
      newVideoTitle: this.props.newVideoTitle,
      newVideoUrl: this.props.newVideoUrl,
      editingVideoId: this.props.editingVideoId,
      onEditSubmit: this.props.onPlaylistSubmit
    });

    listContainer.appendChild(itemComponent.container);
  });
  }
}