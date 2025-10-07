import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useStorage } from '@/providers/storage-provider';
import { Product } from '@/constants/products';

const WISHLIST_STORAGE_KEY = 'banda_wishlist';

export const [WishlistProvider, useWishlist] = createContextHook(() => {
  const storage = useStorage();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadWishlist = useCallback(async () => {
    try {
      const wishlistData = await storage.getItem(WISHLIST_STORAGE_KEY);
      if (wishlistData) {
        setWishlistItems(JSON.parse(wishlistData));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const saveWishlist = useCallback(async (items: Product[]) => {
    if (!Array.isArray(items)) return;
    try {
      await storage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }, [storage]);

  const addToWishlist = useCallback((product: Product) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev;
      
      const newItems = [...prev, product];
      saveWishlist(newItems);
      return newItems;
    });
  }, [saveWishlist]);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistItems(prev => {
      const newItems = prev.filter(item => item.id !== productId);
      saveWishlist(newItems);
      return newItems;
    });
  }, [saveWishlist]);

  const toggleWishlist = useCallback((product: Product) => {
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [wishlistItems, addToWishlist, removeFromWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    saveWishlist([]);
  }, [saveWishlist]);

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  return useMemo(() => ({
    wishlistItems,
    isLoading,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  }), [
    wishlistItems,
    isLoading,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  ]);
});