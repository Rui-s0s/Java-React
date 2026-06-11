import React, { useState, useEffect, useRef } from 'react';
import styles from './LiveChat.module.css';

const LiveChat = ({ messages, onSendMessage }) => {
  const [localInput, setLocalInput] = useState('');
  const [userName, setUserName] = useState(localStorage.getItem('chat_username') || '');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && localInput.trim()) {
      if (!userName) {
        // Step 1: Set the username
        const name = localInput.trim();
        setUserName(name);
        localStorage.setItem('chat_username', name);
        setLocalInput('');
      } else {
        // Step 2: Send the message
        onSendMessage(localInput);
        setLocalInput('');
      }
    } else if (e.key === 'Escape') {
      setLocalInput('');
    }
  };

  return (
    <section className={styles.chatSection}>
      <div className={styles.header}>Live Chat</div>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id} className="message" style={{ marginBottom: '4px' }}> 
            <strong className={styles.messageUser}>{msg.author}:</strong>
            <span style={{ fontSize: '0.95em' }}>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Avatar color changes based on whether user is set */}
          <div style={{ 
            width: '24px', 
            height: '24px', 
            background: userName ? '#3ea6ff' : '#cc0000', 
            borderRadius: '50%', 
            flexShrink: 0, 
            fontSize: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {userName ? userName.charAt(0).toUpperCase() : '?'}
          </div>
          
          <input
            autoFocus={!userName}
            type="text"
            // Placeholder logic like your PlaylistItem
            placeholder={!userName ? "Enter your username to join..." : "Say something..."}
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.inlineInput} 
          />
        </div>

        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px', textAlign: 'right' }}>
          {!userName ? "Press Enter to set username" : "Press Enter to chat"}
        </div>
      </div>
    </section>
  );
};

export default LiveChat;