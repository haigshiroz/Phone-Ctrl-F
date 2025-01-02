import { Text, View, Button, TextInput, StyleSheet, Image, TouchableWithoutFeedback, Keyboard, Pressable } from "react-native";
import { useState, useEffect } from 'react'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
// import Tesseract from 'tesseract.js';
// import TextRecognition from '@react-native-ml-kit/text-recognition';
// import TesseractOcr, { LANG_ENGLISH, LEVEL_WORD } from 'react-native-tesseract-ocr';
import MlkitOcr from 'react-native-mlkit-ocr'
// import {VisionCloudTextRecognizerModelType} from '@react-native-firebase/ml-vision';

export default function CameraScreen() {
  const [ctrlFText, setCtrlFText] = useState('');
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions(); 
  const [photoURI, setPhotoURI] = useState<string>('https://reactnative.dev/img/tiny_logo.png') // No original photo
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null); // No original camera ref

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      if (photo) {
          setPhotoURI(photo.uri);
          console.log(photo); // Displays the captured photo details
          readPicture();
      }
    }
  };

  const readPicture = async () => {
    console.log("Reading...");

    // Tesseract.recognize(
    //     photoURI,
    //     'eng',
    //     {
    //         logger: (m) => console.log(m),
    //     }
    // )
    // .then(({ data: { text } }) => {
    //     console.log("Text...");
    //     console.log("Text:", text);
    // })
    // .catch((err) => {
    //     console.error('Error during OCR:', err);
    // });




    // try {
    //     const result = await TextRecognition.recognize(photoURI)
    //     console.log('Recognized text:', result.text);
    // } catch (err: any) {
    //     console.log(err);
    // }



    // try {
    //   const tessOptions = { level: LEVEL_WORD }; // Recognize words
    //   const recognizedText = await TesseractOcr.recognizeTokens(photoURI, LANG_ENGLISH, tessOptions);
    //   console.log(recognizedText);
    // } catch (err) {
    //   console.log(err);
    // }

    try {
      const recognizedText = await MlkitOcr.detectFromFile(photoURI);
      console.log(recognizedText);
    } catch (err) {
      console.log(err);
    }

    // try {
    //   const recognizedText = await FirebaseMLVision.apply()
    //   console.log(recognizedText);
    // } catch (err) {
    //   console.log(err);
    // }
    
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
                    onPress={takePicture}
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
    flex: 2,
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