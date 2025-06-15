
let overlay = null;
let currentIndex = 0;
const shortcuts = [
  { name: "Google", url: "https://www.google.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "YouTube", url: "https://youtube.com" },
  { name: "OpenAI", url: "https://chat.openai.com" }
];

function createOverlay() {
  if (overlay) return;
  
  overlay = document.createElement('div');
  overlay.id = 'shortytab-overlay';
  
 
  const box = document.createElement('div');

  
  box.innerHTML = `<p>🔁 ${shortcuts[currentIndex].name}<br>
  <small>Hold Ctrl+Shift, tap Y to cycle</small></p>`;
  
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  
  // Prevent body scrolling
  document.body.style.overflow = 'hidden';
}

function updateOverlay() {
  if (!overlay) return;
  const box = overlay.querySelector('div');
  box.innerHTML = `<p>🔁 ${shortcuts[currentIndex].name}<br>
  <small>Hold Ctrl+Shift, tap Y to cycle</small></p>`;
}

function removeOverlay() {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.body.style.overflow = '';
    currentIndex = 0;
  }
}

// Main keyboard listener
document.addEventListener('keydown', (e) => {
  // Check for Ctrl/Cmd + Shift + Y
  const isTrigger = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'y';
  
  if (isTrigger) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!overlay) {
      createOverlay();
    } else {
      currentIndex = (currentIndex + 1) % shortcuts.length;
      updateOverlay();
    }
    return;
  }
  
  // Escape key handling
  if (overlay && e.key === 'Escape') {
    removeOverlay();
  }
});

document.addEventListener('keyup', (e) => {
  if (!overlay) return;
  
  // Check for modifier keys being released
  if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Meta') {
    // Check if all modifiers are released
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      // Open the selected shortcut
      chrome.runtime.sendMessage({
        action: "openShortcut",
        url: shortcuts[currentIndex].url
      });
      removeOverlay();
    }
  }
});