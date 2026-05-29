import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';

const Navbar = ({ onToggleLayout }) => {
  // State to track if the dropdown is open
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // State to track modals
  const [activeModal, setActiveModal] = useState(null);

  // TEST Permanent state management
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('setting_darkMode') === 'true';
  });

  const [autoplay, setAutoplay] = useState(() => {
    return localStorage.getItem('setting_autoplay') === 'true';
  });

  // Toggle menu function
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Close the menu if you click anywhere else on the screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle menu clicks
  const handleItemClick = (modalType) => {
    setActiveModal(modalType)
    setIsMenuOpen(false)
  }

  const closeModal = () => setActiveModal(null);

  // TEST Save changes
  const handleSaveChanges = () => {
    localStorage.setItem('setting_darkMode', darkMode);
    localStorage.setItem('setting_autoplay', autoplay);
    closeModal();
    
  };

  return (
    <nav className={styles.navbar}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        <div className={styles.logo}><span>YT</span> Clone</div>
      </div>

      {/* Center Section */}
      <div className={styles.centerSection}>
        <div className={styles.searchContainer}>
          <input type="text" placeholder="Search" className={styles.searchInput} />
          <button className={styles.searchButton}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20.87 20.17l-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <div className={styles.menuWrapper} ref={dropdownRef}>
          <button className={styles.actionButton} aria-label="More options" onClick={toggleMenu}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
            </svg>
          </button>

          {isMenuOpen && (
            <div className={styles.dropdownMenu}>
              {/* 3. Pass the 'settings' identifier on click */}
              <div className={styles.dropdownItem} onClick={() => handleItemClick('settings')}>
                Settings
              </div>
              <div className={styles.dropdownItem} onClick={() => handleItemClick('help')}>
                Help
              </div>
              <div className={styles.dropdownItem}>Feedback</div>
            </div>
          )}
        </div>

        <div className={styles.userAvatar}>{localStorage.getItem('chat_username') || '?'}</div>
      </div>

      {/* 4. Settings Modal Render */}
      {activeModal === 'settings' && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Settings</h2>
              <button className={styles.closeButton} onClick={closeModal}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <p>Customize your experience here:</p>
              
              {/* Controlled Dark Mode Checkbox */}
              <label className={styles.settingOption}>
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                /> Dark Mode (Always On)
              </label>
              
              {/* Controlled Autoplay Checkbox */}
              <label className={styles.settingOption}>
                <input 
                  type="checkbox" 
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                /> Autoplay Videos
              </label>
              
              {/* --- NEW: Trigger save function on click --- */}
              <button className={styles.saveButton} onClick={handleSaveChanges}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Quick Help Modal Render (Example of scaling) */}
      {activeModal === 'help' && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Help Center</h2>
              <button className={styles.closeButton} onClick={closeModal}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <p>Need assistance? Contact support at support@example.com</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;