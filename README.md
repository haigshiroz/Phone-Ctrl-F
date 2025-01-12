# Introduction

![Demo](assets/DemoPhoneCtrlF.gif)

### Purpose and Usage
The goal of Phone Ctrl F is to search and highlight text from your phone's camera or image library for easy spotting. Whether that be finding an item on a receipt, an allergy in an ingredients list, or a name in a list, this app will help you easily skip the skimming.

# Development

### Environment: React Native and Expo
This app was developed on a Windows computer using React Native, Expo, and VS Code. The app was tested on an iPhone using the Expo Go app.

In this environment, only Expo-compatible libraries were used to allow development on iOS using Windows. This additionally ensures functionality on both iOS and Android. However, this also poses major limitations on what resources can be used.

The code for the app can be found in [app/index.tsx](app/index.tsx).

### Scope and Challenges
The original vision of Phone Ctrl F was to have a *live* camera feed that would automatically highlight the desired input as the text is found.

The first limitation is image quality. Using expo-camera severely reduced the quality of the picture taken which made the text from the picture unreadable by any OCR. Thus, our option was reduced to uploading a picture of higher quality, either by taking one on the spot or picking one from the device's image library.

The second limitation was finding a compatible OCR library. Any library I attempted to use in React Native produced some error, the most prominent being incompatibility with Expo. As a result, I opted to use [pytesseract](https://pypi.org/project/pytesseract/) (Python-Tesseract) and hosted a server on [PythonAnywhere](https://www.pythonanywhere.com/). From here, I used Axios, an HTTP client, to send over the image data to the server and receive all scanned text in the image.

### User Interface


To display the highlighted text, the coordinates of the top left corner of the text are provided along with the width and the height of the text. These values are scaled from the size of the original image to the size displayed in the app and are overlayed on top of the image.

Other quality-of-life UI considerations include a clean GUI, intuitive popup dismissals and user feedback. 

### Future Development  

The most exciting feature that this app could present is scanning text live. While this feature is possible (as seen in existing technologies like Google Translate's live translator), there would have to be much more development to bring this to an Expo app. One possibility is using Google Cloud's OCR which has strong prospects.

Due to the way pytesseract returns text data, the app currently cannot find text with multiple words. This feature could be implemented by checking the proximity and rows of each word to be searched in the query to provide multi-word highlighting.

Lastly, since this is my first React Native project, general code improvements can be made including UI structure, separating components, and polishing the uses of functions and states.