import React,{useState, useEffect, useRef} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import PipHandler, {usePipModeListener} from 'react-native-pip-android';

// Screen component
const FirstScreen = () => {
  // Access navigation object using useNavigation hook
  const navigation = useNavigation();

  // Function to navigate to VideoAgoraScreen
  const navigateToVideoAgora = () => {
    navigation.navigate('VideoAgora');
  };

  // Return View containing TouchableOpacity with Text inside as a button
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={navigateToVideoAgora} style={styles.button}>
        <Text style={styles.buttonText}>Navigate to Video Agora</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

// Export the screen component
export default FirstScreen;
