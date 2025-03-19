//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Appbar from '../components/Appbar';

// create a component
const MyComponent = () => {
    return (
        <SafeAreaView>
            <StatusBar barStyle="dark-content" />
            <Appbar title="Products" showBack />
        </SafeAreaView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
});

//make this component available to the app
export default MyComponent;
