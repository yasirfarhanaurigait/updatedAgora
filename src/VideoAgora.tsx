import React, {Component, useState} from 'react';
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  BackHandler,
  AppState,
  AppRegistry,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {connect} from 'react-redux';
import RtcEngine, {
  ChannelProfileType,
  ClientRoleType,
  LocalVideoStreamError,
  RtcEngineContext,
  VideoDenoiserMode,
  ScreenCaptureParameters,
  createAgoraRtcEngine,
  RtcSurfaceView,
  RenderModeType,
  VideoSourceType
} from 'react-native-agora';
import AgoraRTC from 'react-native-agora';
import {
  AudioConfig,
  AudioInputStream,
  SpeechTranslationConfig,
  TranslationRecognizer,
  ResultReason,
} from 'microsoft-cognitiveservices-speech-sdk';
import AudioRecord from 'react-native-live-audio-stream';
import colors from '../assets/colors/colors';
import style from '../styles/style';
import axios from 'axios';
import {BASE_URL, NO_OF_PARTICIPANT_API} from '../apicall/Apicallutility';
import {Dimension} from '../utils/config';
import Orientation from 'react-native-orientation';
import RtmEngine, {RtmMessage} from 'agora-react-native-rtm';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
// import DeviceInfo from 'react-native-device-info';
import {getMaxMemory, getUsedMemory} from 'react-native-device-info';
import PushNotification from 'react-native-push-notification';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import CustomModule from './CustomModule';
// import PipHandler, {usePipModeListener} from 'react-native-pip-android';
const LOW_RAM_THRESHOLD = 300;
let isPipOpen = true;

const config = require('../utils/agora.config.json');
const Buffer = require('buffer').Buffer;
const agoraRtm = new RtmEngine();
const sleep = (time) =>
  new Promise((resolve) => setTimeout(() => resolve(), time));

type TranscriptData = {
  start: any;
  end: any;
  text: any;
  recognized: boolean;
  language: string;
  name: string;
};

type LanguageType = {
  text: any;
  language: string;
  name: string;
};

interface Stated {
  channelId: string;
  interviewSchedule_ID: string;
  user_ID: string;
  token_type: string;
  access_token: string;
  isJoined: boolean;
  remoteUid: number[];
  uidarray: [{}];
  uidItem: {};
  localUid: number;
  isScreenSharing: boolean;
  isPrimaryResearcherJoined: boolean;
  isOtherUserJoined: boolean;
  isRemoteScreenShared: boolean;
  isRemoteScreenUID: number;
  isSpeaker: boolean;
  isCamera: boolean;
  width: number;
  height: number;
  isLoudSpeaker: boolean;
  transcriptionResults: string;
  startTranslation: boolean;
  TranslationLanguage: boolean;
  showDropdown: boolean;
  Username: string;
  currentLanguage: string;
  myLanguage: string;
  transcriptData: TranscriptData[];
  orientation: string;
  languageData: LanguageType[];
  displaydata: LanguageType[];
  translationStop: Boolean;
  rtmStop: Boolean;
  isRecording: Boolean;
  appState: String;
  networkQuality: number;
  errorMsgTime: number;
  networkMsgTime: number;
  disabledCC: Boolean;
  RTMState: number;
}

class VideoAgora extends Component<{}, Stated, any> {
  _engine: RtcEngine | undefined;
  translationRecognizer: TranslationRecognizer;
  USER_ID = Math.floor(Math.random() * 1000000001);
  resetCount: number = 0;
  _isMounted = false;
  LanguageValues = [
    {label: 'English / English', value: 'en-IN'},
    {label: 'Hindi / हिंदी', value: 'hi-IN'},
    {label: 'Tamil/தமிழ்', value: 'ta-IN'},
    {label: 'Kannada / ಕನ್ನಡ', value: 'kn-IN'},
  ];
  connectionStateMapping = {
    1: 'DISCONNECTED',
    2: 'CONNECTING',
    3: 'CONNECTED',
    4: 'RECONNECTING',
    5: 'ABORTED',
  };

  constructor(props: {}) {
    super(props);
    Orientation.unlockAllOrientations();
    this.state = {
      channelId: config.channelId,
      interviewSchedule_ID: config.interviewSchedule_ID,
      user_ID: config.user_ID,
      token_type: config.token_type,
      access_token: config.access_token,
      isJoined: true,
      remoteUid: [],
      uidarray: [{}],
      uidItem: {},
      localUid: config.uid,
      isScreenSharing: false,
      isRemoteScreenShared: false,
      isPrimaryResearcherJoined: false,
      isOtherUserJoined: false,
      isRemoteScreenUID: 0,
      isSpeaker: true,
      isLoudSpeaker: true,
      isCamera: true,
      width: Dimensions.get('screen').width,
      height: Dimensions.get('screen').height,
      transcriptionResults: '',
      languageData: [],
      displaydata: [],
      startTranslation: false,
      Username: this.props.userData?.Response?.user_name,
      TranslationLanguage: false,
      showDropdown: false,
      currentLanguage: 'Select',
      transcriptData: [],
      myLanguage: '',
      orientation: 'PORTRAIT',
      translationStop: false,
      rtmStop: false,
      isRecording: false,
      appState: AppState.currentState,
      networkQuality: 100,
      errorMsgTime: 0,
      networkMsgTime: 0,
      disabledCC: false,
      RTMState: 3,
    };
    this.dropdownController = null;
    this.intervalReset = null;
    this.intervalBackground = null;
    this.intervalId = null;
    this.intervalIdCheckRam = null;
  }
  UNSAFE_componentWillMount() {
    (async () => {
      console.log('videoAgora', 'UNSAFE_componentWillMount');
      AppRegistry.registerHeadlessTask(
        'CustomModule',
        () => this._startScreenShare,
      );
      this.init();
      // await BackgroundService.start(this.veryIntensiveTask, this.options);
      setTimeout(() => {
        this.initRtm('RTM Initilized');
        this.startTranstion('Translation Initilized', true);
      }, 1000);
      setTimeout(() => {
        this.startAudioRecord();
      }, 500);

      if (Platform.OS == 'ios') {
        this.resetTranslation();
      }
      this.setState({
        currentLanguage: this.props.route.params.data.languageName,
        myLanguage: this.props.route.params.data.key,
      });
      Dimensions.addEventListener('change', this.determineAndSetOrientation);
    })();
  }

