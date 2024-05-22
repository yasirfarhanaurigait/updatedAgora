import React,{useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createStackNavigator,NavigationContainer} from '@react-navigation/stack';


// import VideoScreen1 from '../screens/Project/VideoScreen1';

import AgoraUI from '../src/AgoraUI';
import VideoAgora from '../src/VideoAgora';
import FirstScreen from '../src/FirstScreen';
import AgoraNewUi from '../src/AgoraNewUi';
import LastestAgora from '../src/LastetAgora';


const Stack = createStackNavigator();
const options = '';
const StackNavigator = () => {
 
 
  return (
    <>
    <Stack.Navigator initialRouteName="FirstScreen">
      
     {/* <Stack.Screen name="VideoScreen1" component={VideoScreen1} /> */}
      
      <Stack.Screen name="VideoAgora" component={VideoAgora} />
      <Stack.Screen name="AgoraNewUi" component={AgoraNewUi} />
      <Stack.Screen name="AgoraUI" component={AgoraUI} />
      <Stack.Screen name="LastestAgora" component={LastestAgora} />
      <Stack.Screen name="FirstScreen" component={FirstScreen} />
      
    </Stack.Navigator>
      
  </>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
