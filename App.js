import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Routing from './src/routing/Routing';
import { Provider } from 'react-redux';
import store from './src/redux/store';

const App = () => {
  return (
    <Provider store={store}>
    <SafeAreaProvider>
      <NavigationContainer>
        <Routing />
      </NavigationContainer>
    </SafeAreaProvider>
    </Provider>
  );
};

export default App;