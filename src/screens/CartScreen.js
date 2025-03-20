import React, { useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  initializeCart, 
  increaseQuantity, 
  decreaseQuantity, 
  removeFromCart 
} from '../redux/cartSlice';
import App from '../../App';
import Appbar from '../components/Appbar';
import { SafeAreaView } from 'react-native-safe-area-context';

const CartScreen = () => {
  // Use Redux for state management
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  // Load cart data from AsyncStorage when component mounts
  useEffect(() => {
    const loadCartData = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          // Initialize cart with stored data
          dispatch(initializeCart(JSON.parse(savedCart)));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    
    loadCartData();
  }, [dispatch]);

  // Save to AsyncStorage whenever cart changes
  useEffect(() => {
    const saveCartData = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };
    
    saveCartData();
  }, [cartItems]);

  // Cart actions using Redux Toolkit action creators
  const handleIncreaseQuantity = (id) => {
    dispatch(increaseQuantity(id));
  };

  const handleDecreaseQuantity = (id) => {
    dispatch(decreaseQuantity(id));
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <SafeAreaView style={{ flex: 1 }}>
     <Appbar title="Your Cart" />
     <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => handleDecreaseQuantity(item.id)}>
                    <Icon name="minus-circle-outline" size={24} color="#555" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleIncreaseQuantity(item.id)}>
                    <Icon name="plus-circle-outline" size={24} color="#555" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                  <Icon name="trash-can-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Total: ₹{totalPrice.toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={() => alert('Proceeding to checkout...')}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
   
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#777',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height:150
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#777',
    marginVertical: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CartScreen;