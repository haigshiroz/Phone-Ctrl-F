import { Dimensions, Text, View, Button, TextInput, StyleSheet, Image, TouchableWithoutFeedback, Keyboard, Pressable, ImageBackground, TouchableOpacity  } from "react-native";
import { useState, useEffect, useRef } from 'react'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import ActionSheet, {ActionSheetRef} from "react-native-actions-sheet";

// import Tesseract from 'tesseract.js';
// import TextRecognition from '@react-native-ml-kit/text-recognition';
// import TesseractOcr, { LANG_ENGLISH, LEVEL_WORD } from 'react-native-tesseract-ocr';
// import MlkitOcr from 'react-native-mlkit-ocr'
// import {VisionCloudTextRecognizerModelType} from '@react-native-firebase/ml-vision';
import * as FileSystem from 'expo-file-system';
import axios from 'axios'
import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function CameraScreen() {
  const [ctrlFText, setCtrlFText] = useState<string>('');
  const [permission, requestPermission] = useCameraPermissions(); 
  const [photoURI, setPhotoURI] = useState<string>('https://reactnative.dev/img/tiny_logo.png') // No original photo
  const [photo64, setPhoto64] = useState<string>('') // No original photo
  const [scanResult, setScanResult] = useState<any>()
  const actionSheetRef = useRef<ActionSheetRef>();

  const [top, setTop] = useState();
  const [left, setLeft] = useState();
  const [imageWidth, setImageWidth] = useState();
  const [imageHeight, setImageHeight] = useState();

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

  const inputTextChanged = (input: string) => {
    setCtrlFText(input); 
    console.log(input);
    findWord(undefined, input); 
  };

  const openActionSheet = () => {
    actionSheetRef.current?.setModalVisible(true);
  };

  const closeActionSheet = () => {
    actionSheetRef.current?.setModalVisible(false);
  };

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
    closeActionSheet();

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
  

  const findWord = async (scannedWordsField?: {field: string, values: string[]}, word?: string) => {        
    if (ctrlFText === "") {
      setShowHighlight(false);
      setLoading(false);
      return;
    }
    
    const scannedWords = scannedWordsField || scanResult // Use setState if argument not passed
    const word_to_search = word || ctrlFText

    console.log("Attempting to find " + ctrlFText + "...");
    const ind_of_text = scannedWords["text"].indexOf(word_to_search);
    console.log("Index of Text: " + ind_of_text);

    if (ind_of_text < 0) {
      console.log("Given text, " + word_to_search + " not found");
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
      setImageWidth(width);
      setImageHeight(height);
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
                    onChangeText={inputTextChanged}
                    style={styles.input} />

                {ctrlFText == "" ? <Text style={styles.title}>Please input text.</Text> : <Text style={styles.title}>Searching for {ctrlFText}.</Text>}
                
                <View
                  style={styles.imageContainer}>
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
                            width: imageWidth * scaleX,
                            height: imageHeight * scaleY,
                          },
                        ]}/>
                      )}
                  </ImageBackground>
                </View>

                <Pressable 
                    onPress={openActionSheet}
                    style={styles.button} >
                    <Text> Insert Image </Text>
                </Pressable>

                <ActionSheet 
                  ref={actionSheetRef}
                  gestureEnabled>
                    <View style={{
                      height: 200,
                    }}>
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
                    </View>
                </ActionSheet>

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
    alignContent: 'center',
    marginHorizontal: 16,
    maxHeight: height,
    maxWidth: width,
  },
  imageContainer: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
  },
  camera: {
    flex: 0,
    margin: 10,
  },
  image: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft:'auto',
    marginRight:'auto',
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
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
  },
  loading: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'gray', // Color of the box border
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  loading_text: {
    marginTop:'auto',
    marginBottom:'auto',
    textAlign: 'center',
    verticalAlign: 'middle',
    alignContent: 'center',
    color: 'white',
    justifyContent: 'center',
  }
});