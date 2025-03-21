import React, { useCallback } from 'react';
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProducts } from '../hooks/ProductFetchHook';
import { useProductFilters } from '../hooks/filterSortingHook';
import Appbar from '../components/Appbar';
import ProductCard from '../components/ProductCard';
import { SafeAreaView } from 'react-native-safe-area-context';


const HomeScreen = ({ navigation }) => {
  const {
    products,
    loading,
    error,
    refreshing,
    categories,
    handleRefresh,
    handleLoadMore
  } = useProducts();

  const {
    sortOption,
    setSortOption,
    selectedCategories,
    minRating,
    setMinRating,
    sortModalVisible,
    setSortModalVisible,
    filterModalVisible,
    setFilterModalVisible,
    hasActiveFilters,
    toggleCategorySelection,
    resetFilters,
    resetAll,
    filteredProducts
  } = useProductFilters(products);

  // Memoize render functions to prevent unnecessary re-renders
  const renderItem = useCallback(({ item }) => (
    <ProductCard 
      product={item}
      onPress={() => navigation.navigate('ProductDetails', { 
        productId: item.id, 
        allData: item 
      })}
    />
  ), [navigation]);

  const renderFooter = useCallback(() => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007bff" />
      </View>
    );
  }, [loading, refreshing]);

  // Active filters component
  const renderActiveFilters = useCallback(() => {
    if (!(sortOption || hasActiveFilters())) return null;
    
    return (
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
    );
  }, [sortOption, selectedCategories, minRating, hasActiveFilters, resetAll]);

  // Loading and error states
  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Appbar title="Products" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Appbar title="Products" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Appbar title="Products" />
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setSortModalVisible(true)}
          accessibilityLabel="Sort products"
          accessibilityHint="Opens sorting options"
        >
          <Icon name="keyboard-double-arrow-down" size={20} color="#007bff" />
          <Text style={styles.controlText}>Sort</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setFilterModalVisible(true)}
          accessibilityLabel="Filter products"
          accessibilityHint="Opens filtering options"
        >
          <Icon name="filter-list" size={20} color="#007bff" />
          <Text style={styles.controlText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      {renderActiveFilters()}
      
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
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetAll}
              accessibilityLabel="Reset all filters"
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
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
              <TouchableOpacity 
                onPress={() => setSortModalVisible(false)}
                accessibilityLabel="Close sort options"
              >
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
                accessibilityLabel="Default sort order"
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
                accessibilityLabel="Price from low to high"
              >
                <Text style={styles.sortOptionText}>Price: Low to High</Text>
                {sortOption === 'price_asc' && <Icon name="arrow-downward" size={18} color="#007bff" />}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortOption === 'price_desc' && styles.sortOptionSelected
                ]}
                onPress={() => setSortOption('price_desc')}
                accessibilityLabel="Price from high to low"
              >
                <Text style={styles.sortOptionText}>Price: High to Low</Text>
                {sortOption === 'price_desc' && <Icon name="arrow-upward" size={18} color="#007bff" />}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setSortModalVisible(false)}
              accessibilityLabel="Apply sort settings"
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
              <TouchableOpacity 
                onPress={() => setFilterModalVisible(false)}
                accessibilityLabel="Close filter options"
              >
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
                    accessibilityLabel={`Category ${category} ${selectedCategories.includes(category) ? 'selected' : 'not selected'}`}
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
                    accessibilityLabel={`${rating === 0 ? 'Any' : rating + '+'} star rating ${minRating === rating ? 'selected' : ''}`}
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
                accessibilityLabel="Reset all filters"
              >
                <Text style={styles.resetFiltersButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
                accessibilityLabel="Apply filters"
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