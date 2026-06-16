import './VideoPlayer.css';

export class VideoPlayer {
  constructor(props) {
    this.props = props;
    this.container = document.createElement('section');
    this.container.className = 'videoSection';

    this.render();
  }

  handleShare() {
    if (this.props.video?.url) {
      navigator.clipboard.writeText(this.props.video.url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
    }
  }

  update(newProps) {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  render() {
    const { 
      video, likes, dislikes, showChat,
      isTagsModalOpen, editingTagIndex, editingTagValue,
      onToggleTags, onCloseTags, onSetEditingTagIndex, 
      onSetEditingTagValue, onUpdateTag, onAddTag 
    } = this.props;

    const tags = video?.tags || [];

    this.container.innerHTML = `
      <div class="video-placeholder">
        <div class="placeholderContent">
          <div class="playIcon">▶️</div>
          <div class="nowPlaying">${video?.title || ''}</div>
          <div class="videoLink">${video?.url || ''}</div>
        </div>
      </div>
      <h1 class="video-title">${video?.title || ''}</h1>

      <div class="actions">
        <button class="actionBtn" id="like-btn">👍 ${likes.toLocaleString()}</button>
        <button class="actionBtn" id="dislike-btn">👎 ${dislikes.toLocaleString()}</button>
        <button class="actionBtn" id="share-btn">↪️ Share</button>
        <button class="actionBtn" id="tags-btn">🏷️ Edit tags</button>
        <button class="actionBtn" id="toggle-chat-btn">
          ${showChat ? '❌ Hide Chat' : '💬 Show Chat'}
        </button>
      </div>

      <div class="tagSection">
        ${tags.map(tag => `<span class="tag-badge">#${tag.name}</span>`).join(' ')}
      </div>

      ${isTagsModalOpen && video ? `
        <div class="modalBackdrop" id="modal-backdrop">
          <div class="modalContent" id="modal-content">
            <div class="modalHeader">
              <h3>Edit Video Tags</h3>
              <button class="closeBtn" id="modal-close-btn">&times;</button>
            </div>
            
            <div class="tagsContainer">
              ${tags.map((tag, index) => {
                const isEditingThisTag = editingTagIndex === index;
                
                if (isEditingThisTag) {
                  return `
                    <input
                      type="text"
                      class="tagInputField"
                      id="tag-input-${index}"
                      data-index="${index}"
                      value="${editingTagValue || ''}"
                    />
                  `;
                } else {
                  return `
                    <button class="tagButton" data-index="${index}" data-name="${tag.name}">
                      ${tag.name}
                    </button>
                  `;
                }
              }).join('')}

            ${editingTagIndex === tags.length ? `
              <input
                type="text"
                class="tagInputField"
                id="tag-input-new"
                value="${editingTagValue || ''}"
                placeholder="Enter tag..."
              />
            ` : ''}

            <button class="addTagBtn" id="add-tag-btn">+ Add Tag</button>
            </div>
          </div>
        </div>
      ` : ''} 
    `;

    // --- MANUAL EVENT BINDING ---
    
    // Core Actions
    this.container.querySelector('#like-btn').onclick = this.props.onLike;
    this.container.querySelector('#dislike-btn').onclick = this.props.onDislike;
    this.container.querySelector('#share-btn').onclick = () => this.handleShare();
    this.container.querySelector('#toggle-chat-btn').onclick = this.props.onToggleChat;
    this.container.querySelector('#tags-btn').onclick = onToggleTags;

    // Modal Active Setup
    if (isTagsModalOpen && video) {
      // Close triggers
      this.container.querySelector('#modal-backdrop').onclick = onCloseTags;
      this.container.querySelector('#modal-close-btn').onclick = onCloseTags;
      
      // Stop event bubbling on content area click so clicking inside doesn't close modal
      this.container.querySelector('#modal-content').onclick = (e) => e.stopPropagation();

      // Add tag button
      this.container.querySelector('#add-tag-btn').onclick = onAddTag;

      // Handle Tag Item List clicks/inputs dynamically
      tags.forEach((tag, index) => {
        const isEditingThisTag = editingTagIndex === index;

        if (isEditingThisTag) {
          const input = this.container.querySelector(`#tag-input-${index}`);
          if (input) {
            input.focus(); // Autofocus element replacement
            
            // Mirroring React's onChange
            input.oninput = (e) => onSetEditingTagValue(e.target.value);
            
            // Mirroring React's onBlur
            input.onblur = () => {
              if (input.value.trim() !== '') {
                onUpdateTag(index, input.value);
              }
            };
            
            // Mirroring React's onKeyDown hooks
            input.onkeydown = (e) => {
              if (e.key === 'Enter') onUpdateTag(index, input.value);
              if (e.key === 'Escape') onSetEditingTagIndex(null);
            };
          }
        } else {
          // Normal buttons setup
          const btn = this.container.querySelector(`.tagButton[data-index="${index}"]`);
          if (btn) {
            btn.onclick = () => {
              onSetEditingTagIndex(index);
              onSetEditingTagValue(tag.name);
            };
          }
        }
      });

      if (editingTagIndex === tags.length) {
        const input = this.container.querySelector('#tag-input-new');

        if (input) {
          setTimeout(() => input.focus(), 0);

          input.oninput = (e) => {
            onSetEditingTagValue(e.target.value);
          };

          // DO NOT save on blur for new tags
          input.onkeydown = (e) => {
            if (e.key === 'Enter') {
              onUpdateTag(tags.length, input.value);
            }

            if (e.key === 'Escape') {
              onSetEditingTagIndex(null);
            }
          };
        }
      }
    }
  }
}