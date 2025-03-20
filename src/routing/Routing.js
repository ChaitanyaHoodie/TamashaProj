import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProductDetails from '../screens/ProductDetails';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Or any other icon set you prefer

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom transition animation
const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

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

          // You can return any component here
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

// Default export
const Routing = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: forFade,
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="CartScreen" component={CartScreen} />

    </Stack.Navigator>
  );
};

export default Routing;