// useProductFilters.js - Hook for filtering and sorting products
import { useState, useCallback, useMemo } from 'react';

export const useProductFilters = (products) => {
  // Filter/sort states
  const [sortOption, setSortOption] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);
  
  // Modal visibility states
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return selectedCategories.length > 0 || minRating > 0;
  }, [selectedCategories, minRating]);

  // Toggle category selection
  const toggleCategorySelection = useCallback((category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  // Reset functions
  const resetFilters = useCallback(() => {
    setSelectedCategories([]);
    setMinRating(0);
  }, []);

  const resetSorting = useCallback(() => {
    setSortOption('');
  }, []);

  const resetAll = useCallback(() => {
    resetFilters();
    resetSorting();
  }, [resetFilters, resetSorting]);

  // Apply filters and sorting using useMemo for performance
  const filteredProducts = useMemo(() => {
    // First apply filters
    let filtered = [...products];
    
    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }
    
    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter(product => 
        product.rating >= minRating
      );
    }
    
    // Then apply sorting
    if (sortOption === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    }
    
    return filtered;
  }, [products, sortOption, selectedCategories, minRating]);

  return {
    // Filter/sort states
    sortOption,
    setSortOption,
    selectedCategories,
    minRating,
    setMinRating,
    
    // Modal states
    sortModalVisible,
    setSortModalVisible,
    filterModalVisible,
    setFilterModalVisible,
    
    // Methods
    hasActiveFilters,
    toggleCategorySelection,
    resetFilters,
    resetSorting,
    resetAll,
    
    // Filtered results
    filteredProducts
  };
};