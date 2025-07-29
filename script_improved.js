import { generateProduct, addImageInput, addCustomField, saveDraft, loadDraftToForm, applyFieldVisibility } from './js/productGenerator.js';
import { showToast, loadLanguage, translateElement } from './js/utils.js';

// Global variables for enhanced functionality
let lastGeneratedData = null;
let isGenerating = false;

// Enhanced Sidebar Toggle with Animation
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const isOpen = sidebar.classList.contains("open");
  
  if (isOpen) {
    sidebar.classList.remove("open");
  } else {
    sidebar.classList.add("open");
  }
  
  // Add backdrop for mobile
  if (!isOpen) {
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      transition: opacity 0.3s ease;
    `;
    backdrop.onclick = toggleSidebar;
    document.body.appendChild(backdrop);
    
    // Animate backdrop
    setTimeout(() => {
      backdrop.style.opacity = '1';
    }, 10);
  } else {
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (backdrop) {
      backdrop.style.opacity = '0';
      setTimeout(() => backdrop.remove(), 300);
    }
  }
}

// Enhanced Logout with Confirmation
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    const logoutBtn = document.querySelector('a[onclick="logout()"]');
    if (logoutBtn) {
      logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
    }
    
    setTimeout(() => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("editDraftId");
      localStorage.removeItem("lastGeneratedData");
      showToast("Successfully logged out.", "success");
      window.location.replace("index.html");
    }, 1000);
  }
}

// Enhanced Generate Function with Professional Output
async function enhancedGenerate() {
  if (isGenerating) return;
  
  const generateBtn = document.getElementById('generateBtn');
  const outputDiv = document.getElementById('output');
  const outputContent = document.getElementById('outputContent');
  const previewDiv = document.getElementById('preview');
  const previewContent = document.getElementById('previewContent');
  const editBtn = document.getElementById('editBtn');
  
  // Validate required fields
  const name = document.getElementById('name').value.trim();
  if (!name) {
    showToast("Product name is required!", "error");
    document.getElementById('name').focus();
    return;
  }
  
  // Start loading state
  isGenerating = true;
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  generateBtn.disabled = true;
  
  try {
    // Collect all form data
    const formData = collectFormData();
    
    // Store the data for edit functionality
    lastGeneratedData = formData;
    localStorage.setItem('lastGeneratedData', JSON.stringify(formData));
    
    // Generate the product code
    const generatedCode = await generateProduct();
    
    if (generatedCode) {
      // Display in output section
      outputContent.textContent = generatedCode;
      outputDiv.style.display = 'block';
      
      // Generate and display preview
      const previewHTML = generatePreviewHTML(formData);
      previewContent.innerHTML = previewHTML;
      previewDiv.style.display = 'block';
      
      // Show edit button
      editBtn.style.display = 'inline-flex';
      
      // Scroll to output
      outputDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      showToast("Code generated successfully!", "success");
    } else {
      showToast("Failed to generate code. Please try again.", "error");
    }
    
  } catch (error) {
    console.error('Generation error:', error);
    showToast("An error occurred while generating code.", "error");
  } finally {
    // Reset button state
    isGenerating = false;
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate';
    generateBtn.disabled = false;
  }
}

// Collect all form data including custom fields
function collectFormData() {
  const data = {
    name: document.getElementById('name').value.trim(),
    code: document.getElementById('code').value.trim(),
    price: document.getElementById('price').value.trim(),
    offer: document.getElementById('offer').value.trim(),
    unit: document.getElementById('unit').value.trim(),
    qty: document.getElementById('qty').value.trim(),
    brand: document.getElementById('brand').value.trim(),
    size: document.getElementById('size').value.trim(),
    color: document.getElementById('color').value.trim(),
    delivery: document.getElementById('delivery').value.trim(),
    status: document.getElementById('status').value.trim(),
    category: document.getElementById('category').value.trim(),
    desc: document.getElementById('desc').value.trim(),
    video: document.getElementById('video').value.trim(),
    wa: document.getElementById('wa').value.trim(),
    images: [],
    customFields: []
  };
  
  // Collect image URLs
  const imageInputs = document.querySelectorAll('.img-url');
  imageInputs.forEach(input => {
    if (input.value.trim()) {
      data.images.push(input.value.trim());
    }
  });
  
  // Collect custom fields
  const customFieldGroups = document.querySelectorAll('.custom-field-group');
  customFieldGroups.forEach(group => {
    const key = group.querySelector('.custom-key').value.trim();
    const value = group.querySelector('.custom-value').value.trim();
    if (key && value) {
      data.customFields.push({ key, value });
    }
  });
  
  return data;
}

// Generate preview HTML
function generatePreviewHTML(data) {
  let html = `
    <div style="background: var(--medium-gray); padding: 20px; border-radius: 12px; border: 1px solid var(--border-gray);">
      <h3 style="color: var(--orange-accent); margin-bottom: 16px; font-size: 20px;">
        <i class="fas fa-box"></i> ${data.name}
      </h3>
  `;
  
  if (data.images.length > 0) {
    html += `
      <div style="margin-bottom: 16px;">
        <img src="${data.images[0]}" alt="${data.name}" 
             style="max-width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-gray);"
             onerror="this.style.display='none'">
      </div>
    `;
  }
  
  html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">`;
  
  if (data.price) {
    html += `
      <div style="background: var(--dark-gray); padding: 12px; border-radius: 8px; border: 1px solid var(--border-gray);">
        <strong style="color: var(--green-primary);">Price:</strong> ৳${data.price}
        ${data.offer ? `<br><small style="color: var(--muted-text);">Offer: ৳${data.offer}</small>` : ''}
      </div>
    `;
  }
  
  if (data.brand) {
    html += `
      <div style="background: var(--dark-gray); padding: 12px; border-radius: 8px; border: 1px solid var(--border-gray);">
        <strong style="color: var(--blue-primary);">Brand:</strong> ${data.brand}
      </div>
    `;
  }
  
  if (data.category) {
    html += `
      <div style="background: var(--dark-gray); padding: 12px; border-radius: 8px; border: 1px solid var(--border-gray);">
        <strong style="color: var(--purple-primary);">Category:</strong> ${data.category}
      </div>
    `;
  }
  
  if (data.status) {
    html += `
      <div style="background: var(--dark-gray); padding: 12px; border-radius: 8px; border: 1px solid var(--border-gray);">
        <strong style="color: var(--yellow-primary);">Status:</strong> ${data.status}
      </div>
    `;
  }
  
  html += `</div>`;
  
  if (data.desc) {
    html += `
      <div style="background: var(--dark-gray); padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid var(--border-gray);">
        <strong style="color: var(--orange-accent);">Description:</strong><br>
        <p style="margin-top: 8px; line-height: 1.6; color: var(--light-text);">${data.desc}</p>
      </div>
    `;
  }
  
  if (data.customFields.length > 0) {
    html += `
      <div style="background: var(--dark-gray); padding: 16px; border-radius: 8px; border: 1px solid var(--border-gray);">
        <strong style="color: var(--orange-accent); margin-bottom: 12px; display: block;">Additional Information:</strong>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
    `;
    
    data.customFields.forEach(field => {
      html += `
        <div style="background: var(--medium-gray); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-gray);">
          <strong style="color: var(--light-text); font-size: 13px;">${field.key}:</strong><br>
          <span style="color: var(--white-text); font-size: 14px;">${field.value}</span>
        </div>
      `;
    });
    
    html += `</div></div>`;
  }
  
  html += `</div>`;
  return html;
}

