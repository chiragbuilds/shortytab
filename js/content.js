let overlay = null;
let currentIndex = 0;
let shortcuts = []; // Will be loaded from storage

// Create the overlay
function createOverlay() {
  if (overlay) return;
  
  overlay = document.createElement('div');
  overlay.id = 'shortytab-overlay';
  
  const container = document.createElement('div');
  container.className = 'shortcuts-container';
  
  // Check if there are shortcuts
  if (shortcuts.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No shortcuts configured. Add some in the extension options.';
    container.appendChild(emptyMessage);
  } else {
    // Create all shortcut items
    shortcuts.forEach((shortcut, index) => {
      const item = document.createElement('div');
      item.className = 'shortcut-item';
      if (index === currentIndex) {
        item.classList.add('highlighted');
      }
      
      item.innerHTML = `
        <div class="shortcut-name">${shortcut.name}</div>
        <div class="shortcut-hint">Press Y to select</div>
      `;
      
      // Add click handler
      item.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          action: "openShortcut",
          url: shortcut.url
        });
        removeOverlay();
      });
      
      container.appendChild(item);
    });
  }
  
  // Create keyboard hint
  const hint = document.createElement('div');
  hint.className = 'keyboard-hint';
  hint.innerHTML = `
    <span class="key">${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}</span> + 
    <span class="key">Shift</span> + 
    <span class="key">Y</span> to cycle • Release to open
  `;
  
  overlay.appendChild(container);
  overlay.appendChild(hint);
  document.body.appendChild(overlay);
  
  // Prevent body scrolling
  document.body.style.overflow = 'hidden';
  
  // Auto-scroll to highlighted item
  scrollToHighlighted();
}
function updateOverlay() {
  if (!overlay) return;
  
  const items = overlay.querySelectorAll('.shortcut-item');
  items.forEach((item, index) => {
    if (index === currentIndex) {
      item.classList.add('highlighted');
    } else {
      item.classList.remove('highlighted');
    }
  });
  
  // Auto-scroll to highlighted item
  scrollToHighlighted();
}
function scrollToHighlighted() {
  const container = overlay.querySelector('.shortcuts-container');
  const highlighted = overlay.querySelector('.shortcut-item.highlighted');
  
  if (container && highlighted) {
    const containerWidth = container.offsetWidth;
    const scrollLeft = container.scrollLeft;
    const itemLeft = highlighted.offsetLeft;
    const itemWidth = highlighted.offsetWidth;
    
    // Calculate the position to scroll to
    const scrollTo = itemLeft - (containerWidth / 2) + (itemWidth / 2);
    
    // Smooth scroll
    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    });
  }
}

// Load shortcuts from storage
function loadShortcuts() {
  chrome.storage.local.get(['shortcuts'], (result) => {
    shortcuts = result.shortcuts || [];
  });
}
function removeOverlay() {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.body.style.overflow = '';
    currentIndex = 0;
  }
}
// Initialize the content script
function initContentScript() {
  loadShortcuts();
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.shortcuts) {
      shortcuts = changes.shortcuts.newValue || [];
    }
  });
  
  // Use event capturing to bypass site event blockers
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('keyup', handleKeyUp, true);
}
function handleKeyDown(e) {
  // Check for Ctrl/Cmd + Shift + Y
  const isTrigger = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'y';
  
  if (isTrigger) {
    // Critical: Stop propagation immediately
    e.stopImmediatePropagation();
    e.preventDefault();
    
    if (!overlay) {
      createOverlay();
    } else {
      currentIndex = (currentIndex + 1) % shortcuts.length;
      updateOverlay();
    }
  }
  
  // Handle Escape key when overlay is visible
  if (overlay && e.key === 'Escape') {
    removeOverlay();
  }
}

function handleKeyUp(e) {
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
}
// [Rest of the functions remain the same: updateOverlay, scrollToHighlighted, removeOverlay, handleKeyDown, handleKeyUp]

// Initialize the content script
initContentScript();