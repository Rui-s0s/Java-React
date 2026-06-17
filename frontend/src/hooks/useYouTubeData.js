import { useState, useEffect, useMemo, useCallback} from 'react';

const API_BASE = '/api'; 

export function useYouTubeData() {
  // General State
  const [playlists, setPlaylists] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Video Form State
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoLink, setNewVideoLink] = useState('');
  const [step, setStep] = useState(1);

  // Playlist Form State
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [expandedPlaylists, setExpandedPlaylists] = useState([]);

  // Search playlist state
  const [searchQuery, setSearchQuery] = useState('');

  // State for tags
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);


  const tagsPopup = () => setIsTagsModalOpen(true);
  const closeTagsPopup = () => {
    setIsTagsModalOpen(false);
    setEditingTagIndex(null);
  };

  // 2. Wrap fetchData in useCallback so it handles filtering dynamically
  const fetchData = useCallback(async (tagsToFilter = []) => {
    try {
      let url = `${API_BASE}/playlists`;
      if (tagsToFilter.length > 0) {
        url += `?tags=${encodeURIComponent(tagsToFilter.join(','))}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setPlaylists(data);

      setCurrentVideo(prevVideo => {
        let nextCurrentVideo = prevVideo;
        
        if (nextCurrentVideo) {
          const freshVideo = data.flatMap(pl => pl.videos).find(v => v.id === nextCurrentVideo.id);
          if (freshVideo) nextCurrentVideo = freshVideo;
        } else if (data.length > 0) {
          const firstPlWithVideos = data.find(pl => pl.videos?.length > 0);
          if (firstPlWithVideos) nextCurrentVideo = firstPlWithVideos.videos[0];
        }
        
        return nextCurrentVideo;
      });

      setLoading(false);

    } catch (err) {
      console.error("Spring Backend error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedTags);
  }, [selectedTags, fetchData]);


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

  
  const handleLikeDislike = async (type) => {
    if (!currentVideo) return;
    const endpoint = type === 'like' ? 'like' : 'dislike';
    
    const res = await fetch(`${API_BASE}/videos/${currentVideo.id}/${endpoint}`, {
      method: 'PATCH'
    });

    if (res.ok) {
      await fetchData(); 
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
      body: JSON.stringify(currentTagNames) 
    });

    if (res.ok) {
      await fetchData(); 
    }
    // DEBUG STUFF
    console.log(`UPDATE   ID: ${editingTagIndex}  VALUE: ${editingTagValue}`)
    setEditingTagIndex(null);
  };
  
  // FIX LOGIC HERE ITS HORRIBLE
  // Cuando le das a new tag despues cambia uno de los tags ya existentes a "New Tag"
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

    // DEBUG STUFF
    console.log(`STILL NOT RES OK   ID: ${editingTagIndex}  VALUE: ${editingTagValue}`)

    if (res.ok) {
      await fetchData(); 
      
      // 5. Open editing mode on the newly added item at the very end of the list
      console.log(`RES OK   ID: ${editingTagIndex}  VALUE: ${editingTagValue}`)
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
      
      if (res.ok) await fetchData();
    }
  };


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
            url: newVideoLink 
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
    setNewVideoLink(video.url);
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

  // Busca playlist en que se encuentra el video actual y el indice dentro de esa playlist, si no encuentra devuelve -1
  const playlistIndiceVideo = () => {
    for (const playlist of playlists) {
      const index = playlist.videos.findIndex( video => video.id === currentVideo?.id );
      if (index !== -1) {
        return { playlist, index };
      }
    }
    return null;
  };

  // Para esconder los botones en caso de que no haya videos siguientes o anteriores
  // Revisa basado en el indice si es el ultimo video del array de playlist en que se encuentra para ir adelante
  const haySiguiente = () => {
    const result = playlistIndiceVideo();

    if (!result) return false;

    return result.index < result.playlist.videos.length - 1;
  };

  // Revisa basado en el indice si es el video 0 del array de playlist en que se encuentra para ir atras
  const hayAnterior = () => {
    const result = playlistIndiceVideo();

    if (!result) return false;

    return result.index > 0;
  };

  // Funciones para ir al siguiente y anterior video
  const irSiguiente = () => {
    const result = playlistIndiceVideo();

    if (!result) return;

    const { playlist, index } = result;

    if (index < playlist.videos.length - 1) {
      selectVideo(playlist.videos[index + 1]);
    }
  };

  const irAnterior = () => {
    const result = playlistIndiceVideo();

    if (!result) return;

    const { playlist, index } = result;

    if (index > 0) {
      selectVideo(playlist.videos[index - 1]);
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
      searchQuery,               

      isTagsModalOpen,
      editingTagIndex,
      editingTagValue,
      selectedTags,

      haySiguiente,
      hayAnterior
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
      setSearchQuery,       

      tagsPopup,
      closeTagsPopup,
      setEditingTagIndex,
      setEditingTagValue,
      handleUpdateTag,
      handleAddTag,
      setSelectedTags,

      irSiguiente,
      irAnterior
    }
  };
}
