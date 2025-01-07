import { Text, View, Button, TextInput, StyleSheet, Image, TouchableWithoutFeedback, Keyboard, Pressable, ImageBackground } from "react-native";
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
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen() {
  const [ctrlFText, setCtrlFText] = useState<string>('');
  const [permission, requestPermission] = useCameraPermissions(); 
  const [photoURI, setPhotoURI] = useState<string>('https://reactnative.dev/img/tiny_logo.png') // No original photo
  const [photo64, setPhoto64] = useState<string>('') // No original photo
  const [scanResult, setScanResult] = useState<any>()

  const [top, setTop] = useState();
  const [left, setLeft] = useState();
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();

  const [loading, setLoading] = useState<Boolean>(false);
  const [showHighlight, setShowHighlight] = useState<Boolean>(false);


  const [originalDim, setOriginalDim] = useState({width: 0, height: 0})
  const [newDim, setNewDim] = useState({width: 0, height: 0})

  useEffect(() => {
    // Fetch original dimensions of the image
    Image.getSize(
      photoURI,
      (width, height) => {
        setOriginalDim({ width, height });
        console.log("Old Dimensions: " + width + ", " + height);
      },
      (error) => {
        console.error('Error fetching image dimensions:', error);
      }
    );
  }, [photoURI]);


  const pickImage = async () => {
    // Ask for gallery permissions
    const imagePermissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (imagePermissionResult.granted === false) {
      console.log('Permission to access gallery is required!');
      return;
    }

    // Display image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:  ['images'],
      allowsMultipleSelection: false,
      // allowsEditing: true, // Needs to be enabled 
      // aspect: [4, 3],
      quality: 1,
    });

    // Process image
    if (!result.canceled) {
      // Convert to png
      const uri = result.assets[0].uri;
      const png = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      const png_uri = png.uri

      // Display image
      setPhotoURI(png_uri);

      // Get base64 and read text from the image
      const base64Image = await FileSystem.readAsStringAsync(png_uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setPhoto64(base64Image);

      // Read picture for text
      readPicture(base64Image);
    }
  };

  const takePicture = async () => {
    // Ask for camera permissions
    const cameraPermissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermissionResult.granted === false) {
      console.log('Permission to access camera is required!');
      return;
    }

    // Display camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes:  ['images'],
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    // Process image
    if (!result.canceled) {
      // Convert to png
      const uri = result.assets[0].uri;
      const png = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      const png_uri = png.uri

      // Display image
      setPhotoURI(png_uri);

      // Get base64 and read text from the image
      const base64Image = await FileSystem.readAsStringAsync(png_uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Read picture for text
      readPicture(base64Image);
    }
  }



  // const takePicture = async () => {
  //   if (cameraRef) {
  //     const photo = await cameraRef.takePictureAsync();
  //     if (photo) {
  //       console.log("Picture taken!");

  //       // Set URI
  //       // setPhotoURI(photo.uri);

  //       try {
  //         // Set base64
  //         const base64Image = await FileSystem.readAsStringAsync(photo.uri, {
  //           encoding: FileSystem.EncodingType.Base64,
  //         });

  //         // Displays the captured photo details
  //         console.log(photo); 

  //         // Read picture for text
  //         readPicture(base64Image);
  //       } catch (err) {
  //         console.log("Error getting base64: ", err);
  //       }
  //     }
  //   } else {
  //     console.log("Picture failed...");
  //   }
  // };

  const scaleX = newDim.width / originalDim.width;
  const scaleY = newDim.height / originalDim.height;

  const readPicture = async (base64Image: string) => {
    console.log("Reading...");
    setLoading(true);

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

      const text_data = response.data
      console.log(text_data);
      setScanResult(text_data)
      console.log("^ Response ");

      findWord(text_data)

      // console.log(ctrlFText);
      // const ind_of_text = words["text"].indexOf(ctrlFText);
      // console.log("Index of Text: " + ind_of_text);
      // const left = words["left"][ind_of_text];
      // const top = words["top"][ind_of_text];
      // const width = words["width"][ind_of_text];
      // const height = words["height"][ind_of_text];
      // console.log("Left: " + left + ", Top: " + top);

      // setLeft(left);
      // setTop(top);
      // setWidth(width);
      // setHeight(height);
      // setLoading(false);



      // 192.168.1.218  Windows IP
      // http://127.0.0.1:5000 Flask IP
      // http://192.168.1.218:5000/api/ocr

      // curl -X POST -F "image=@"C:\Users\shiro\Downloads\testimage.jpg"" https://hshiroz.pythonanywhere.com/

    } catch (err) {
      console.log(err);
    }
  };
  

  const findWord = async (scannedWordsField?: {field: string, values: string[]}) => {
    Keyboard.dismiss()
    
    if (ctrlFText === "") {
      setShowHighlight(false);
      setLoading(false);
      return;
    }
    
    const scannedWords = scannedWordsField || scanResult // Use setState if argument not passed

    console.log("Attempting to find " + ctrlFText + "...");
    const ind_of_text = scannedWords["text"].indexOf(ctrlFText);
    console.log("Index of Text: " + ind_of_text);

    if (ind_of_text < 0) {
      console.log("Given text, " + ctrlFText + " not found");
      setShowHighlight(false);
    } else {
      setShowHighlight(true);
      const left = scannedWords["left"][ind_of_text];
      const top = scannedWords["top"][ind_of_text];
      const width = scannedWords["width"][ind_of_text];
      const height = scannedWords["height"][ind_of_text];
      console.log("Left: " + left + ", Top: " + top);
  
      setLeft(left);
      setTop(top);
      setWidth(width);
      setHeight(height);
    }
    setLoading(false);
  }

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

                {ctrlFText == "" ? <Text style={styles.title}>Please input text.</Text> : <Text style={styles.title}>Searching for {ctrlFText}.</Text>}
                
                <Pressable 
                    onPress={pickImage}
                    style={styles.button} >
                    <Text> Pick Image </Text>
                </Pressable>

                <Pressable 
                    onPress={takePicture}
                    style={styles.button} >
                    <Text> Take Photo </Text>
                </Pressable>

                <Pressable 
                    onPress={() => findWord()}
                    style={styles.button} >
                    <Text> Rescan Photo </Text>
                </Pressable>
                

                <CameraView 
                    style={styles.camera} 
                    facing={ImagePicker.CameraType.back} />


                <ImageBackground 
                  source={{ uri: photoURI }} 
                  style={[styles.image, { aspectRatio: originalDim.width / originalDim.height }]}
                  resizeMode="contain" 
                  onLayout={(event) => {
                    const {width, height} = event.nativeEvent.layout;
                    setNewDim({width, height});
                    console.log("New: " + width + ", " + height);
                  }}>

                    {/* Display either loading or highlighted text */}
                    {loading && (
                      <View style={[
                        styles.loading,
                        {
                          top: 0,
                          left: 0,
                          width: newDim.width,
                          height: newDim.height,
                        },
                      ]}>
                        <Text style={styles.loading_text}> Loading... </Text>
                      </View>
                    )}
                    
                    {showHighlight && (
                      <View style={[
                        styles.highlighter,
                        {
                          top: top * scaleY,
                          left: left * scaleX,
                          width: width * scaleX,
                          height: height * scaleY,
                        },
                      ]}/>
                    )}
                </ImageBackground>

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
    // justifyContent: "center",
    alignItems: "center",
    // width: '100%',
    // resizeMode: 'cover',
    // borderBlockColor: 'red', // TODO
    // borderWidth: 10,
  },
  button: {
    // backgroundColor: "#f194ff",
    backgroundColor: "lightgray",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
  highlighter: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'yellow', // Color of the box border
    backgroundColor: 'rgba(255, 255, 0, 0.2)', // Optional: translucent fill color
  },
  loading: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'gray', // Color of the box border
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional: translucent fill color
  },
  loading_text: {
    textAlign: 'center',
    color: 'white',
    justifyContent: 'center',
  }
});