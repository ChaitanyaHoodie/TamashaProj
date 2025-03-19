import React from 'react';
import { View, Text, StyleSheet} from 'react-native';

const Appbar = ({
  title,
  style,
  titleStyle,
}) => {
  
  return (
    <View style={[styles.container, style]}>
      <View >
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
 
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
});

export default Appbar;