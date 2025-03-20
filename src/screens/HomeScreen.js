import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, Modal, 
  ActivityIndicator, StatusBar, 
  RefreshControl, ScrollView ,StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import Appbar from '../components/Appbar';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Sort states
  const [sortOption, setSortOption] = useState('');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [categories, setCategories] = useState([]);

  // Fetch products function
  const loadProducts = async (pageNumber = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (pageNumber === 1) {
      setLoading(true);
    }
    
    try {
      const result = await fetchProducts(pageNumber);
      const newProducts = result.products;
      
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        if (refresh || pageNumber === 1) {
          setProducts(newProducts);
          
          // Extract unique categories for filter options
          const uniqueCategories = [...new Set(newProducts.map(product => product.category))];
          setCategories(uniqueCategories);
          
          // Apply filters and sorting
          applyFiltersAndSort(newProducts);
        } else {
          const updatedProducts = [...products, ...newProducts];
          setProducts(updatedProducts);
          
          // Update categories
          const allCategories = [...new Set(updatedProducts.map(product => product.category))];
          setCategories(allCategories);
          
          // Apply filters and sorting
          applyFiltersAndSort(updatedProducts);
        }
        setHasMore(result.hasMore);
      }
      setError(null);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFiltersAndSort = useCallback((productsToFilter = products) => {
    // First apply filters
    let filtered = [...productsToFilter];
    
    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }
    
    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter(product => product.rating >= minRating);
    }
    
    // Then apply sorting
    if (sortOption === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    }
    
    setFilteredProducts(filtered);
  }, [sortOption, selectedCategories, minRating, products]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setMinRating(0);
    applyFiltersAndSort();
  };

  const resetSorting = () => {
    setSortOption('');
    applyFiltersAndSort();
  };

  const resetAll = () => {
    resetFilters();
    resetSorting();
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [sortOption, selectedCategories, minRating, applyFiltersAndSort]);

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    loadProducts(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  };

  const renderItem = ({ item }) => (
    <ProductCard 
      product={item}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id, allData: item })}
    />
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007bff" />
      </View>
    );
  };

  const toggleCategorySelection = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const hasActiveFilters = () => {
    return selectedCategories.length > 0 || minRating > 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Appbar title="Products" />
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setSortModalVisible(true)}
        >
          <Icon name="keyboard-double-arrow-down" size={20} color="#007bff" />
          <Text style={styles.controlText}>Sort</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon name="filter-list" size={20} color="#007bff" />
          <Text style={styles.controlText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      {(sortOption || hasActiveFilters()) && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sortOption && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  Sort: {sortOption === 'price_asc' ? 'Price ↑' : 'Price ↓'}
                </Text>
              </View>
            )}
            
            {selectedCategories.map(category => (
              <View key={category} style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  Category: {category}
                </Text>
              </View>
            ))}
            
            {minRating > 0 && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  Rating: {minRating}+ ★
                </Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.clearButton} onPress={resetAll}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      
      {loading && products.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007bff']}
            />
          }
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="sentiment-dissatisfied" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No products match your filters</Text>
              <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {/* Sort Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Products</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sortOptions}>
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  !sortOption && styles.sortOptionSelected
                ]}
                onPress={() => setSortOption('')}
              >
                <Text style={styles.sortOptionText}>Default</Text>
                {!sortOption && <Icon name="menu" size={18} color="#007bff" />}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortOption === 'price_asc' && styles.sortOptionSelected
                ]}
                onPress={() => setSortOption('price_asc')}
              >
                <Text style={styles.sortOptionText}>Price: Low to High</Text>
                {sortOption === 'price_asc' && <Icon name="arrow-downward" size={18} color="#007bff" /> }
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortOption === 'price_desc' && styles.sortOptionSelected
                ]}
                onPress={() => setSortOption('price_desc')}
              >
                <Text style={styles.sortOptionText}>Price: High to Low</Text>
                {sortOption === 'price_desc' && <Icon name="arrow-upward" size={18} color="#007bff" />}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Products</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <ScrollView contentContainerStyle={styles.categoriesContainer}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategories.includes(category) && styles.categoryChipSelected
                    ]}
                    onPress={() => toggleCategorySelection(category)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategories.includes(category) && styles.categoryChipTextSelected
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {[0, 1, 2, 3, 4, 5].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingChip,
                      minRating === rating && styles.ratingChipSelected
                    ]}
                    onPress={() => setMinRating(rating)}
                  >
                    <Text
                      style={[
                        styles.ratingChipText,
                        minRating === rating && styles.ratingChipTextSelected
                      ]}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.resetFiltersButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetFiltersButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 8,
  },
  controlText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007bff',
  },
  activeFiltersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  filterChip: {
    backgroundColor: '#e8f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    color: '#007bff',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#6c757d',
  },
  productList: {
    // padding: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
  },
  resetButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sortOptions: {
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  sortOptionSelected: {
    backgroundColor: '#f0f7ff',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#495057',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
    marginBottom: 8,
  },
  ratingChipSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  ratingChipText: {
    fontSize: 14,
    color: '#495057',
  },
  ratingChipTextSelected: {
    color: '#fff',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resetFiltersButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  resetFiltersButtonText: {
    fontSize: 14,
    color: '#6c757d',
  },
  applyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: '#007bff',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default HomeScreen;