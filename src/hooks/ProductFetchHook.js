// useProducts.js - Hook for fetching and managing products data
import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);

  // Extract unique categories from products
  const extractCategories = useCallback((productList) => {
    const uniqueCategories = [...new Set(productList.map(p => p.category))];
    setCategories(prev => {
      const combinedCategories = [...new Set([...prev, ...uniqueCategories])];
      return combinedCategories;
    });
  }, []);

  // Fetch products function
  const loadProducts = useCallback(async (pageNumber = 1, refresh = false) => {
    if (refresh) setRefreshing(true);
    else if (pageNumber === 1) setLoading(true);
  
    try {
      const result = await fetchProducts(pageNumber);
      const newProducts = result.products;
  
      setProducts(prev => {
        const updatedProducts = refresh || pageNumber === 1 
          ? newProducts 
          : [...prev, ...newProducts];
        
        // Extract categories after updating products
        extractCategories(updatedProducts);
        
        return updatedProducts;
      });
  
      setHasMore(result.hasMore);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch products.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [extractCategories]);

  // Initial load
  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  // Handle pagination
  useEffect(() => {
    if (page > 1) {
      loadProducts(page);
    }
  }, [page, loadProducts]);

  // Refresh products
  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadProducts(1, true);
  }, [loadProducts]);

  // Load more products
  const handleLoadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setPage(prev => prev + 1);
  }, [loading, hasMore]);

  return {
    products,
    loading,
    error,
    refreshing,
    hasMore,
    categories,
    handleRefresh,
    handleLoadMore,
    setPage
  };
};