  componentDidMount() {
    this._isMounted = true;
    console.log('videoAgora', 'componentDidMount');
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    if (Platform.OS == 'android') {
      AppState.addEventListener('change', this.handleAppStateChange);
     // AppState.addEventListener('change', this.handleEnableSync);
    }
    // this.intervalIdCheckRam = setInterval(() => {
    //   console.log('interval', 'insideRam');
    //   this.checkLowRAM();
    // }, 90 * 1000);
  }
  componentWillUnmount() {
    this._isMounted = false;
    console.log('videoAgora', 'componentWillUnmount');
    //this.sendTurnOff();
    AudioRecord.stop();
   // this._engine?.stopPreview();
   // this._engine?.disableVideo();
    this._engine?.removeAllListeners();
   // this._engine?.destroy();
    try{
      if (agoraRtm) {
        agoraRtm?.release();
      }
    }
    catch(error){

    }
    
    
  
    this.stopInterval();
    this.stopTranslationRecognition();
   // Dimensions.removeEventListener('change', this.determineAndSetOrientation);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    if (Platform.OS == 'android') {
      AppState.removeEventListener('change', this.handleAppStateChange);
    }
    // BackgroundService.stop();
    // ReactNativeForegroundService.stop();
    // CustomModule.stopService();
    clearInterval(this.intervalReset);
  }

  // checkLowRAM = () => {
  //   const totalMemoryPromise = DeviceInfo.getMaxMemory();
  //   const usedMemoryPromise = DeviceInfo.getUsedMemory();

  //   Promise.all([totalMemoryPromise, usedMemoryPromise])
  //     .then(([totalMem, usedRam]) => {
  //       const totalMemoryMB = totalMem / 1024 ** 2; // Convert to MB
  //       const usedMemoryMB = usedRam / 1024 ** 2; // Convert to MB
  //       const freeMemoryMB = totalMemoryMB - usedMemoryMB; // Calculate free RAM
  //       console.log('Total Memory:', totalMemoryMB, 'MB');
  //       console.log('Used Memory:', usedMemoryMB, 'MB');
  //       console.log('Free Memory:', freeMemoryMB, 'MB');
  //       if (freeMemoryMB < LOW_RAM_THRESHOLD) {
  //         // Alert user that RAM is low
  //         PushNotification.cancelAllLocalNotifications();
  //         PushNotification.localNotification({
  //           title: 'Low Memory Alert',
  //           message:
  //             'Your device is running low on memory. Free memory is ' +
  //             Math.round(freeMemoryMB) +
  //             ' MB',
  //         });
  //         if (this.state.appState !== 'active') {
  //           this.restartTranslationRecognition('User Reset');
  //       }
  //     }

  //       // Now you can use freeMemoryMB variable as needed
  //     })
  //     .catch((error) => {
  //       console.error('Error getting memory info:', error);
  //     });
  // };

  handleAppStateChange = async (nextAppState) => {
    //console.log("checkingAppSate",nextAppState);
    if (nextAppState === 'active') {
      isPipOpen=true;
      console.log('videoAgora', 'ForeGround');
      clearInterval(this.intervalReset);
      clearInterval(this.intervalBackground);
      this.restartTranslationRecognition('User Reset');
      // await BackgroundService.stop();
      this.resetTimer();
    }
    else{
      clearInterval(this.intervalReset);
      console.log('videoAgora', 'BackgroundStart');
      try{
        
        // if (isPipOpen) {
        //   PipHandler.enterPipMode(300, 214);
        //   isPipOpen=false;
        // }
      }
      catch(error){

      }
      
      // if( Platform.OS === 'android'){
      //   clearInterval(this.intervalBackground);
      //   this.intervalBackground = setInterval(() => {
      //       console.log("insideintervalBackground");
      //       this.restartTranslationRecognition('User Reset');
      //   }, 1000);
      // }
    }
   
    this.setState({appState: nextAppState});

    // console.log('state', nextAppState);
  };
  

  veryIntensiveTask = async () => {
    // this._initEngine();
    await new Promise(async (resolve) => {
      //this._initEngine();
      console.log('Inside veryIntensiveTask');
      //this._startScreenShare
    });
  };

  options = {
    taskName: 'Explorastory',
    taskTitle: 'Explorastory',
    taskDesc: 'Explorastory Running Background',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
    parameters: {
      delay: 5000,
    },
  };

  handleBackButton = () => {
    this.stopTranslationRecognition();
    // this.sendTurnOff();
    this.stopInterval();
    AudioRecord.stop();
    Orientation.lockToPortrait();
    this.componentWillUnmount();
  };

  determineAndSetOrientation = () => {
    let width = Dimensions.get('window').width;
    let height = Dimensions.get('window').height;
    if (width < height) {
      this.setState({orientation: 'PORTRAIT'});
    } else {
      this.setState({orientation: 'LANDSCAPE'});
    }
  };

  resetTimer = () => {
    try{
      this.intervalReset = setInterval(() => {
        console.log('videoAgora', 'resetTimer');
        if (this.resetCount > 60) {
          this.resetCount = 0;
          try{
            if (agoraRtm) {
              agoraRtm?.release();
            }
          }
          catch(error){
      
          }
          this.initRtm('Restarting due to no message exchange in last 1 min');
          AudioRecord.stop();
          this.setState({isRecording: false});
          setTimeout(() => {
            this.restartTranslationRecognition(
              'Restarting due to no message exchange in last 1 min',
            );
          }, 1000);
          const currentTimestamp = new Date().getTime();
          const responseObj = {
            timeStamp: currentTimestamp,
            Platform: Platform.OS,
            role: 'respondent',
            channelId: this.state.channelId,
            name: this.state.Username,
            event: 'Agora RTM',
            userId: this.state.user_ID,
            RTMUserId: this.USER_ID,
            errorCode: 205,
            reson: `Restarting RTM due to no message exchange in last 1 min`,
          };
          this.sendDataAPi(responseObj);
        } else {
          if (this.state.isSpeaker) {
            this.resetCount += 10;
          }
        }
        // console.log("this.resetCount", this.resetCount)
      }, 10000);
    }catch (error) {

    }
   
  };

  initRtm = async (reason: string) => {
    console.log('videoAgora', 'initRtm');
    agoraRtm.createInstance(config.appId);
    try {
      await agoraRtm.loginV2(this.USER_ID.toString());
      const currentTimestamp = new Date().getTime();
      const responseObj = {
        timeStamp: currentTimestamp,
        Platform: Platform.OS,
        role: 'respondent',
        channelId: this.state.channelId,
        name: this.state.Username,
        event: 'Agora RTM',
        userId: this.state.user_ID,
        RTMUserId: this.USER_ID,
        errorCode: 208,
        reson: 'initRtm - RTM initialized with reason ' + reason,
      };
      this.sendDataAPi(responseObj);
    } catch (error) {
      console.error('Error logging in to Agora RTM:', error);
      const currentTimestamp = new Date().getTime();
      const responseObj = {
        timeStamp: currentTimestamp,
        Platform: Platform.OS,
        role: 'respondent',
        channelId: this.state.channelId,
        name: this.state.Username,
        event: 'Agora RTM',
        userId: this.state.user_ID,
        RTMUserId: this.USER_ID,
        errorCode: 208,
        reson: 'initRtm - RTM not initialized with error ' + error,
      };
      this.sendDataAPi(responseObj);
    }
    agoraRtm.joinChannel(this.state.channelId.toString());
    agoraRtm.addListener('ChannelMessageReceived', (message) => {
      const msg = JSON.parse(message.text);
      if (msg && msg.text == 'Please turn on CC..!!') {
        this.updateData(msg.name, msg.language);
      } else if (msg && msg.text == 'Please turn off CC..!!') {
        const data = this.state.displaydata;
        const existingIndex = data.findIndex((item) => item.name === msg.name);
        if (existingIndex != -1) {
          data[existingIndex].text = '';
          this.setState({displaydata: data});
        }
      } else {
        if (msg && msg.recognized && this.state.appState === 'active') {
          if (this.resetCount > 8) {
            this.resetCount = 0;
          }
        }
        if (msg && this.state.myLanguage.split('-')[0] == msg.language) {
          const data = this.state.displaydata;
          const existingIndex = data.findIndex(
            (item) => item.name === msg.name,
          );
          if (existingIndex != -1) {
            data[existingIndex].text = msg.text;
          } else {
            data.push({name: msg.name, language: '', text: msg.text});
          }
          // console.log('Received Text', msg.text);
          this.setState({displaydata: data});
          // if (this.state.appState === 'active') {
          //   this.setState({displaydata: data});
          // }
        }
      }
    });

    agoraRtm.addListener('ConnectionStateChanged', (newState, reason) => {
      console.log(`Connection state changed: ${newState}, reason: ${reason}`);
      if (newState == 5 || newState == 1) {
        this.setState({rtmStop: true});
        this.RTMConnectionLost(
          'Connection State ' + this.connectionStateMapping[newState],
        );
      } else {
        this.setState({rtmStop: false});
      }
      if (newState == 4) {
       
        this.restartTranslationRecognition('User Reset');
        this.setState({
          transcriptionResults: 'Resuming translation... ',
        });
      }
       else {
        this.setState({transcriptionResults: ''});
      }
      this.setState({RTMState: newState});
      var errorCod = 300;
      if (newState == 1) {
        errorCod = 302;
      } else if (newState == 2) {
        errorCod = 303;
      } else if (newState == 5) {
        errorCod = 304;
      } else if (newState == 4) {
        errorCod = 301;
      }
      const currentTimestamp = new Date().getTime();
      // this.setState(prevState => ({connectionChangeTime: [...prevState.connectionChangeTime, currentTimestamp]}));
      // if (this.state.connectionChangeTime.length >= 2) {
      //   const lastFifthTimestamp = this.state.connectionChangeTime[this.state.connectionChangeTime.length - 2];
      //   const currentTime = new Date().getTime();
      //   if (currentTime - lastFifthTimestamp <= 60000) {
      //     console.log("yes I am repeting my self")
      //     this.setState({rtmStop: true});
      //     this.RTMConnectionLost("Connection State changed 5 times in last 1 min");
      //   }else {
      //     console.log("No I am repeting my self")
      //   }
      // }
      const responseObj = {
        timeStamp: currentTimestamp,
        Platform: Platform.OS,
        role: 'respondent',
        channelId: this.state.channelId,
        name: this.state.Username,
        event: 'Agora RTM',
        userId: this.state.user_ID,
        RTMUserId: this.USER_ID,
        errorCode: errorCod,
        reson: `Connection state changed: ${this.connectionStateMapping[newState]}, reason: ${reason}`,
      };
      this.sendDataAPi(responseObj);
    });

    // agoraRtm.addListener('ChannelMemberJoined', (member) => {
    //   const currentTimestamp = new Date().getTime();
    //   const responseObj = {
    //     timeStamp: currentTimestamp,
    //     Platform: Platform.OS,
    //     role: 'respondent',
    //     channelId: this.state.channelId,
    //     name: this.state.Username,
    //     event: 'Agora RTM',
    //     userId: this.state.user_ID,
    //     RTMUserId: this.USER_ID,
    //     errorCode: 206,
    //     reson: `RTM member joined the channel, member id: ${member.userId}`,
    //   };
    //   this.sendDataAPi(responseObj);
    // });

    // agoraRtm.addListener('ChannelMemberLeft', (member) => {
    //   const currentTimestamp = new Date().getTime();
    //   const responseObj = {
    //     timeStamp: currentTimestamp,
    //     Platform: Platform.OS,
    //     role: 'respondent',
    //     channelId: this.state.channelId,
    //     name: this.state.Username,
    //     event: 'Agora RTM',
    //     userId: this.state.user_ID,
    //     RTMUserId: this.USER_ID,
    //     errorCode: 207,
    //     reson: `RTM member left the channel, member id: ${member.userId}`,
    //   };
    //   this.sendDataAPi(responseObj);
    // });
  };

  RTMConnectionLost = (reason: string) => {
    setTimeout(() => {
      if (this.state.rtmStop) {
        this.initRtm(reason);
      }
    }, 5000);
  };

  updateData = (name: string, newTarget: string) => {
    const data = this.state.languageData;
    const existingIndex = data.findIndex((item) => item.name === name);
    if (existingIndex != -1) {
      data[existingIndex].language = newTarget;
    } else {
      data.push({name, language: newTarget, text: ''});
    }
    this.setState({languageData: data, translationStop: true}, () => {
      this.restartTranslationRecognition('Resercher changed language');
    });
  };

  sendMessage = async (
    text: string,
    recognized: Boolean,
    from: String = '',
  ) => {
    console.log('videoAgora', 'sendMessage', from);
    try {
      const message = new RtmMessage(text);
      await agoraRtm.sendMessage(this.state.channelId.toString(), message, {});
      if (recognized && this.state.appState === 'active') {
        this.resetCount = Math.min(this.resetCount, 8);
      }
    } catch (error) {
      console.log('Failed to send message is ', error);
      const currentTimestamp = new Date().getTime();
      if (this.state.errorMsgTime + 60000 < currentTimestamp) {
        const responseObj = {
          timeStamp: currentTimestamp,
          Platform: Platform.OS,
          role: 'respondent',
          channelId: this.state.channelId,
          name: this.state.Username,
          event: 'Agora RTM',
          userId: this.state.user_ID,
          RTMUserId: this.USER_ID,
          errorCode: 201,
          reson: 'SendMsg - Message are not send with error ' + error,
        };
        this.setState({errorMsgTime: currentTimestamp});
        this.sendDataAPi(responseObj);
      }
    }
  };

  //Audio Recoder for Speech To Text
  startAudioRecord = async () => {
    try{
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
      }
      if (!this.state.isRecording || Platform.OS == 'ios') {
        const options = {
          channels: 1,
          bitsPerChannel: 16,
          sampleRate: 16000,
          audioSource: 7,
        };
        this.setState({isRecording: true});
        AudioRecord.init(options);
        AudioRecord.start();
      }
    }catch(error){
      console.log("Got error",error)
    }
   
  };

  getrecordData = () => {
    try {
      if (!this.state.isRecording || Platform.OS === 'ios') {
        const options = {
          channels: 1,
          bitsPerChannel: 16,
          sampleRate: 16000,
          audioSource: 7, // Ensure this is a valid source on your device
        };
        this.setState({isRecording: true});
        AudioRecord.init(options);
        AudioRecord.start();
      }
  
      const pushStream = AudioInputStream.createPushStream(); // Create stream outside event handler
  
      // Handle data within event listener
      AudioRecord.on('data', (data) => {
        const pcmData = Buffer.from(data, 'base64');
        pushStream.write(pcmData);
      });
  
      return AudioConfig.fromStreamInput(pushStream); // Return after stream creation
    } catch (error) {
      console.error('Error in getrecordData:', error);
      // Handle error here, e.g., show error message to the user
      return null; // Or any appropriate error handling
    }
  };
  
  
  startTranslationCC = async() => {
    this.setState({disabledCC: true});
    if (this.state.startTranslation) {
      this.setState({startTranslation: false, TranslationLanguage: false});
    } else {
      this.sendTurnOn();
      this.setState({startTranslation: true, TranslationLanguage: true});
      this.restartTranslationRecognition('CC Button Clicked');
    }
    setTimeout(() => {
      this.setState({disabledCC: false});
    }, 1000);
  };

  sendTurnOn = () => {
    if (this.state.myLanguage != '') {
      const transcriptObj = {
        text: 'Please turn on CC..!!',
        name: this.state.Username,
        language: this.state.myLanguage.split('-')[0],
      };
      this.sendMessage(JSON.stringify(transcriptObj), false, 'sendTurnOn');
    } else {
      const transcriptObj = {
        text: 'Please turn on CC..!!',
        name: this.state.Username,
        language: 'en',
      };
      this.sendMessage(JSON.stringify(transcriptObj), false);
    }
  };

  sendTurnOff = () => {
    console.log('turn off send');
    const transcriptObj = {
      text: 'Please turn off CC..!!',
      name: this.state.Username,
      language: '',
    };
    this.sendMessage(JSON.stringify(transcriptObj), false, 'sendTurnOff');
  };

  startTranstion = async (reason: string, from: boolean) => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
        if (
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          // console.log('LanguageData', 'new', this.state.myLanguage);
          if (this.state.myLanguage !== '') {
            this.getTranslationRecognizer(this.state.myLanguage, reason, from);
          } else {
            this.getTranslationRecognizer('hi-IN', reason, from);
            this.setState({currentLanguage: 'Hindi', myLanguage: 'hi-IN'});
          }
        } else {
          console.error('Permission denied');
        }
      } catch (error) {
        console.error('Async operation failed', error);
      }
    } else {
      if (this.state.myLanguage !== '') {
        this.getTranslationRecognizer(this.state.myLanguage, reason, from);
      } else {
        this.getTranslationRecognizer('hi-IN', reason, from);
        this.setState({currentLanguage: 'Hindi', myLanguage: 'hi-IN'});
      }
    }
  };

  stopTranslationRecognition = () => {
    console.log('checkingRecognition', 'RecognitionPaused');
    this.setState({TranslationLanguage: false, translationStop: true}, () => {
      if (this.translationRecognizer != null) {
        this.translationRecognizer.stopContinuousRecognitionAsync();
      }
    });
  };

  restartTranslationRecognition = (reason: string) => {
    console.log('checkingRecognition', 'restartTranslationRecognition');
    this.setState({TranslationLanguage: false, translationStop: true}, () => {
      if (this.translationRecognizer != null) {
        this.translationRecognizer.stopContinuousRecognitionAsync(() => {
          this.startTranstion(reason, true);
        });
      }
    });
  };

  sendDataAPi = async (data: any) => {
    if (this.state.appState === 'active') {
      const sendData = {
        statement: data,
      };
      await axios
        .post(BASE_URL + 'StoreTranscriptLogs', sendData, {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + this.state.access_token,
          },
        })
        .then((Response) => {
          console.log('StoreTranscriptLogs Sucessfull', data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  chooseTranslation = (lang: string, langName: string) => {
    this.setState({currentLanguage: langName, myLanguage: lang});
    const transcriptObj = {
      text: 'Please turn on CC..!!',
      name: this.state.Username,
      language: lang.split('-')[0],
    };
    this.sendMessage(JSON.stringify(transcriptObj), false, 'chooseTranslation');
    const currentTimestamp = new Date().getTime();
    const responseObj = {
      timeStamp: currentTimestamp,
      Platform: Platform.OS,
      role: 'respondent',
      channelId: this.state.channelId,
      name: this.state.Username,
      event: 'Translator Language Changed',
      userId: this.state.user_ID,
      RTMUserId: this.USER_ID,
      errorCode: 101,
      reson: 'Language changed to ' + lang,
    };
    this.sendDataAPi(responseObj);
    if (this.translationRecognizer != null) {
      this.translationRecognizer.stopContinuousRecognitionAsync(() => {
        this.getTranslationRecognizer(
          lang,
          'Language changed to ' + lang,
          true,
        );
      });
    } else {
      this.getTranslationRecognizer(lang, 'Language changed to ' + lang, true);
    }
    this.setState({showDropdown: false});
  };

  getTranslationRecognizer = (
    sourceLang: string,
    reason: string,
    from: Boolean,
  ) => {
    try {
      console.log("GetRecordData",this.getrecordData());
      const audioconfig = this.getrecordData();

      const TranslationspeechConfig = SpeechTranslationConfig.fromSubscription(
        config.microsoftKey,
        config.microsoftRegion,
      );
      TranslationspeechConfig.speechRecognitionLanguage = sourceLang;
      for (const languageObj of this.state.languageData) {
        if (languageObj.language != '') {
          TranslationspeechConfig.addTargetLanguage(languageObj.language);
        }
      }
      const existingIndex = this.state.languageData.findIndex(
        (item) => item.language === 'en',
      );
      if (existingIndex == -1) {
        TranslationspeechConfig.addTargetLanguage('en');
      }
      this.translationRecognizer = new TranslationRecognizer(
        TranslationspeechConfig,
        audioconfig,
      );
      this.setState({translationStop: false});
      if (from == true) {
        this.translationRecognizer.recognizing = (s, e) => {
          console.log('videoAgora', 'recognizing');
          try {
            if (this.state.isSpeaker) {
              const transcriptObjs = []; // Array to store transcript objects
              for (const languageObj of this.state.languageData) {
                const transcriptObj = {
                  end: e.result.offset,
                  duration: e.result.duration,
                  text: e.result.translations.get(languageObj.language),
                  recognized: false,
                  name: this.state.Username,
                  language: languageObj.language,
                };
                this.sendMessage(JSON.stringify(transcriptObj), false);
              }
              console.log('ValueText', e.result.text);
              // console.log('Trascription Text', e.result.text);
              // this.setState({
              //   transcriptionResults: e.result.text,
              // });
              if (this.state.appState === 'active') {
                this.setState({
                  transcriptionResults: e.result.text,
                });
              }
            }
          } catch (error) {
            console.error('Error in recognizing:', error);
          }
        };
      }
  
      this.translationRecognizer.canceled = (s, e) => {
        console.log('videoAgora', 'canceled');
        console.log(`Speech Recognition canceled with error: ${e.reason}`);
        console.log(`Error details: ${e.errorDetails}`);
        const currentTimestamp = new Date().getTime();
        const responseObj = {
          timeStamp: currentTimestamp,
          Platform: Platform.OS,
          role: 'respondent',
          channelId: this.state.channelId,
          name: this.state.Username,
          event: 'Azure Translator',
          userId: this.state.user_ID,
          RTMUserId: this.USER_ID,
          errorCode: 202,
          reson: 'Recognition session canceled ' + e.reason,
        };
        this.sendDataAPi(responseObj);
        setTimeout(() => {
          if (!this.state.translationStop) {
            this.getTranslationRecognizer(
              this.state.myLanguage,
              'Recognition session canceled',
              true,
            );
          }
        }, 2000);
      };
      this.translationRecognizer.sessionStopped = (s, e) => {
        console.log('videoAgora', 'sessionStopped');
        console.log(`Speech Recognition canceled with error: ${e}`);
        const currentTimestamp = new Date().getTime();
        const responseObj = {
          timeStamp: currentTimestamp,
          Platform: Platform.OS,
          role: 'respondent',
          channelId: this.state.channelId,
          name: this.state.Username,
          event: 'Azure Translator',
          userId: this.state.user_ID,
          RTMUserId: this.USER_ID,
          errorCode: 203,
          reson: 'Recognition session stopped',
        };
        if (reason != 'User Reset') {
          this.sendDataAPi(responseObj);
        }
        if(this.state.appState!=='active'){
          this.restartTranslationRecognition('Error in recognized: ' + e.reason);
        }
        
      };
      this.translationRecognizer.recognized = (s, e) => {
        try {
          if (this.state.isSpeaker) {
            // const currentUTCTimestampString = moment
            //   .utc()
            //   .format('YYYY-MM-DD HH:mm:ss');
            // const transcriptObj = {
            //   end: currentUTCTimestampString,
            //   duration: e.result.duration,
            //   text: e.result.translations.get('en'),
            //   recognized: true,
            //   name: this.state.Username,
            //   language: 'en',
            // };
            for (const languageObj of this.state.languageData) {
              const currentUTCTimestampString = moment
                .utc()
                .format('YYYY-MM-DD HH:mm:ss');
              const transcriptObj = {
                end: currentUTCTimestampString,
                duration: e.result.duration,
                text: e.result.translations.get(languageObj.language),
                recognized: true,
                name: this.state.Username,
                language: languageObj.language,
              };
              console.log('videoAgora', 'recognized');
              this.sendMessage(JSON.stringify(transcriptObj), true, 'recognized');
            }
            console.log('ValueTextReco', e.result.text);
  
            //this.sendMessage(JSON.stringify(transcriptObj), true, 'recognized');
          }
        } catch (error) {
          console.error('Error in recognized:', error);
          this.restartTranslationRecognition('Error in recognized: ' + error.message);
        }
      };
      this.translationRecognizer.startContinuousRecognitionAsync(
        () => {
          console.log('videoAgora', 'startContinuousRecognitionAsync');
          console.log('Recognition session started.');
          const currentTimestamp = new Date().getTime();
          const responseObj = {
            timeStamp: currentTimestamp,
            Platform: Platform.OS,
            role: 'respondent',
            channelId: this.state.channelId,
            name: this.state.Username,
            event: 'Azure Translator',
            userId: this.state.user_ID,
            RTMUserId: this.USER_ID,
            errorCode: 204,
            reson: 'Recognition session started : ' + reason,
          };
          if (reason != 'User Reset') {
            this.sendDataAPi(responseObj);
          }
        },
        (err) => {
          console.log(`ERRORss: ${err}`);
        },
      );
      {
        Platform.OS == 'ios' && this.onspeaker();
      }
    } catch (error) {
      console.error('Error in getTranslationRecognizer:', error);
      // Handle error here, e.g., show error message to the user
      // You may want to return a default value or null depending on your requirements
      // return null; // Or any appropriate error handling
    }
  };
  

  resetTranslation = () => {
    this.intervalId = setInterval(() => {
      console.log('videoAgora', 'resetTranslation');
      this.restartTranslationRecognition('User Reset');
    }, 150000);
  };

  stopInterval = async () => {
    if (Platform.OS == 'ios') {
      clearInterval(this.intervalId);
    }
    clearInterval(this.intervalReset);
    clearInterval(this.intervalIdCheckRam);
    //ReactNativeForegroundService.stop();
   // CustomModule.stopService();
  };

  _handleLayout = (event) => {
    this.setState({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  init = async () => {
    const  appId  = config.appId;
    this._engine =  createAgoraRtcEngine();
    this._engine.initialize({ appId });
    this._engine.setChannelProfile(
      ChannelProfileType.ChannelProfileLiveBroadcasting
    );
    
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
    await this._engine.enableVideo()
    await this._engine.startPreviewWithoutSourceType();
    await this._engine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
    await this._engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
   // await this._engine.setEnableSpeakerphone(this.state.isLoudSpeaker);
   console.log("initENgine", this._engine.setClientRole(ClientRoleType.ClientRoleBroadcaster))
    // await this._engine.setDefaultAudioRoutetoSpeakerphone(
    //   this.state.isLoudSpeaker,
    // );
   
    
    // await this._engine.setVideoEncoderConfiguration({
    //   bitrate: 320,
    //   frameRate: 15,
    //   orientationMode: 0,
    // });
    ;
    this._joinChannel()
  };

  // _joinChannel = async () => {
  //   // Join Channel using null token and channel name
    
    
  //   console.log("startCall");
  //   if (Platform.OS === 'android') {
  //     await PermissionsAndroid.requestMultiple([
  //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //       PermissionsAndroid.PERMISSIONS.CAMERA,
  //     ]);
  //   }

   
  //   await this._engine.addListener('onUserJoined', (connection, uid,elapsed) => {
  //     console.log('UserJoined', connection, uid);
  //     // If new user
  //     if (this.state.peerIds.indexOf(uid) === -1) {
  //       // Add peer ID to state array
  //       this.setState((prevState) => ({ peerIds: [...prevState.peerIds, uid] }));
  //     }
  //     console.info('UserJoined', uid, elapsed);
  //     setTimeout(this.sendTurnOn, 2000);

  //     if (uid === config.primaryResercherUID) {
  //       this.setState({isPrimaryResearcherJoined: true});
  //       this.setState({uidItem: {primaryResearcher: uid}});
  //       this.state.uidarray.push(this.state.uidItem);
  //     } else if (
  //       uid === config.sreenShareUID ||
  //       uid === config.othersreenShareUID
  //     ) {
  //       this.setState({isRemoteScreenShared: true});
  //       this.setState({uidItem: {screenShare: uid}});
  //       this.state.uidarray.push(this.state.uidItem);
  //     } else {
  //       this.setState({uidItem: {other: uid}});
  //       this.setState({isOtherUserJoined: true});
  //       this.state.uidarray.push(this.state.uidItem);
  //     }
  //     this.setState({remoteUid: [...this.state.remoteUid, uid]});
  //   });

  //   await this._engine.addListener('onUserOffline', (connection, uid) => {
  //     console.log('UserOffline', connection, uid);
  //     // Remove peer ID from state array
  //     this.setState((prevState) => ({
  //       peerIds: prevState.peerIds.filter((id) => id !== uid),
  //     }));

  //     if (uid === config.primaryResercherUID) {
  //       this.setState({isPrimaryResearcherJoined: false});
  //       this.removeUID('primaryResearcher');
  //     } else if (
  //       uid === config.sreenShareUID ||
  //       uid === config.othersreenShareUID
  //     ) {
  //       this.setState({isRemoteScreenShared: false});
  //       this.removeUID('screenShare');
  //     } else {
  //       this.setState({isOtherUserJoined: false});
  //       this.removeUID('other');
  //     }
  //     this.setState({
  //       remoteUid: this.state.remoteUid.filter(value => value !== uid),
  //     });
  //   });

  //   // If Local user joins RTC channel
  //   await this._engine.addListener('onJoinChannelSuccess', (connection,elapsed) => {
  //     console.log('JoinChannelSuccess', connection,elapsed);
  //     // Set state variable to true
  //     this.setState({ isJoined: true });
  //   });
  //  await this._engine?.addListener(
  //       'onLocalVideoStateChanged',
  //       (localVideoState, error) => {
  //         console.info('LocalVideoStateChanged', localVideoState, error);
  //         switch (error) {
  //           case VideoSourceType.LOCAL_VIDEO_STREAM_STATE_CAPTURING:
  //             this.setState({isScreenSharing: true});
  //             break;
  //           case VideoSourceType.LOCAL_VIDEO_STREAM_REASON_CAPTURE_FAILURE:
  //           case VideoSourceType.LOCAL_VIDEO_STREAM_STATE_STOPPED:
  //           case VideoSourceType.LOCAL_VIDEO_STREAM_REASON_DEVICE_NOT_FOUND:
  //             this.setState({isScreenSharing: false});
  //             break;
  //           default:
  //             break;
  //         }
  //       },
  //     );
  //   await this._engine?.joinChannel(
  //     config.token,
  //     config.channelName,
  //     config.uid,
  //     {}
  //   );
    
  // };
  async setNoOfParticipant(user_ID, uid, interviewSchedule_ID) {
    await axios
      .post(
        BASE_URL + NO_OF_PARTICIPANT_API,
        {
          user_ID: user_ID,
          uid: uid,
          interviewSchedule_ID: interviewSchedule_ID,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + this.state.access_token,
          },
        },
      )
      .then((Response) => {
        console.log('Number of participants added ' + JSON.stringify(Response));
        // ToastAndroid.show("Number of participants added ", ToastAndroid.SHORT);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  _addListeners = () => {
    this._engine?.addListener('Warning', (warningCode) => {
      console.info('Warning', warningCode);
      
      
    });
    this._engine?.addListener('onError', (errorCode) => {
      console.info('Error', errorCode);
    });
    this._engine?.addListener('onJoinChannelSuccess', (channel, uid, elapsed) => {
      console.info('JoinChannelSuccess', channel, uid, elapsed);
      this.setState({isJoined: true});
      this.setState({uidItem: {respondant: uid}});
      this.state.uidarray.push(this.state.uidItem);
    });
    this._engine?.addListener('onLeaveChannel', (stats) => {
      console.info('LeaveChannel', stats);
      this.removeUID('respondant');
      this.setState({isJoined: false, remoteUid: [], uidarray: [{}]});
    });
    this._engine?.addListener(
      'onNetworkQuality',
      (quality, UpLinkNetworkQuality, dLinkNetworkQuality) => {
        var networkQual = '';
        console.log('NetworkQuality',UpLinkNetworkQuality);
        if (UpLinkNetworkQuality == 1) {
          networkQual = 'Excellent';
        } else if (UpLinkNetworkQuality == 2) {
          networkQual = 'Good';
        } else if (UpLinkNetworkQuality == 3) {
          ToastAndroid.show("Poor internet connection",ToastAndroid.SHORT);
          networkQual = 'Poor';
        } else if (UpLinkNetworkQuality == 4) {
          ToastAndroid.show("Bad internet connection",ToastAndroid.SHORT);
          networkQual = 'Bad';
        } else if (UpLinkNetworkQuality == 5) {
          ToastAndroid.show("Very Bad internet connection",ToastAndroid.SHORT);
          networkQual = 'Very Bad';
        } else if (UpLinkNetworkQuality == 6) {
          ToastAndroid.show("Internet connection is down",ToastAndroid.SHORT);
          networkQual = 'Down';
        } else {
          networkQual = 'Unknown';
        }
        // console.log("networkQuality",networkQual);
        if (this.state.networkQuality == 100) {
          this.setState({networkQuality: quality});
        } else if (this.state.networkQuality != quality && quality > 2) {
          const currentTimestamp = new Date().getTime();
          if (
            this.state.networkMsgTime + 30000 < currentTimestamp &&
            this.state.appState === 'active'
          ) {
            const responseObj = {
              timeStamp: currentTimestamp,
              Platform: Platform.OS,
              role: 'respondent',
              channelId: this.state.channelId,
              name: this.state.Username,
              event: 'Translator Language Changed',
              userId: this.state.user_ID,
              RTMUserId: this.USER_ID,
              errorCode: 209,
              reson: 'Network Quality changed to ' + networkQual,
            };
            this.sendDataAPi(responseObj);
            this.setState({
              networkQuality: quality,
              networkMsgTime: currentTimestamp,
            });
          }
        }
      },
    );

    this._engine?.addListener('onUserJoined', (uid, elapsed) => {
      console.info('UserJoined', uid, elapsed);
      setTimeout(this.sendTurnOn, 2000);
      if (Platform.OS == 'ios') {
        setTimeout(() => {
          this.restartTranslationRecognition('User Joined');
        }, 2000);
      }
      if (uid === config.primaryResercherUID) {
        this.setState({isPrimaryResearcherJoined: true});
        this.setState({uidItem: {primaryResearcher: uid}});
        this.state.uidarray.push(this.state.uidItem);
      } else if (
        uid === config.sreenShareUID ||
        uid === config.othersreenShareUID
      ) {
        this.setState({isRemoteScreenShared: true});
        this.setState({uidItem: {screenShare: uid}});
        this.state.uidarray.push(this.state.uidItem);
      } else {
        this.setState({uidItem: {other: uid}});
        this.setState({isOtherUserJoined: true});
        this.state.uidarray.push(this.state.uidItem);
      }
      this.setState({remoteUid: [...this.state.remoteUid, uid]});
    });
    this._engine?.addListener('onUserOffline', (uid, reason) => {
      console.info('UserOffline', uid, reason);
      if (Platform.OS == 'ios') {
        setTimeout(() => {
          this.restartTranslationRecognition('User Left');
        }, 2000);
      }
      if (uid === config.primaryResercherUID) {
        this.setState({isPrimaryResearcherJoined: false});
        this.removeUID('primaryResearcher');
      } else if (
        uid === config.sreenShareUID ||
        uid === config.othersreenShareUID
      ) {
        this.setState({isRemoteScreenShared: false});
        this.removeUID('screenShare');
      } else {
        this.setState({isOtherUserJoined: false});
        this.removeUID('other');
      }
      this.setState({
        remoteUid: this.state.remoteUid.filter((value) => value !== uid),
      });
    });
    this._engine?.addListener(
      'onRemoteVideoStateChanged',
      (remoteVideoState, error) => {
        // if (remoteVideoState == config.sreenShareUID && error === 0) {
        //   this.setState({ isRemoteScreenShared: false });
        // }
        // console.info('RemoteVideoStateChanged', remoteVideoState, error);
      },
    );

    this._engine?.addListener(
      'onLocalVideoStateChanged',
      (localVideoState, error) => {
        console.info('LocalVideoStateChanged', localVideoState, error);
        switch (error) {
          case VideoSourceType.LOCAL_VIDEO_STREAM_STATE_CAPTURING:
            this.setState({isScreenSharing: true});
            break;
          case VideoSourceType.LOCAL_VIDEO_STREAM_STATE_STOPPED:
          case VideoSourceType.LOCAL_VIDEO_STREAM_STATE_FAILED:
          case VideoSourceType.ScreenCapturePermissionDenied:
            this.setState({isScreenSharing: false});
            break;
          default:
            break;
        }
      },
    );
   
  };
  remove = (index) => {
    let result = this.state.uidarray.filter(
      (item, key) => !Object.keys(key).includes(index),
    );
    this.state.uidarray.push(result);
  };

  removeUID(e) {
    const updateUidArray = this.state.uidarray.filter(
      (x) => !x.hasOwnProperty(e),
    );
    this.setState({uidarray: [{}]});
    updateUidArray.map((uid, index) =>
      this.state.uidarray.push(updateUidArray[index]),
    );
    console.log(
      'uidarray values after remove' + JSON.stringify(this.state.uidarray),
    );
  }
  _joinChannel = async () => {
    this._addListeners();
    this.setNoOfParticipant(
      this.state.user_ID,
      this.state.localUid,
      this.state.interviewSchedule_ID,
    );

    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
    console.log('config.token', config.token);
    await this._engine?.joinChannel(
      config.token,
      this.state.channelId,
      null,
      config.uid,
    );
    this._engine?.addListener('AudioRouteChanged', (data) => {
      console.log('AudioRouteChanged --------->', data);
      this.setState({isLoudSpeaker: Boolean(data === 3)});
    });
    const isLoudSpeakerAfter = await this._engine?.isSpeakerphoneEnabled();
    this.setState({isLoudSpeaker: Boolean(isLoudSpeakerAfter)});
  };

  _leaveChannel = async () => {
    Orientation.lockToPortrait();
   // await this._engine?.disableVideo();
    //await this._engine?.stopPreview();
    await this._engine?.leaveChannel();
    this.stopTranslationRecognition();

    // this.sendTurnOff();
    this.stopInterval();
    AudioRecord.stop();
    Orientation.lockToPortrait();
    //this.componentWillUnmount();
    //this.componentWillUnmount();

    const {navigation} = this.props;
    navigation.replace('FirstScreen');
    //  navigate('MyProject');
  };
  _switchCamera() {
    this._engine?.switchCamera();
  }
  _switchAudio() {
    const {isSpeaker} = this.state;
    if (isSpeaker) {
      console.log('MUTE TO UNMUTE');
      this._engine?.adjustRecordingSignalVolume(0);
    } else {
      console.log('UNMUTE TO MUTE');

      this._engine?.adjustRecordingSignalVolume(100);
    }
    this.setState({isSpeaker: !isSpeaker});
  }

  async _switchSpeaker() {
    try {
      const isLoudSpeakerBefore = await this._engine?.isSpeakerphoneEnabled();
      await this._engine?.setEnableSpeakerphone(!isLoudSpeakerBefore);
      const isLoudSpeakerAfter = await this._engine?.isSpeakerphoneEnabled();
      this.setState({isLoudSpeaker: Boolean(isLoudSpeakerAfter)});
    } catch (error) {
      console.log('speaker Error', error);
    }
  }

  async onspeaker() {
    try {
      await this._engine?.setEnableSpeakerphone(true);
      this.setState({isLoudSpeaker: true});
    } catch (error) {
      console.log('speaker Error', error);
    }
  }

  _enableLocalVideo() {
    const {isCamera} = this.state;
    if (isCamera) {
      this._engine?.enableLocalVideo(false);
    } else {
      this._engine?.enableLocalVideo(true);
    }
    this.setState({isCamera: !isCamera});
  }
  _onLayout = (event) => {
    console.log(
      '------------------------------------------------' +
        JSON.stringify(event.nativeEvent.layout),
    );
    console.log(
      '------------------------------------------------' +
        JSON.stringify(event.nativeEvent.layout.width),
    );
    var initialnew = JSON.stringify(event.nativeEvent.layout.width);
    console.log(initialnew);
    // this._engine?.setVideoEncoderConfiguration({ bitrate: 400, frameRate: 15, mirrorMode: 2, orientationMode: 0 });

    // if (initialnew === '360') {
    //   console.log("in portrait");
    //   this._engine?.setVideoEncoderConfiguration({ bitrate: 400, frameRate: 15, mirrorMode: 2, orientationMode: 2 });

    // } else {
    //   this._engine?.setVideoEncoderConfiguration({ bitrate: 400, frameRate: 15, mirrorMode: 2, orientationMode: 1 });
    //   console.log("in lanscape");
    // }
  };
  _startScreenShare = async () => {
    const {isScreenSharing} = this.state;
    console.log('inside_startScreenShare');

    if (isScreenSharing) {
      this.stopScreen();
    } else {
      this.startScreen();
      // ReactNativeForegroundService.add_task(() => this.startScreen(), {
      //   onLoop: false,
      //   taskId: 'taskid',
      //   onError: (e) => console.log(`Error logging:`, e),
      // });
      // ReactNativeForegroundService.start({
      //   id: 1277,
      //   title: 'Explorastory',
      //   icon: 'ic_launcher',
      //   setOnlyAlertOnce: true,
      //   color: '#000000',
      //   ongoing: true,
      //   importance: 'max',
      // });
    }
    if (Platform.OS === 'android') {
      this.setState({isScreenSharing: !isScreenSharing});
    }
  };
  startScreen = async () => {
    console.log('ScreenSharedStarted');
    await this._engine?.startScreenCapture({
      captureAudio: true,
      captureVideo: true,
      videoParams: {
        bitrate: 320,
        frameRate: 15,
      },
    });
    
    
    // this._engine?.setVideoEncoderConfiguration({
    //   bitrate: 320,
    //   frameRate: 15,
    //   orientationMode: 0,
    // });
    if (Platform.OS === 'android') {
      this.setState({isScreenSharing: !isScreenSharing});
    }
  };

  stopScreen = async () => {
    await this._engine?.stopScreenCapture();
    // await this._engine?.enableVideo();
    // await this._engine?.stopPreview();
   
    isPipOpen = true;
  };
  openDropdown = () => {
    this.setState({showDropdown: !this.state.showDropdown});
    setTimeout(() => {
      this.dropdownController.open();
    }, 100);
  };
  handleStartService = () => {
    console.log('OnPressClicked');
     CustomModule.startService();
   // this._startScreenShare();
  };

  // if(inPipMode) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>PIP Mode</Text>
  //     </View>
  //   );
  // }

  render() {
    console.log('CheckingRerender', 'Inside');
    const {
      channelId,
      isJoined,
      isScreenSharing,
      isSpeaker,
      isCamera,
      isLoudSpeaker,
    } = this.state;
    return (
      <View style={styles.max}>
        <View
          style={[
            styles.max,
            {
              backgroundColor: 'black',
              flexDirection:
                this.state.orientation != 'PORTRAIT' ? 'row' : 'column',
            },
          ]}>
          <View style={{flex: 0.93}}>
            <View style={styles.max}>
              <View style={{flex: 0.75}}>{this._renderVideo()}</View>
              <View style={{flex: 0.25}}>
                <ScrollView>
                  {this.state.startTranslation && (
                    <View>
                      {this.state.transcriptionResults != '' && (
                        <View>
                          {this.translationDesign(
                            this.state.Username,
                            this.state.transcriptionResults,
                            '#A4C916',
                          )}
                        </View>
                      )}
                      {this.state.displaydata.map((item) => (
                        <View>
                          {item.text != '' &&
                            item.name != this.state.Username &&
                            this.translationDesign(
                              item.name,
                              item.text,
                              '#C9A116',
                            )}
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </View>
          <View
            style={{
              flex: 0.07,
              backgroundColor: 'red',
            }}>
            <View
              style={{
                flex: 1,
                flexDirection:
                  this.state.orientation == 'PORTRAIT'
                    ? 'row'
                    : 'column-reverse',
                backgroundColor: '#1A1919',
              }}>
              <TouchableOpacity
                style={styles.otherBtn}
                onPress={this._enableLocalVideo.bind(this)}>
                <Icon
                  name={!isCamera ? 'video-off' : 'video'}
                  size={30}
                  color={colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.otherBtn}
                onPress={this._switchAudio.bind(this)}
                // onPress={() => this.state.isJoined ? this._leaveChannel : this._joinChannel}
              >
                <Icon
                  name={!isSpeaker ? 'microphone-off' : 'microphone'}
                  size={30}
                  color={colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.otherBtn}
                onPress={this._switchSpeaker.bind(this)}>
                <Icon
                  name={!isLoudSpeaker ? 'volume-off' : 'volume-high'}
                  size={30}
                  color={colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.otherBtn}
                onPress={this.handleStartService}
                // onPress={() => this.state.isJoined ? this._leaveChannel : this._joinChannel}
              >
                <Icon name={'arrow-up'} size={30} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.endBtn}
                onPress={isJoined ? this._leaveChannel : this._joinChannel}
                // onPress={() => this.state.isJoined ? this._leaveChannel : this._joinChannel}
              >
                <Icon name={'phone-hangup'} style={styles.iconStyle} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
  //   renderElement(){

  //     this.state.uidarray.map(el => (
  //     //if(this.state.value == 'news')
  //      //  return <Text>data</Text>;
  //    // return null;
  //    if(el.hasOwnProperty("screenShare"))
  //    {
  //     return null;
  //    }
  //    return null;
  //     ));
  //  }

  translationDesign = (username: string, value: string, color: string) => {
    return (
      <View style={{flexDirection: 'row', marginBottom: 5, marginRight: 10}}>
        <View style={{flex: 0.23, flexDirection: 'row-reverse'}}>
          <View
            style={{
              width: 1,
              backgroundColor: color,
              marginLeft: 10,
            }}></View>
          <Text style={[styles.ccText, {color: color}]}>{username}</Text>
        </View>
        <Text
          numberOfLines={this.state.orientation == 'PORTRAIT' ? 8 : 4}
          style={[styles.ccText, {flex: 0.77, marginLeft: 10}]}>
          {value}
        </Text>
      </View>
    );
  };

  ccButton = () => {
    return (
      <View
        style={{
          flexDirection:
            this.state.orientation != 'PORTRAIT' ? 'row' : 'column',
        }}>
        <View
          style={{
            flexDirection:
              this.state.orientation == 'PORTRAIT' ? 'row-reverse' : 'column',
            marginTop: 30,
            marginHorizontal: 20,
          }}>
          <TouchableOpacity
            onPress={this._switchCamera.bind(this)}
            // onPress={() => this.state.isJoined ? this._leaveChannel : this._joinChannel}
          >
            <Icon name={'rotate-right'} size={30} color={colors.white} />
          </TouchableOpacity>
          <View style={{margin: 15}} />
          <TouchableOpacity onPress={this.openDropdown}>
            <Image
              source={require('../assets/images/translation.png')}
              style={{
                width: 30,
                height: 30,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={{margin: 15}} />
          <TouchableOpacity
            onPress={this.startTranslationCC}
            disabled={this.state.disabledCC}>
            <Icon
              name={
                this.state.startTranslation
                  ? 'closed-caption'
                  : 'closed-caption-outline'
              }
              size={30}
              color={colors.white}
            />
          </TouchableOpacity>
          {/* <Text style={{color: 'white', fontSize: 8, marginRight: 20, marginTop: 10}}>{this.connectionStateMapping[this.state.RTMState]}</Text> */}
        </View>
        <View
          style={{
            flexDirection: 'row-reverse',
            marginLeft: 20,
            marginTop: 10,
          }}>
          {this.state.showDropdown && (
            <DropDownPicker
              placeholderStyle={{fontWeight: 'bold'}}
              arrowColor={colors.primary}
              labelStyle={[style.subHeading, {color: colors.medium_grey}]}
              containerStyle={[{height: 50, width: 210}]}
              style={styles.smallstyle}
              itemStyle={[styles.itemStyle, {textAlign: 'left'}]}
              dropDownStyle={[
                styles.dropdownStyle,
                {
                  height: 'auto',
                  zIndex: 500,
                  elevation: 5,
                },
              ]}
              showArrow={false}
              globalTextStyle={[style.textMenu, {color: colors.sea_blue}]}
              defaultValue={this.state.currentLanguage}
              placeholder={'Select Spoken Language'}
              onChangeItem={(item: any) => {
                console.log('LanguageItem', item.value, item.label);
                this.chooseTranslation(item.value, item.label);
              }}
              items={this.LanguageValues}
              controller={(instance) => (this.dropdownController = instance)}
            />
          )}
        </View>
      </View>
    );
  };

  singleUser = () => {
    return (
      <View style={[style.fullView]}>
        <View
          style={[
            styles.front,
            {
              flexDirection:
                this.state.orientation == 'PORTRAIT' ? 'row-reverse' : 'column',
            },
          ]}>
          <View style={{height: 300}}>{this.ccButton()}</View>
        </View>
        <View
          style={[
            style.fullView,
            {
              height: this.state.orientation == 'PORTRAIT' ? '100%' : '90%',
              width: this.state.orientation == 'PORTRAIT' ? '100%' : '90%',
              marginTop: this.state.orientation == 'PORTRAIT' ? 100 : 20,
              marginLeft: this.state.orientation != 'PORTRAIT' ? 20 : 0,
            },
          ]}>
            
          <RtcSurfaceView
                    style={style.fullView}
                    canvas={{
                      uid: 0,
                      renderMode:RenderModeType.RenderModeFit
                    }}
                    connection={{
                      channelId:this.state.channelId
                    }}
                    zOrderMediaOverlay={true}
                    ></RtcSurfaceView>
        </View>
      </View>
    );
  };

  localView = () => {
    return (
      <View
        style={[
          styles.front,
          {
            flexDirection:
              this.state.orientation == 'PORTRAIT' ? 'row' : 'column',
          },
        ]}>
          
                <RtcSurfaceView
                    style={style.remote}
                    canvas={{
                      uid: 0,
                      renderMode:RenderModeType.RenderModeFit
                    }}
                    connection={{
                      channelId:this.state.channelId
                    }}
                    zOrderMediaOverlay={true}
                    ></RtcSurfaceView>
        <View
          style={{
            height: 300,
            marginTop: this.state.orientation == 'PORTRAIT' ? 0 : -40,
          }}>
          {this.ccButton()}
        </View>
      </View>
    );
  };

  _renderVideo = () => {
    const {remoteUid} = this.state;
    // console.log('usr jn' + this.state.isJoined);
    // console.log('uidarray values' + JSON.stringify(this.state.uidarray));
    // console.log(
    //   'uidarray values respondant' + JSON.stringify(this.state.uidarray.values),
    // );
    // this.state.uidarray.map(function (item) {
    //   if ('respondant' in item) {
    //     console.log('respondant exists');
    //   }
    // });
    if (this.state.isRemoteScreenShared && !this.state.isOtherUserJoined) {
      return (
        <View style={[style.fullView]}>
          {this.state.orientation == 'PORTRAIT' ? (
            this.localView()
          ) : (
            <View style={[styles.front, {flexDirection: 'column'}]}>
              <View style={{height: 300}}>{this.ccButton()}</View>
            </View>
          )}
          <View
            style={[
              style.fullView,
              {marginTop: this.state.orientation == 'PORTRAIT' ? 60 : 0},
            ]}>
            {remoteUid.map(
              (value, index) =>
                (value === config.sreenShareUID ||
                  value === config.othersreenShareUID) && (
                  <RtcSurfaceView
                    key={index}
                    style={style.fullView}
                    canvas={{
                      uid: value,
                      renderMode:RenderModeType.RenderModeFit
                    }}
                    connection={{
                      channelId:this.state.channelId
                    }}
                    ></RtcSurfaceView>
                ),
            )}
          </View>
        </View>
      );
    } else if (
      this.state.isPrimaryResearcherJoined &&
      !this.state.isOtherUserJoined
    ) {
      return (
        <View style={[style.fullView]}>
          {this.localView()}
          <View
            style={[
              style.fullView,
              {
                marginTop: this.state.orientation == 'PORTRAIT' ? 60 : 0,
                marginLeft:
                  this.state.orientation == 'PORTRAIT'
                    ? 0
                    : this.state.width / 25,
              },
            ]}>
            {remoteUid.map(
              (value, index) =>
                value == config.primaryResercherUID && (
                  <RtcSurfaceView
                    key={index}
                    style={style.fullView}
                    canvas={{
                      uid: value,
                      renderMode:RenderModeType.RenderModeFit
                    }}
                    connection={{
                      channelId:this.state.channelId
                    }}
                    ></RtcSurfaceView>
                ),
            )}
          </View>
        </View>
      );
    } else if (this.state.isOtherUserJoined) {
      if (this.state.isRemoteScreenShared) {
        return (
          <View style={[style.fullView]}>
            {this.state.orientation == 'PORTRAIT' ? (
              this.localView()
            ) : (
              <View style={[styles.front, {flexDirection: 'column'}]}>
                <View style={{height: 300}}>{this.ccButton()}</View>
              </View>
            )}
            <View
              style={[
                style.fullView,
                {marginTop: this.state.orientation == 'PORTRAIT' ? 60 : 0},
              ]}>
              {remoteUid.map(
                (value, index) =>
                  (value === config.sreenShareUID ||
                    value === config.othersreenShareUID) && (
                      <RtcSurfaceView
                      key={index}
                      style={style.fullView}
                      canvas={{
                        uid: value,
                        renderMode:RenderModeType.RenderModeFit
                      }}
                      connection={{
                        channelId:this.state.channelId
                      }}
                      ></RtcSurfaceView>
                  ),
              )}
            </View>
          </View>
        );
      } else if (this.state.isPrimaryResearcherJoined) {
        return (
          <View style={[style.fullView]}>
            {this.localView()}
            <View
              style={[
                style.fullView,
                {
                  marginTop: this.state.orientation == 'PORTRAIT' ? 60 : 0,
                  marginLeft:
                    this.state.orientation == 'PORTRAIT'
                      ? 0
                      : this.state.width / 25,
                },
              ]}>
              {remoteUid.map(
                (value, index) =>
                  value == config.primaryResercherUID && (
                    <RtcSurfaceView
                    key={index}
                    style={style.fullView}
                    canvas={{
                      uid: value,
                      renderMode:RenderModeType.RenderModeFit
                    }}
                    connection={{
                      channelId:this.state.channelId
                    }}
                    ></RtcSurfaceView>
                  ),
              )}
            </View>
          </View>
        );
      } else {
        return <View>{this.singleUser()}</View>;
      }
    } else {
      return <View>{this.singleUser()}</View>;
    }
  };
}

const mapStateToProps = (state) => {
  return {
    userData: state?.onBoardingReducer?.user,
  };
};

export default connect(mapStateToProps)(VideoAgora);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticleLine: {
    height: '100%',
    width: 0.2,
    backgroundColor: '#FFFFFF',
  },
  front: {
    position: 'absolute',
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  max: {
    flex: 1,
  },
  header: {
    width: Dimension.width,
    height: Dimension.height,
    top: 0,
    left: 0,
  },
  circle: {
    height: 200,
    width: 200,
    position: 'relative',
    left: 10,
    elevation: 10,
  },
  endBtn: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: '#E74040',
  },
  otherBtn: {
    flex: 0.5,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    height: 55,
  },
  iconStyle: {
    color: colors.white,
    fontSize: 30,
  },
  float: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  top: {
    width: '100%',
  },
  dimensions: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  input: {
    borderColor: 'gray',
    borderWidth: 0,
    color: 'black',
  },
  local: {
    flex: 1,
  },
  remoteContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  remoteContainerShared: {
    position: 'absolute',
  },
  remote: {
    width: 150,
    height: 150,
  },
  ccText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
  },
  itemStyle: {
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.bold_white,
  },
  dropdownStyle: {
    backgroundColor: '#fff',
  },
  smallstyle: {
    backgroundColor: '#fff',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.bold_white,
  },
});
