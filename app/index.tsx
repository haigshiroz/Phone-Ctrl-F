import { Dimensions, Switch, Text, View, TextInput, StyleSheet, Image, TouchableWithoutFeedback, Keyboard, Pressable, ImageBackground, TouchableOpacity  } from "react-native";
import { useState, useEffect, useRef } from 'react'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ActionSheet, {ActionSheetRef} from "react-native-actions-sheet";
import Ionicons from '@expo/vector-icons/Ionicons';

import * as FileSystem from 'expo-file-system';
import axios from 'axios'
import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function CameraScreen() {
  const [ctrlFText, setCtrlFText] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const toggleCaseSensitive = () => {
    const newState = !caseSensitive
    setCaseSensitive(newState);
    findWord(undefined, undefined, newState, undefined);
  };
  const [useSubstring, setUseSubstring] = useState<boolean>(false);
  const toggleUseSubstring = () => {
    const newState = !useSubstring
    setUseSubstring(newState);
    findWord(undefined, undefined, undefined, newState);
  };

  const [photoURI, setPhotoURI] = useState<string>('https://raw.githubusercontent.com/haigshiroz/Phone-Ctrl-F/refs/heads/main/assets/images/DefaultPhoto.jpg') // No original photo
  const [scanResult, setScanResult] = useState<any>()
  const imageActionSheetRef = useRef<ActionSheetRef>();
  const settingsActionSheetRef = useRef<ActionSheetRef>();

  const [boxes, setBoxes] = useState<any[]>();

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

  const openImageActionSheet = () => {
    imageActionSheetRef.current?.setModalVisible(true);
  };

  const closeImageActionSheet = () => {
    imageActionSheetRef.current?.setModalVisible(false);
  };

  const openSettingsActionSheet = () => {
    settingsActionSheetRef.current?.setModalVisible(true);
  };

  const closeSettingsActionSheet = () => {
    settingsActionSheetRef.current?.setModalVisible(false);
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

  const scaleX = newDim.width / originalDim.width;
  const scaleY = newDim.height / originalDim.height;

  const readPicture = async (base64Image: string) => {
    // Close the action sheets if they are in the way
    closeImageActionSheet();
    closeSettingsActionSheet(); 

    console.log("Reading...");
    setLoading(true);

    try {
      const data = {
        data: base64Image,
      }

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

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };
  

  const findWord = async (scannedWordsField?: {field: string, values: string[]}, word?: string, searchCaseSensitive?: boolean, searchUseSubstring?: boolean) => {        
    if (loading) {
      return;
    }

    console.log("Word = \"" + word + "\"");
    
    // word === "" is only true when we purposefully clear the input box
    if (word === "") {
      console.log("Trying to search for an empty string");
      setShowHighlight(false);
      return;
    }
    
    // Use setState if arguments aren't passed
    // Needed because setState updates too late
    const scannedWords = scannedWordsField || scanResult
    const word_to_search = word || ctrlFText
    const use_case_sensitive = searchCaseSensitive || caseSensitive 
    var use_substring = searchUseSubstring
    if (use_substring === undefined) {
      use_substring = useSubstring;
    }

    console.log("DEBUG: " + use_substring)
    
    if (!word_to_search) {
      console.log("Trying to search for an invalid string");
      setShowHighlight(false);
      return;
    }

    console.log("Attempting to find \"" + word_to_search + "\"...");

    var indxs_of_text: number[] = [];
    if (use_case_sensitive) {
      scannedWords["text"].forEach((word: string, index: number) => {
        if (use_substring) {
          if (word.includes(word_to_search)) {
            indxs_of_text.push(index)
          }
        } else {
          if (word === word_to_search) {
            indxs_of_text.push(index);
          }
        }
      });
    } else {
      scannedWords["text"].forEach((word: string, index: number) => {
        if (use_substring) {
          if (word.toLowerCase().includes(word_to_search.toLowerCase())) {
            indxs_of_text.push(index);
          }
        } else {
          if (word.toLowerCase() === word_to_search.toLowerCase()) {
            indxs_of_text.push(index);
          }
        }
      });
    }

    console.log(scannedWords["text"])

    if (indxs_of_text.length === 0) {
      console.log("Given text, " + word_to_search + " not found");
      setShowHighlight(false);
    } else {
      console.log("Indexes of \"" + word_to_search + "\": " + indxs_of_text);
      setShowHighlight(true);

      const highlight_boxes: any[] = []
      indxs_of_text.forEach((index_of_text: number, index: number) => {
        const highlight_box = { 
          id: index,
          left: scannedWords["left"][index_of_text], 
          top: scannedWords["top"][index_of_text],
          width: scannedWords["width"][index_of_text],
          height: scannedWords["height"][index_of_text],
        }

        highlight_boxes.push(highlight_box);
      });

      console.log(highlight_boxes);

      setBoxes(highlight_boxes);
    }
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>

              <View style={styles.inputSettingsContainer}>
                <TextInput 
                      placeholder="Enter a word you'd like to search for..." 
                      placeholderTextColor="gray"
                      value={ctrlFText}
                      onChangeText={inputTextChanged}
                      style={styles.input} />

                {ctrlFText.length > 0 && (
                  <TouchableOpacity onPress={() => {setCtrlFText(""); findWord(undefined, "");}} style={styles.remove_text_icon}>
                    <Text>x</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={openSettingsActionSheet} style={styles.settings_icon}>
                  <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
                
              </View>
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
                          <Text style={styles.loading_text}> Reading Image... </Text>
                        </View>
                      )}
                      
                      {showHighlight && (
                        <View style={[
                          styles.highlighterContainer,
                          {
                            top: 0,
                            left: 0,
                            width: newDim.width,
                            height: newDim.height,
                          }
                        ]}>
                          {boxes?.map((box) => (
                            <View key={box.id} style={[
                              styles.highlighter,
                              {
                                top: box.top * scaleY,
                                left: box.left * scaleX,
                                width: box.width * scaleX,
                                height: box.height * scaleY,
                              },
                            ]}/>
                          ))}

                        </View>
                      )}
                  </ImageBackground>
                </View>

                <Pressable 
                    onPress={openImageActionSheet}
                    style={styles.button} >
                    <Text> Insert Image </Text>
                </Pressable>

                <ActionSheet 
                  ref={imageActionSheetRef}
                  gestureEnabled>
                    <View style={{
                      height: 150,
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

                <ActionSheet 
                  ref={settingsActionSheetRef}
                  gestureEnabled>
                    <View>
                      <View style={styles.inputSettingsContainer}>
                        <Text style={styles.settings_text}> Match Case? </Text>
                        <Switch 
                          onValueChange={toggleCaseSensitive}
                          value={caseSensitive}/>
                      </View>

                      <View style={styles.inputSettingsContainer}>
                        <Text style={styles.settings_text}> Search substrings? </Text>
                        <Switch 
                          onValueChange={toggleUseSubstring}
                          value={useSubstring}/>
                      </View>
                    </View>
                </ActionSheet>

            </SafeAreaView>
        </SafeAreaProvider>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    justifyContent: 'center',
    verticalAlign: 'top',
    // borderWidth: 1,
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
  inputSettingsContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10,
    marginTop: 10,
  },
  highlighterContainer: {
    position: 'absolute',
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
  },
  remove_text_icon: {
    padding: 5,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settings_icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  settings_text: {
    marginTop:'auto',
    marginBottom:'auto',
    textAlign: 'center',
    verticalAlign: 'middle',
    alignContent: 'center',
    color: 'black',
    justifyContent: 'center',
  }
});