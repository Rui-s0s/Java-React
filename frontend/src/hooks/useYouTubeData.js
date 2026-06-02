import { useState, useEffect } from 'react';

// Make sure this matches your Vite proxy or Spring server URL
const API_BASE = '/api'; 

export function useYouTubeData() {
  const [playlists, setPlaylists] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Video Form State
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoLink, setNewVideoLink] = useState(''); // Maps to 'url' in Spring
  const [step, setStep] = useState(1);

  // Playlist Form State
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [expandedPlaylists, setExpandedPlaylists] = useState([]);

  // Search playlist state
  const [searchQuery, setSearchQuery] = useState('');

  // THIS FOR TAGS
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState(null); // Tracks which tag is being edited
  const [editingTagValue, setEditingTagValue] = useState('');


  const tagsPopup = () => setIsTagsModalOpen(true);
  const closeTagsPopup = () => {
    setIsTagsModalOpen(false);
    setEditingTagIndex(null);
  };

  // 1. Fetch All Playlists (Spring returns a List<Playlist>)
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/playlists`);
      const data = await res.json();
      setPlaylists(data);
      
      // If we are currently watching a video, find its NEW version in the data
      if (currentVideo) {
        const freshVideo = data
          .flatMap(pl => pl.videos)
          .find(v => v.id === currentVideo.id);
        
        if (freshVideo) {
          setCurrentVideo(freshVideo); // This forces likes/comments to update
        }
      } else if (data.length > 0) {
        const firstPlaylistWithVideos = data.find(pl => pl.videos?.length > 0);
        if (firstPlaylistWithVideos) setCurrentVideo(firstPlaylistWithVideos.videos[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Spring Backend error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Add Comment (Updated for Spring /comments endpoint)
  const handleSendMessage = async (text) => {
    if (!currentVideo) return;

    const savedName = localStorage.getItem('chat_username') || "Anonymous";

    const res = await fetch(`${API_BASE}/videos/${currentVideo.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: text,
        author: savedName
      })
    });

    if (res.ok) await fetchData();
  };

  // 3. Like/Dislike (Updated for Spring @PatchMapping)
  const handleLikeDislike = async (type) => {
    if (!currentVideo) return;
    const endpoint = type === 'like' ? 'like' : 'dislike';
    
    const res = await fetch(`${API_BASE}/videos/${currentVideo.id}/${endpoint}`, {
      method: 'PATCH'
    });

    if (res.ok) {
      await fetchData(); // This now has a 'res' to check!
    }
  };

  // ADD TAGS
  const handleUpdateTag = async (index, newValue) => {
    if (!currentVideo) return;
    
    // Create a copy of the current video's tags
    const currentTagNames = (currentVideo.tags || []).map(tag => tag.name);
    
    if (newValue.trim() === '' || newValue.trim() === 'New Tag') {
      // If empty, remove the tag
      currentTagNames.splice(index, 1);
    } else {
      currentTagNames[index] = newValue.trim();
    }

    const res = await fetch(`${API_BASE}/videos/${currentVideo.id}/tags`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(currentTagNames) // Sends ["React", "Java"]
    });

    if (res.ok) {
      await fetchData(); // This now has a 'res' to check!
    }
    
    console.log(`UPDATE   ID: ${editingTagIndex}  VALUE: ${editingTagValue}`)
    setEditingTagIndex(null);
  };
  
  // FIX LOGIC HERE ITS HORRIBLE
  const handleAddTag = async () => {
    if (!currentVideo) return;

    const currentTagNames = (currentVideo.tags || []).map(tag => tag.name);
    
    // Add a placeholder tag and instantly set it to editing mode
    const updatedTagNames = [...currentTagNames, 'New Tag'];
    
    const res = await fetch(`${API_BASE}/videos/${currentVideo.id}/tags`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedTagNames)
    });

    console.log(`ADD   ID: ${editingTagIndex}  VALUE: ${editingTagValue}`)

    if (res.ok) {
      // 4. Reload your master state from the database so the video actually has the new tag
      await fetchData(); 
      
      // 5. Open editing mode on the newly added item at the very end of the list
      setEditingTagIndex(updatedTagNames.length - 1);
      setEditingTagValue('New Tag');
    }
  };

  const selectVideo = (video) => {
    setCurrentVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePlaylist = (id) => {
    setExpandedPlaylists(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // 4. Playlist Submission (Spring paths)
  const handlePlaylistSubmit = async (e) => {
    if (e.key === 'Enter' && newPlaylistName.trim()) {
      const url = editingPlaylistId ? `${API_BASE}/playlists/${editingPlaylistId}` : `${API_BASE}/playlists`;
      const method = editingPlaylistId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName })
      });
      
      if (res.ok) {
        setIsCreatingPlaylist(false);
        setEditingPlaylistId(null);
        setNewPlaylistName('');
        await fetchData();
      }
    } else if (e.key === 'Escape') {
      setIsCreatingPlaylist(false);
      setEditingPlaylistId(null);
      setNewPlaylistName('');
    }
  };

  const deletePlaylist = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this playlist?")) {
      const res = await fetch(`${API_BASE}/playlists/${id}`, { method: 'DELETE' });
      // Important: Spring returns 204 No Content, don't try to .json() it
      if (res.ok) await fetchData();
    }
  };

  // 5. Video Submission (Maps 'link' to 'url')
  const handleVideoSubmit = async (e, playlistId) => {
    if (e.key === 'Enter') {
      if (step === 1 && newVideoTitle.trim()) {
        setStep(2);
      } else if (step === 2 && newVideoLink.trim()) {
        const url = editingVideoId 
          ? `${API_BASE}/videos/${editingVideoId}` 
          : `${API_BASE}/playlists/${playlistId}/videos`;
        const method = editingVideoId ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: newVideoTitle, 
            url: newVideoLink // Changed from 'link' to 'url'
          })
        });

        if (res.ok) {
          setAddingToPlaylist(null);
          setEditingVideoId(null);
          setNewVideoTitle('');
          setNewVideoLink('');
          setStep(1);
          await fetchData();
        }
      }
    } else if (e.key === 'Escape') {
      setAddingToPlaylist(null);
      setEditingVideoId(null);
      setStep(1);
    }
  };

  // Helper logic for video editing/deletion
  const startEditPlaylist = (e, pl) => {
    e.stopPropagation();
    setEditingPlaylistId(pl.id);
    setNewPlaylistName(pl.name);
  };

  const startAddingVideo = (playlistId) => {
    setAddingToPlaylist(playlistId);
    setEditingVideoId(null);
    setStep(1);
    setNewVideoTitle('');
    setNewVideoLink('');
  };

  const startEditVideo = (e, playlistId, video) => {
    e.stopPropagation();
    setAddingToPlaylist(playlistId);
    setEditingVideoId(video.id);
    setNewVideoTitle(video.title);
    setNewVideoLink(video.url); // Use .url from Spring
    setStep(1);
  };

  const deleteVideo = async (e, playlistId, videoId) => {
    e.stopPropagation();
    if (window.confirm("Delete this video?")) {
      const res = await fetch(`${API_BASE}/playlists/${playlistId}/videos/${videoId}`, { 
        method: 'DELETE' 
      });

      if (res.ok) {
        // If the video being deleted is the one on screen, clear it
        // We use String() to be safe since Spring IDs are numbers
        if (currentVideo && String(currentVideo.id) === String(videoId)) {
          setCurrentVideo(null); 
        }
        await fetchData();
      }
    }
  };

  return {
    state: {
      playlists,
      currentVideo,
      showChat,
      loading,
      expandedPlaylists,
      addingToPlaylist,
      editingVideoId,
      newVideoTitle,
      newVideoLink,
      step,
      isCreatingPlaylist,
      editingPlaylistId,
      newPlaylistName,
      searchQuery,               // THIS FILTERS

      isTagsModalOpen,
      editingTagIndex,
      editingTagValue,
    },
    actions: {
      setShowChat,
      setNewVideoTitle,
      setNewVideoLink,
      setNewPlaylistName,
      setIsCreatingPlaylist,
      handleSendMessage,
      handleLikeDislike,
      selectVideo,
      togglePlaylist,
      handlePlaylistSubmit,
      deletePlaylist,
      startEditPlaylist,
      startAddingVideo,
      startEditVideo,
      deleteVideo,
      handleVideoSubmit,
      setSearchQuery,        // THIS FILTERS TOO 

      tagsPopup,
      closeTagsPopup,
      setEditingTagIndex,
      setEditingTagValue,
      handleUpdateTag,
      handleAddTag
    }
  };
}
