import { Slot } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from "react-native";

export default function RootLayout() {

  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white", // Replace with your preferred background color
  },
});