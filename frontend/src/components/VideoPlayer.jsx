import React from 'react';
import styles from './VideoPlayer.module.css';

const VideoPlayer = ({ 
  video, 
  likes, 
  dislikes, 
  onLike, 
  onDislike, 
  showChat, 
  onToggleChat,

  isTagsModalOpen,
  onToggleTags,      
  onCloseTags,        
  editingTagIndex,
  editingTagValue,
  onSetEditingTagIndex,
  onSetEditingTagValue,
  onUpdateTag,
  onAddTag,

  irAnterior,
  irSiguiente,

  haySiguiente,
  hayAnterior
  }) => {
  const handleShare = () => {
    if (video?.url) {
      navigator.clipboard.writeText(video.url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  return (
    <section className={styles.videoSection}>
      <div className={styles.placeholder}>
        <div className={styles.placeholderContent}>
          <div className={styles.playIcon}>▶️</div>
          <div className={styles.nowPlaying}>{video.title}</div>
          <div className={styles.videoLink}>{video.url}</div>
        </div>
      </div>
      <h1 className={styles.title}>{video.title}</h1>
      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={onLike}>
          👍 {likes.toLocaleString()}
        </button>
        <button className={styles.actionBtn} onClick={onDislike}>
          👎 {dislikes.toLocaleString()}
        </button>
        <button className={styles.actionBtn} onClick={handleShare}>
          ↪️ Share
        </button>
        <button className={styles.actionBtn} onClick={onToggleTags}>
          🏷️ Edit tags
        </button>

        <button className={styles.actionBtn} onClick={irAnterior} disabled={!hayAnterior()}>
          ⏮ Anterior
        </button>
        <button className={styles.actionBtn} onClick={irSiguiente} disabled={!haySiguiente()}>
          ⏭ Siguiente
        </button>

        <button className={styles.actionBtn} onClick={onToggleChat}>
          {showChat ? '❌ Hide Chat' : '💬 Show Chat'}
        </button>
      </div>
      <div className={styles.tagSection}>
         {(video.tags || []).map((tag, index) => {
          return (
            <ul key={index}>
              #{tag.name}
            </ul>
          )
         }
         )}
      </div>

      {isTagsModalOpen && video && (
        <div className={styles.modalBackdrop} onClick={onCloseTags}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Video Tags</h3>
              <button className={styles.closeBtn} onClick={onCloseTags}>&times;</button>
            </div>
            
            <div className={styles.tagsContainer}>
              {(video.tags || []).map((tag, index) => {
                const isEditingThisTag = editingTagIndex === index;

                return isEditingThisTag ? (
                  <input
                    key={index}
                    autoFocus
                    type="text"
                    className={styles.tagInputField}
                    value={editingTagValue}
                    onChange={(e) => onSetEditingTagValue(e.target.value)}
                    onBlur={() => onUpdateTag(index, editingTagValue)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onUpdateTag(index, editingTagValue);
                      if (e.key === 'Escape') onSetEditingTagIndex(null);
                    }}
                  />
                ) : (
                  <button
                    key={index}
                    className={styles.tagButton}
                    onClick={() => {
                      onSetEditingTagIndex(index);
                      onSetEditingTagValue(tag.name); 
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}

              <button className={styles.addTagBtn} onClick={onAddTag}>
                + Add Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoPlayer;
