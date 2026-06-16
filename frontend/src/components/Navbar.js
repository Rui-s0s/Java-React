import './Navbar.css';

export function Navbar(searchValue = '') {
  return `
    <nav class="navbar">
      <div class="logo">
        <span>YT</span> Clone
      </div>

      <input
        type="text"
        id="tag-search"
        class="tag-search"
        placeholder="Search tags..."
        value="${searchValue}"
      />
    </nav>
  `;
}