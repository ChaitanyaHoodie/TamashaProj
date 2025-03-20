// src/routing/Routing.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProductDetails from '../screens/ProductDetails';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const CartStack = createStackNavigator();

// Custom transition animation
const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

// Create a dedicated Cart stack to avoid circular references
const CartStackNavigator = () => {
  return (
    <CartStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <CartStack.Screen name="CartMain" component={CartScreen} />
    </CartStack.Navigator>
  );
};

// Home stack for nested navigation
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: forFade,
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
    </Stack.Navigator>
  );
};

// Main tab navigation
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Cart') {
            iconName = 'shopping-cart';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartStackNavigator} 
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

// Root navigator
const Routing = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: forFade,
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default Routing;