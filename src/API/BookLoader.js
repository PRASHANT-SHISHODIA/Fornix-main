import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';

const BookLoader = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/Lottie/book_loader.json')}
        autoPlay
        loop
        style={{ width: 220, height: 220 }}
      />
      <Text style={styles.text}>Opening Book...</Text>
    </View>
  );
};

export default BookLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3848',
  },
});
