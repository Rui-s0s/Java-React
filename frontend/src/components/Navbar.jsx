import React from 'react';
import styles from './Navbar.module.css';

const Navbar = ({ onToggleLayout }) => {
  return (
    <nav className={styles.navbar}>
      {/* Left Section: Menu & Logo */}
      <div className={styles.leftSection}>
        <div className={styles.logo}>
          <span>YT</span> Clone
        </div>
      </div>

      {/* Center Section: Search Bar */}
      <div className={styles.centerSection}>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search" 
            className={styles.searchInput} 
          />
          <button className={styles.searchButton}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20.87 20.17l-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Right Section: User Actions */}
      <div className={styles.rightSection}>
        <button className={styles.actionButton} aria-label="More options">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
          </svg>
        </button>
        <div className={styles.userAvatar}>{localStorage.getItem('chat_username') || '?'}</div>
      </div>
    </nav>
  );
};

export default Navbar;