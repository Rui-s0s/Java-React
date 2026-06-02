import React from 'react';
import PlaylistItem from './PlaylistItem';
import styles from './Playlists.module.css';

const PlaylistsContainer = ({
  searchQuery = '', // 1. Accept the searchQuery prop (default to empty string) 
  playlists, 
  isCreating, 
  onStartCreate, 
  newPlaylistName, 
  onNewPlaylistNameChange, 
  onPlaylistSubmit,
  expandedPlaylists,
  editingPlaylistId,
  onTogglePlaylist,
  onStartEditPlaylist,
  onDeletePlaylist,
  currentVideoId,
  onSelectVideo,
  onStartAddVideo,
  onEditVideo,
  onDeleteVideo,
  addingToPlaylist,
  step,
  newVideoTitle,
  newVideoLink,
  onNewVideoTitleChange,
  onNewVideoLinkChange,
  onVideoSubmit,
  editingVideoId
  }) => {

  const filteredPlaylists = !searchQuery.trim() 
    ? playlists : playlists.filter((playlist) => 
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase()
  ));

    
  return (
    <section className={styles.descriptionSection}>
      <div className={styles.playlistsContainer}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>Playlists</h3>
          {!isCreating && (
            <button 
              onClick={onStartCreate}
              className={styles.newBtn}
            >
              + New Playlist
            </button>
          )}
        </div>

        {isCreating && (
          <div style={{ marginBottom: '16px' }}>
            <input
              autoFocus
              type="text"
              placeholder="Enter playlist name..."
              value={newPlaylistName}
              onChange={(e) => onNewPlaylistNameChange(e.target.value)}
              onKeyDown={onPlaylistSubmit}
              className={styles.inlineInput}
            />
            <div className={styles.formFooter}>
              Press Enter to create, Esc to cancel
            </div>
          </div>
        )}

        {filteredPlaylists.map((playlist) => (
          <PlaylistItem 
            key={playlist.id}
            playlist={playlist}
            isExpanded={expandedPlaylists.includes(playlist.id)}
            isEditing={editingPlaylistId === playlist.id}
            onToggle={onTogglePlaylist}
            onStartEdit={onStartEditPlaylist}
            onDelete={onDeletePlaylist}
            editingName={newPlaylistName}
            onEditingNameChange={onNewPlaylistNameChange}
            onEditSubmit={onPlaylistSubmit}
            currentVideoId={currentVideoId}
            onSelectVideo={onSelectVideo}
            onStartAddVideo={onStartAddVideo}
            onEditVideo={onEditVideo}
            onDeleteVideo={onDeleteVideo}
            addingToPlaylist={addingToPlaylist}
            step={step}
            newVideoTitle={newVideoTitle}
            newVideoLink={newVideoLink}
            onNewVideoTitleChange={onNewVideoTitleChange}
            onNewVideoLinkChange={onNewVideoLinkChange}
            onVideoSubmit={onVideoSubmit}
            editingVideoId={editingVideoId}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </section>
  );
};

export default PlaylistsContainer;
