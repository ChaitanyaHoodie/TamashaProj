import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProductCard from '../components/ProductCard';
import Appbar from '../components/Appbar';

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Sort states
  const [sortOption, setSortOption] = useState(''); // 'price_asc', 'price_desc'
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Fetch products function
  const fetchProducts = async (pageNumber = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (pageNumber === 1) {
      setLoading(true);
    }
    
    const limit = 10;
    const skip = (pageNumber - 1) * limit;
    
    try {
      const response = await axios.get(
        `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
      );
      
      // The API returns data in the format { products: [...], total: 100, skip: 10, limit: 10 }
      const newProducts = response.data.products;
      const total = response.data.total;
      
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        if (refresh || pageNumber === 1) {
          setProducts(newProducts);
          setFilteredProducts(newProducts);
        } else {
          const updatedProducts = [...products, ...newProducts];
          setProducts(updatedProducts);
          applySorting(updatedProducts);
        }
        // Check if we've reached the end
        setHasMore((skip + limit) < total);
      }
      setError(null);
      
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Apply sorting to products
  const applySorting = useCallback((productsToSort = products) => {
    // Start with the current products
    let sorted = [...productsToSort];
    
    // Apply sorting
    if (sortOption === 'price_asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      sorted.sort((a, b) => b.price - a.price);
    }
    
    setFilteredProducts(sorted);
  }, [sortOption, products]);

  // Reset sorting
  const resetSorting = () => {
    setSortOption('');
    setFilteredProducts(products);
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply sorting whenever sort parameters change
  useEffect(() => {
    applySorting();
  }, [sortOption, applySorting]);

  // Handle refresh pull-down
  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  // Handle loading more products
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  // Render each product item
  const renderItem = ({ item }) => (
    <ProductCard 
      product={item}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id, allData: item })}
    />
  );

  // Render footer with loading indicator
  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007bff" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Appbar title="Products" />
      
      {/* Sort Control */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setSortModalVisible(true)}
        >
          <Icon name="keyboard-double-arrow-down" size={20} color="#007bff" />
          <Text style={styles.controlText}>Sort</Text>
        </TouchableOpacity>
      </View>
      
      {/* Active Sort Display */}
      {sortOption && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                Sort: {sortOption === 'price_asc' ? 'Price ↑' : 'Price ↓'}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.clearButton} onPress={resetSorting}>
              <Text style={styles.clearButtonText}>Clear</Text>
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
            <Text style={styles.emptyText}>No products available</Text>
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
    </SafeAreaView>
  );
};

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  productList: {
    padding: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  controlText: {
    marginLeft: 5,
    color: '#007bff',
    fontWeight: '500',
  },
  activeFiltersContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  filterChip: {
    backgroundColor: '#e0f0ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipText: {
    color: '#007bff',
    fontSize: 12,
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sortOptions: {
    marginTop: 5,
    marginBottom: 15,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sortOptionSelected: {
    backgroundColor: '#f0f7ff',
  },
  sortOptionText: {
    fontSize: 16,
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

// Export the component
export default HomeScreen;