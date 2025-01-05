import { Text, View, Button, TextInput, StyleSheet, Image, TouchableWithoutFeedback, Keyboard, Pressable } from "react-native";
import { useState, useEffect } from 'react'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// import Tesseract from 'tesseract.js';
// import TextRecognition from '@react-native-ml-kit/text-recognition';
// import TesseractOcr, { LANG_ENGLISH, LEVEL_WORD } from 'react-native-tesseract-ocr';
// import MlkitOcr from 'react-native-mlkit-ocr'
// import {VisionCloudTextRecognizerModelType} from '@react-native-firebase/ml-vision';
import * as FileSystem from 'expo-file-system';
import axios from 'axios'

export default function CameraScreen() {
  const [ctrlFText, setCtrlFText] = useState('');
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions(); 
  const [photoURI, setPhotoURI] = useState<string>('https://reactnative.dev/img/tiny_logo.png') // No original photo
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null); // No original camera ref

  const pickImage = async () => {
    // Ask for gallery permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      console.log('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoURI(result.assets[0].uri);


      // Set base64
      const base64Image = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      }); // CONTRINUE HERE VERIFY THIS IS GOOD 

      // Read picture for text
      readPicture(base64Image);
    }
  };

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      if (photo) {
        console.log("Picture taken!");

        // Set URI
        // setPhotoURI(photo.uri);

        try {
          // Set base64
          const base64Image = await FileSystem.readAsStringAsync(photo.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Displays the captured photo details
          console.log(photo); 

          // Read picture for text
          readPicture(base64Image);
        } catch (err) {
          console.log("Error getting base64: ", err);
        }
      }
    } else {
      console.log("Picture failed...");
    }
  };

  const readPicture = async (base64Image: string) => {
    console.log("Reading...");

    try {
      const data = {
        data: base64Image,
      }

      // const response = await axios.post('https://hshiroz.pythonanywhere.com/', data, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      const response = await axios.post('https://hshiroz.pythonanywhere.com/', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response.data);
      console.log("^ Response ");
      // console.log("Setting new 64");
      // TODO remove
      // setPhotoURI('https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg')
      console.log("Done");

      // console.log(response.data );

      // 192.168.1.218  Windows IP
      // http://127.0.0.1:5000 Flask IP
      // http://192.168.1.218:5000/api/ocr

      // curl -X POST -F "image=@"C:\Users\shiro\Downloads\testimage.jpg"" https://hshiroz.pythonanywhere.com/

    } catch (err) {
      console.log(err);
    }
    
  };

  // TODO check permisions
  if (!permission) {
    // Camera permissions are still loading.
    return (
        <View>
            <Text>Waiting for permission...</Text>
        </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>

                <TextInput 
                    placeholder="Enter word you'd like to search" 
                    value={ctrlFText}
                    onChangeText={setCtrlFText}
                    style={styles.input} />

                <Pressable 
                    onPress={pickImage}
                    style={styles.button} >
                    <Text> Take Photo </Text>
                </Pressable>
                
                {ctrlFText == "" ? <Text style={styles.title}>Please input text.</Text> : <Text style={styles.title}>Searching for {ctrlFText}.</Text>}

                <CameraView 
                    style={styles.camera} 
                    facing={facing}
                    ref={(ref) => setCameraRef(ref)} />

                <Image source={{ uri: photoURI }} style={styles.image} />

            </SafeAreaView>
        </SafeAreaProvider>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 10,
    justifyContent: 'center',
    verticalAlign: 'top',
    borderWidth: 1,
    marginTop: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
  },
  camera: {
    flex: 0,
    margin: 10,
  },
  image: {
    flex: 2,
    width: '100%',
    resizeMode: 'cover',
  },
  button: {
    // backgroundColor: "#f194ff",
    backgroundColor: "lightgray",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
});