// Enhanced Copy to Clipboard Function
async function copyToClipboard() {
  const outputContent = document.getElementById('outputContent');
  const copyBtn = document.querySelector('.copy-btn-small');
  
  if (!outputContent.textContent.trim()) {
    showToast("No content to copy!", "warning");
    return;
  }
  
  try {
    // Update button state
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Copying...';
    copyBtn.disabled = true;
    
    await navigator.clipboard.writeText(outputContent.textContent);
    
    // Success feedback
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    showToast("Code copied to clipboard!", "success");
    
    // Reset button after delay
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.disabled = false;
    }, 2000);
    
  } catch (error) {
    console.error('Copy failed:', error);
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = outputContent.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      showToast("Code copied to clipboard!", "success");
    } catch (fallbackError) {
      showToast("Failed to copy. Please select and copy manually.", "error");
    }
    
    document.body.removeChild(textArea);
    
    // Reset button
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
    copyBtn.disabled = false;
  }
}

// Edit Functionality - Load saved data back to form
function editLastGenerated() {
  const savedData = localStorage.getItem('lastGeneratedData');
  
  if (!savedData) {
    showToast("No data available to edit!", "warning");
    return;
  }
  
  try {
    const data = JSON.parse(savedData);
    loadDataToForm(data);
    
    // Scroll to top of form
    document.querySelector('.form-wrapper').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    
    showToast("Data loaded for editing!", "info");
    
  } catch (error) {
    console.error('Edit load error:', error);
    showToast("Failed to load edit data!", "error");
  }
}

