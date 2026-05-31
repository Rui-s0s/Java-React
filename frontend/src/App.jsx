import React, { useRef, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import VideoPlayer from './components/VideoPlayer';
import LiveChat from './components/LiveChat';
import PlaylistsContainer from './components/Playlists/PlaylistsContainer';
import { useYouTubeData } from './hooks/useYouTubeData';

function App() {
  const { state, actions } = useYouTubeData();
  const chatEndRef = useRef(null);

  if (state.loading) {
    return (
      <div style={{ background: '#0f0f0f', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar 
      searchQuery={state.searchQuery} 
      setSearchQuery={actions.setSearchQuery} 
      />

      <main className={`main-layout ${!state.showChat ? 'hide-chat' : ''}`}>
        {state.currentVideo ? (
          <VideoPlayer 
            video={state.currentVideo}
            likes={state.currentVideo.likes || 0}
            dislikes={state.currentVideo.dislikes || 0}
            onLike={() => actions.handleLikeDislike('like')}
            onDislike={() => actions.handleLikeDislike('dislike')}
            showChat={state.showChat}
            onToggleChat={() => actions.setShowChat(!state.showChat)}
          />
        ) : (
          <div style={{ color: '#aaa', padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <h2>No videos found</h2>
            <p>Create a playlist and add a video to get started!</p>
          </div>
        )}

        {state.showChat && state.currentVideo && (
          <LiveChat 
            messages={state.currentVideo.comments || []}
            onSendMessage={actions.handleSendMessage}
            chatEndRef={chatEndRef}
          />
        )}

        <PlaylistsContainer 
          playlists={state.playlists}
          isCreating={state.isCreatingPlaylist}
          onStartCreate={() => actions.setIsCreatingPlaylist(true)}
          newPlaylistName={state.newPlaylistName}
          onNewPlaylistNameChange={actions.setNewPlaylistName}
          onPlaylistSubmit={actions.handlePlaylistSubmit}
          expandedPlaylists={state.expandedPlaylists}
          editingPlaylistId={state.editingPlaylistId}
          onTogglePlaylist={actions.togglePlaylist}
          onStartEditPlaylist={actions.startEditPlaylist}
          onDeletePlaylist={actions.deletePlaylist}
          currentVideoId={state.currentVideo?.id}
          onSelectVideo={actions.selectVideo}
          onStartAddVideo={actions.startAddingVideo}
          onEditVideo={actions.startEditVideo}
          onDeleteVideo={actions.deleteVideo}
          addingToPlaylist={state.addingToPlaylist}
          step={state.step}
          newVideoTitle={state.newVideoTitle}
          newVideoLink={state.newVideoLink}
          onNewVideoTitleChange={actions.setNewVideoTitle}
          onNewVideoLinkChange={actions.setNewVideoLink}
          onVideoSubmit={actions.handleVideoSubmit}
          editingVideoId={state.editingVideoId}
          searchQuery={state.searchQuery}                        // THIS SHOULD FILTER
        />
      </main>
    </div>
  );
}

export default App;
