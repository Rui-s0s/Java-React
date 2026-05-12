import React from 'react';
import styles from './VideoPlayer.module.css';

const VideoPlayer = ({ video, likes, dislikes, onLike, onDislike, showChat, onToggleChat }) => {
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
        <button className={styles.actionBtn} onClick={onToggleChat}>
          {showChat ? '❌ Hide Chat' : '💬 Show Chat'}
        </button>
      </div>
    </section>
  );
};

export default VideoPlayer;
