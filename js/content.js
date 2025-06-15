let overlay = null;
let currentIndex = 0;
const shortcuts = [
  { name: "Google", url: "https://www.google.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "YouTube", url: "https://youtube.com" },
  { name: "OpenAI", url: "https://chat.openai.com" },
  { name: "Twitter", url: "https://twitter.com" },
  { name: "Reddit", url: "https://reddit.com" }
];

// Create the overlay
function createOverlay() {
  if (overlay) return;
  
  overlay = document.createElement('div');
  overlay.id = 'shortytab-overlay';
  
  // Apply all styles directly
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '2147483647';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  overlay.style.backdropFilter = 'blur(8px)';
  overlay.style.pointerEvents = 'none';
  overlay.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  
  const box = document.createElement('div');
  box.style.background = 'rgba(30, 30, 46, 0.95)';
  box.style.borderRadius = '16px';
  box.style.padding = '30px';
  box.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';
  box.style.minWidth = '300px';
  box.style.textAlign = 'center';
  box.style.pointerEvents = 'auto';
  box.style.border = '1px solid rgba(67, 97, 238, 0.3)';
  
  box.innerHTML = `
    <div style="
      font-size: 2.2rem; 
      font-weight: 700; 
      margin-bottom: 20px; 
      color: #f8f9fa;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    " id="shortcut-name">${shortcuts[currentIndex].name}</div>
    <div style="
      color: #a0a0c0; 
      font-size: 1rem; 
      line-height: 1.6;
    ">
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(67, 97, 238, 0.2);
        padding: 8px 15px;
        border-radius: 8px;
        margin: 10px 0;
        border: 1px solid rgba(67, 97, 238, 0.4);
      ">
        <span style="
          background: #2d2d4e;
          padding: 5px 12px;
          border-radius: 6px;
          font-weight: bold;
          box-shadow: 0 4px 0 #1a1a2e;
          color: #f8f9fa;
        ">${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}</span> + 
        <span style="
          background: #2d2d4e;
          padding: 5px 12px;
          border-radius: 6px;
          font-weight: bold;
          box-shadow: 0 4px 0 #1a1a2e;
          color: #f8f9fa;
        ">Shift</span> + 
        <span style="
          background: #2d2d4e;
          padding: 5px 12px;
          border-radius: 6px;
          font-weight: bold;
          box-shadow: 0 4px 0 #1a1a2e;
          color: #f8f9fa;
        ">Y</span> to cycle
      </div>
      <p>Release keys to open</p>
    </div>
  `;
  
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  
  // Prevent body scrolling
  document.body.style.overflow = 'hidden';
}

// Update overlay display
function updateOverlay() {
  if (!overlay) return;
  
  const nameElement = overlay.querySelector('#shortcut-name');
  if (nameElement) {
    nameElement.textContent = shortcuts[currentIndex].name;
    
    // Animation
    nameElement.style.transition = 'none';
    nameElement.style.opacity = '0';
    nameElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      nameElement.style.transition = 'all 0.4s ease';
      nameElement.style.opacity = '1';
      nameElement.style.transform = 'translateY(0)';
    }, 10);
  }
}

// Remove overlay
function removeOverlay() {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.body.style.overflow = '';
    currentIndex = 0;
  }
}

// Use event capturing to bypass site event blockers
document.addEventListener('keydown', handleKeyDown, true);
document.addEventListener('keyup', handleKeyUp, true);

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