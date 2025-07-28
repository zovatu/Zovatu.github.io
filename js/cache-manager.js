// Cache Manager for Zovatu Software
// Manages cache data and provides clear functionality

import { showToast } from './utils.js';

export class CacheManager {
  constructor() {
    this.cacheKeys = [
      // Temporary data that can cause performance issues
      'tempProductData',
      'formValidationCache',
      'searchCache',
      'imagePreviewCache',
      'sessionTempData',
      'browserCache',
      'formAutoSave',
      'tempSettings',
      'previewCache',
      'exportTempData',
      'importTempData',
      'validationErrors',
      'tempUserPreferences',
      'scrollPositions',
      'modalStates',
      'tooltipCache',
      'animationStates',
      'tempThemeData',
      'debugLogs',
      'performanceMetrics'
    ];
    
    // Core data keys that should NOT be cleared
    this.protectedKeys = [
      'savedProducts',
      'userSettings',
      'currency',
      'whatsappLang',
      'language',
      'loggedInUser',
      'adminSettings',
      'productDrafts',
      'customFields',
      'shopSettings',
      'userPreferences'
    ];
  }

  // Calculate cache size
  getCacheSize() {
    let totalSize = 0;
    let cacheItemCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      if (this.isCacheKey(key)) {
        totalSize += key.length + (value ? value.length : 0);
        cacheItemCount++;
      }
    }
    
    return {
      size: this.formatBytes(totalSize),
      itemCount: cacheItemCount,
      rawSize: totalSize
    };
  }

  // Check if a key is a cache key
  isCacheKey(key) {
    return this.cacheKeys.some(cacheKey => 
      key.includes(cacheKey) || 
      key.startsWith('temp_') || 
      key.startsWith('cache_') ||
      key.includes('_temp') ||
      key.includes('_cache')
    );
  }

  // Format bytes to human readable format
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clear cache data
  clearCache() {
    try {
      let clearedItems = 0;
      let clearedSize = 0;
      const itemsToRemove = [];

      // Identify cache items to remove
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        
        if (this.isCacheKey(key) && !this.protectedKeys.includes(key)) {
          itemsToRemove.push(key);
          clearedSize += key.length + (value ? value.length : 0);
          clearedItems++;
        }
      }

      // Remove cache items
      itemsToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear session storage cache
      const sessionCacheKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (this.isCacheKey(key)) {
          sessionCacheKeys.push(key);
        }
      }
      
      sessionCacheKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });

      // Clear browser cache programmatically (if supported)
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }

      return {
        success: true,
        clearedItems,
        clearedSize: this.formatBytes(clearedSize),
        message: `Successfully cleared ${clearedItems} cache items (${this.formatBytes(clearedSize)})`
      };

    } catch (error) {
      console.error('Error clearing cache:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to clear cache data'
      };
    }
  }

  // Get cache statistics
  getCacheStats() {
    const cacheSize = this.getCacheSize();
    const totalLocalStorageSize = this.getTotalLocalStorageSize();
    
    return {
      cacheSize: cacheSize.size,
      cacheItems: cacheSize.itemCount,
      totalSize: totalLocalStorageSize.size,
      totalItems: totalLocalStorageSize.itemCount,
      cachePercentage: totalLocalStorageSize.rawSize > 0 ? 
        Math.round((cacheSize.rawSize / totalLocalStorageSize.rawSize) * 100) : 0
    };
  }

  // Get total localStorage size
  getTotalLocalStorageSize() {
    let totalSize = 0;
    let totalItems = localStorage.length;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalSize += key.length + (value ? value.length : 0);
    }
    
    return {
      size: this.formatBytes(totalSize),
      itemCount: totalItems,
      rawSize: totalSize
    };
  }

  // Check if cache cleanup is needed
  needsCleanup() {
    const stats = this.getCacheStats();
    return stats.cachePercentage > 30 || stats.cacheItems > 50;
  }

  // Auto cleanup if needed
  autoCleanup() {
    if (this.needsCleanup()) {
      const result = this.clearCache();
      if (result.success) {
        showToast('Auto cleanup completed: ' + result.message, 'info');
      }
      return result;
    }
    return { success: true, message: 'No cleanup needed' };
  }
}

// Create global instance
export const cacheManager = new CacheManager();

// Auto cleanup on page load (if needed)
window.addEventListener('load', () => {
  setTimeout(() => {
    cacheManager.autoCleanup();
  }, 2000);
});

