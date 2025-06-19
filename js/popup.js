// Default shortcuts
const defaultShortcuts = [
  { name: "Google", url: "https://www.google.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "YouTube", url: "https://youtube.com" },
  { name: "OpenAI", url: "https://chat.openai.com" },
  { name: "Twitter", url: "https://twitter.com" },
  { name: "Reddit", url: "https://reddit.com" }
];

// DOM Elements
const form = document.getElementById('shortcut-form');
const nameInput = document.getElementById('name-input');
const urlInput = document.getElementById('url-input');
const saveBtn = document.getElementById('save-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const shortcutList = document.getElementById('shortcut-list');

// State variables
let shortcuts = [];
let editingIndex = -1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadShortcuts();
  renderShortcuts();
});

// Form submission handler
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();
  
  if (!name || !url) return;
  
  // Ensure URL has protocol
  const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
  
  if (editingIndex > -1) {
    // Update existing shortcut
    shortcuts[editingIndex] = { name, url: formattedUrl };
    editingIndex = -1;
    saveBtn.textContent = 'Add Shortcut';
    cancelEditBtn.style.display = 'none';
  } else {
    // Add new shortcut
    shortcuts.push({ name, url: formattedUrl });
  }
  
  saveShortcuts();
  renderShortcuts();
  form.reset();
});

// Cancel edit handler
cancelEditBtn.addEventListener('click', () => {
  editingIndex = -1;
  saveBtn.textContent = 'Add Shortcut';
  cancelEditBtn.style.display = 'none';
  form.reset();
});

// Load shortcuts from storage
function loadShortcuts() {
  chrome.storage.local.get(['shortcuts'], (result) => {
    shortcuts = result.shortcuts || defaultShortcuts;
    
    // If no shortcuts exist, save defaults
    if (!result.shortcuts) {
      saveShortcuts();
    }
    
    renderShortcuts();
  });
}

// Save shortcuts to storage
function saveShortcuts() {
  chrome.storage.local.set({ shortcuts }, () => {
    // Notify content scripts about the update
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "updateShortcuts" });
      });
    });
  });
}

// Render shortcuts list
function renderShortcuts() {
  shortcutList.innerHTML = '';
  
  shortcuts.forEach((shortcut, index) => {
    const li = document.createElement('li');
    
    li.innerHTML = `
      <div class="shortcut-info">
        <div class="shortcut-name">${shortcut.name}</div>
        <div class="shortcut-url">${shortcut.url}</div>
      </div>
      <div class="actions">
        <button class="edit-btn" data-index="${index}">✏️</button>
        <button class="delete-btn" data-index="${index}">🗑️</button>
      </div>
    `;
    
    shortcutList.appendChild(li);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      startEditing(index);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      deleteShortcut(index);
    });
  });
}

// Start editing a shortcut
function startEditing(index) {
  editingIndex = index;
  const shortcut = shortcuts[index];
  
  nameInput.value = shortcut.name;
  urlInput.value = shortcut.url;
  
  saveBtn.textContent = 'Update Shortcut';
  cancelEditBtn.style.display = 'inline-block';
  nameInput.focus();
}

// Delete a shortcut
function deleteShortcut(index) {
  shortcuts.splice(index, 1);
  saveShortcuts();
  renderShortcuts();
  
  // Reset form if deleting the item being edited
  if (editingIndex === index) {
    editingIndex = -1;
    saveBtn.textContent = 'Add Shortcut';
    cancelEditBtn.style.display = 'none';
    form.reset();
  }
}