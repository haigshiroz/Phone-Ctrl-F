import { Text, View, StyleSheet, Button, Alert, Pressable } from "react-native";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';


export default function HomeScreen() {
  // Button Callback
  const buttonCallback = () => {
    Alert.alert("Button pressed");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.view}>
          <Text style={styles.title}>Edit app/index.tsx to edit this screen.</Text>
          <View>
            <Pressable 
              onPress={buttonCallback}
              style={styles.button} >
              <Text> Camera </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  button: {
    // backgroundColor: "#f194ff",
    backgroundColor: "lightgray",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
  },
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
});