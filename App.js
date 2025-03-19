import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Routing from './src/routing/Routing';

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Routing />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;