// Load data back to form fields
function loadDataToForm(data) {
  // Load basic fields
  document.getElementById('name').value = data.name || '';
  document.getElementById('code').value = data.code || '';
  document.getElementById('price').value = data.price || '';
  document.getElementById('offer').value = data.offer || '';
  document.getElementById('unit').value = data.unit || '';
  document.getElementById('qty').value = data.qty || '';
  document.getElementById('brand').value = data.brand || '';
  document.getElementById('size').value = data.size || '';
  document.getElementById('color').value = data.color || '';
  document.getElementById('delivery').value = data.delivery || '';
  document.getElementById('status').value = data.status || '';
  document.getElementById('category').value = data.category || '';
  document.getElementById('desc').value = data.desc || '';
  document.getElementById('video').value = data.video || '';
  document.getElementById('wa').value = data.wa || '';
  
  // Load images
  const imageContainer = document.getElementById('imageInputs');
  imageContainer.innerHTML = ''; // Clear existing
  
  if (data.images && data.images.length > 0) {
    data.images.forEach((imageUrl, index) => {
      const input = document.createElement('input');
      input.type = 'url';
      input.className = 'img-url';
      input.placeholder = `Image URL ${index + 1}`;
      input.value = imageUrl;
      imageContainer.appendChild(input);
    });
  } else {
    // Add at least one empty image input
    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'img-url';
    input.placeholder = 'Image URL';
    imageContainer.appendChild(input);
  }
  
  // Load custom fields
  const customContainer = document.getElementById('customFields');
  customContainer.innerHTML = ''; // Clear existing
  
  if (data.customFields && data.customFields.length > 0) {
    data.customFields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'custom-field-group';
      group.innerHTML = `
        <input type="text" class="custom-key" placeholder="Title e.g., Warranty" value="${field.key}">
        <input type="text" class="custom-value" placeholder="Value e.g., 3 Months" value="${field.value}">
        <button onclick="this.parentElement.remove()" type="button" title="Remove Field">
          <i class="fas fa-times"></i>
        </button>
      `;
      customContainer.appendChild(group);
    });
  } else {
    // Add at least one empty custom field
    const group = document.createElement('div');
    group.className = 'custom-field-group';
    group.innerHTML = `
      <input type="text" class="custom-key" placeholder="Title e.g., Warranty">
      <input type="text" class="custom-value" placeholder="Value e.g., 3 Months">
    `;
    customContainer.appendChild(group);
  }
}

// Clear output function
function clearOutput() {
  const outputDiv = document.getElementById('output');
  const previewDiv = document.getElementById('preview');
  const editBtn = document.getElementById('editBtn');
  
  outputDiv.style.display = 'none';
  previewDiv.style.display = 'none';
  editBtn.style.display = 'none';
  
  // Clear stored data
  lastGeneratedData = null;
  localStorage.removeItem('lastGeneratedData');
  
  showToast("Output cleared!", "info");
}

// Toggle preview mode
function togglePreviewMode() {
  const previewContent = document.getElementById('previewContent');
  const toggleBtn = document.querySelector('.preview-toggle-btn');
  
  if (previewContent.style.position === 'fixed') {
    // Exit fullscreen
    previewContent.style.cssText = '';
    toggleBtn.innerHTML = '<i class="fas fa-expand"></i> Full View';
    document.body.style.overflow = '';
  } else {
    // Enter fullscreen
    previewContent.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: var(--primary-black);
      z-index: 9999;
      overflow-y: auto;
      padding: 20px;
    `;
    toggleBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Full View';
    document.body.style.overflow = 'hidden';
  }
}

// Quick cache clear function
function quickCacheClear() {
  if (confirm("Are you sure you want to clear the cache?")) {
    try {
      // Clear various cache items
      localStorage.removeItem('lastGeneratedData');
      localStorage.removeItem('editDraftId');
      
      // Clear any other cached data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('draft_') || key.includes('cache_'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      showToast("Cache cleared successfully!", "success");
    } catch (error) {
      console.error('Cache clear error:', error);
      showToast("Failed to clear cache!", "error");
    }
  }
}

// Theme download function
function downloadTheme() {
  const downloadBtn = document.getElementById('downloadThemeBtn');
  const timerDiv = document.getElementById('downloadTimer');
  
  downloadBtn.style.display = 'none';
  timerDiv.style.display = 'block';
  
  let countdown = 10;
  timerDiv.innerHTML = `Download starts in ${countdown} seconds...`;
  
  const timer = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      timerDiv.innerHTML = `Download starts in ${countdown} seconds...`;
    } else {
      clearInterval(timer);
      timerDiv.innerHTML = 'Preparing download...';
      
      // Simulate download
      setTimeout(() => {
        showToast("Theme download started!", "success");
        downloadBtn.style.display = 'block';
        timerDiv.style.display = 'none';
      }, 1000);
    }
  }, 1000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Bind generate button
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', enhancedGenerate);
  }
  
  // Bind copy button
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyToClipboard);
  }
  
  // Bind edit button
  const editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.addEventListener('click', editLastGenerated);
  }
  
  // Check for saved data on load
  const savedData = localStorage.getItem('lastGeneratedData');
  if (savedData) {
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
      editBtn.style.display = 'inline-flex';
    }
  }
  
  // Apply field visibility if function exists
  if (typeof applyFieldVisibility === 'function') {
    applyFieldVisibility();
  }
  
  // Load language if function exists
  if (typeof loadLanguage === 'function') {
    loadLanguage();
  }
});

// Make functions globally available
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.copyToClipboard = copyToClipboard;
window.clearOutput = clearOutput;
window.togglePreviewMode = togglePreviewMode;
window.quickCacheClear = quickCacheClear;
window.downloadTheme = downloadTheme;
window.addImageField = addImageInput;
window.addCustomField = addCustomField;

// Export for module use
export {
  toggleSidebar,
  logout,
  enhancedGenerate,
  copyToClipboard,
  editLastGenerated,
  clearOutput,
  togglePreviewMode,
  quickCacheClear,
  downloadTheme
};

