import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  private readonly STORAGE_PREFIX = 'product_image_';

  /**
   * Get product image URL from local storage or return assets path
   */
  getProductImageUrl(productId: string): string {
    const storedImage = localStorage.getItem(`${this.STORAGE_PREFIX}${productId}`);
    if (storedImage) {
      return storedImage;
    }
    // Fallback to assets folder
    return `assets/products/${productId}.jpg`;
  }

  /**
   * Store product image URL in local storage
   */
  storeProductImage(productId: string, imageUrl: string): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${productId}`, imageUrl);
    } catch (error) {
      console.warn('Failed to store image in local storage:', error);
    }
  }

  /**
   * Check if product image exists in local storage
   */
  hasProductImage(productId: string): boolean {
    return localStorage.getItem(`${this.STORAGE_PREFIX}${productId}`) !== null;
  }

  /**
   * Remove product image from local storage
   */
  removeProductImage(productId: string): void {
    localStorage.removeItem(`${this.STORAGE_PREFIX}${productId}`);
  }

  /**
   * Convert image file to base64 and store in local storage
   */
  async storeImageAsBase64(productId: string, file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.storeProductImage(productId, base64String);
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Load image and store in local storage if successful
   */
  async loadAndStoreImage(productId: string, imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Image loaded successfully, try to store it
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            this.storeProductImage(productId, base64);
            resolve(true);
          } catch (error) {
            // If canvas conversion fails, just store the URL
            this.storeProductImage(productId, imageUrl);
            resolve(true);
          }
        } else {
          // Fallback: store the URL
          this.storeProductImage(productId, imageUrl);
          resolve(true);
        }
      };
      img.onerror = () => {
        resolve(false);
      };
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });
  }
}

