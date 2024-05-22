import React, { Component } from 'react';
import {
  Platform,
  Dimensions,
  ScrollView,
  PermissionsAndroid,
  Text,
  TouchableOpacity,
  AppState,
  Image,
  View,
  AppRegistry,
  StyleSheet
} from 'react-native';
import RtcEngine,{
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  RtcSurfaceView,
  UserOfflineReasonType,
  LocalVideoStreamState,
  RenderModeType,
  RenderModeFit,
  IRtcEngine,
  RtcConnection,
  VideoSourceType,
  VideoSourceCameraSecondary
} from 'react-native-agora';
import {
    AudioConfig,
    AudioInputStream,
    SpeechTranslationConfig,
    TranslationRecognizer,
    ResultReason,
  } from 'microsoft-cognitiveservices-speech-sdk';
import AudioRecord from 'react-native-live-audio-stream';
import {Dimension} from '../utils/config';
import colors from '../assets/colors/colors';
import style from '../styles/style';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RtmEngine, {RtmMessage} from 'agora-react-native-rtm';
import Orientation from 'react-native-orientation';
import requestCameraAndAudioPermission from './components/Permission';
import CustomModule from './CustomModule';
import config from '../utils/agora.config.json';
import "react-native-get-random-values"; // required as a polyfill for uuid. See info here: https://github.com/uuidjs/uuid#getrandomvalues-not-supported
import { v4 as uuidv4 } from "uuid";

const agoraRtm = new RtmEngine();
const Buffer = require('buffer').Buffer;
const configNew = {
  appId: config.appId,
  token: '',
  channelName: 'test',
};
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
    peerIds: number[]
  }

class LatestAgora extends Component {
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
    
        //selectedProjectListItem 163516910459233 1637 1807 bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9hcGkuZGV2Lmh1bWFuaWZ5dGVjaG5vbG9naWVzLmNvbVwvYXBpXC9sb2dpbkFuZHJvaWQiLCJpYXQiOjE3MTUzNTc4MjcsIm5iZiI6MTcxNTM1NzgyNywianRpIjoid09pd3pOYk44c25uTzlYWiIsInN1YiI6MTgwNywicHJ2IjoiODdlMGFmMWVmOWZkMTU4MTJmZGVjOTcxNTNhMTRlMGIwNDc1NDZhYSJ9.jt2XCLlI9DXGxVBL5jM_r3x4Sq-riLIwn4X2QuD5zmA appId b5a7270cf93e43678b068f1ea23e2146 1000 microsoft 896ae8a6c1c84cff9956584ce61c7646 eastasia config.primaryResercherUID 240000 123456789 12345678
    
        this.state = {
          channelId: '163516910459233',
          interviewSchedule_ID: '1637',
          user_ID: '1807',
          token_type: 'bearer',
          access_token:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9hcGkuZGV2Lmh1bWFuaWZ5dGVjaG5vbG9naWVzLmNvbVwvYXBpXC9sb2dpbkFuZHJvaWQiLCJpYXQiOjE3MTUzNTc4MjcsIm5iZiI6MTcxNTM1NzgyNywianRpIjoid09pd3pOYk44c25uTzlYWiIsInN1YiI6MTgwNywicHJ2IjoiODdlMGFmMWVmOWZkMTU4MTJmZGVjOTcxNTNhMTRlMGIwNDc1NDZhYSJ9.jt2XCLlI9DXGxVBL5jM_r3x4Sq-riLIwn4X2QuD5zmA',
          isJoined: true,
          remoteUid: [],
          uidarray: [{}],
          uidItem: {},
          localUid: 1000,
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
          peerIds: []
        };
        this.dropdownController = null;
        this.intervalReset = null;
        this.intervalId = null;
        this.intervalIdCheckRam = null;
      }

      UNSAFE_componentWillMount() {
        (async () => {
          console.log('videoAgora', 'UNDimensionsSAFE_componentWillMount');
          if (Platform.OS === 'android') {
            PermissionsAndroid.requestMultiple([
             PermissionsAndroid.PERMISSIONS.CAMERA,
             PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
           ]);
           PermissionsAndroid.requestMultiple([
               PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
               PermissionsAndroid.PERMISSIONS.CAMERA,
             ]);
         }
         AppRegistry.registerHeadlessTask(
          'CustomModule',
          () => this._startScreenShare,
        );
         this.init();
         setTimeout(() => {
           this.initRtm('RTM Initilized');
         }, 1000);
         setTimeout(() => {
           this.startAudioRecord();
         }, 500);
         if (Platform.OS == 'android') {
           AppState.addEventListener('change', this.handleAppStateChange);
           //AppState.addEventListener('change', this.handleEnableSync);
         }
        })();
      }
  componentDidMount() {
    

    //   this.setState({
    //     currentLanguage: this.props.route.params.data.languageName,
    //     myLanguage: this.props.route.params.data.key,
    //   });
  }
  componentWillUnmount() {
    
    console.log('videoAgora', 'componentWillUnmount');
    this._engine?.stopPreview();
    this._engine?.leaveChannel();
    this._engine?.removeAllListeners();
    try {
      this._engine?.release();
      console.log("call end")
    } catch (e) {
      console.log('release error:', e);
    }

    this.setState({ peerIds: [], isJoined: false });
  }

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

  _joinChannel = async () => {
    // Join Channel using null token and channel name
    
    
    console.log("startCall");
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }

   
    await this._engine.addListener('onUserJoined', (connection, uid,elapsed) => {
      console.log('UserJoined', connection, uid);
      // If new user
      if (this.state.peerIds.indexOf(uid) === -1) {
        // Add peer ID to state array
        this.setState((prevState) => ({ peerIds: [...prevState.peerIds, uid] }));
      }
      console.info('UserJoined', uid, elapsed);
      setTimeout(this.sendTurnOn, 2000);

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

    await this._engine.addListener('onUserOffline', (connection, uid) => {
      console.log('UserOffline', connection, uid);
      // Remove peer ID from state array
      this.setState((prevState) => ({
        peerIds: prevState.peerIds.filter((id) => id !== uid),
      }));

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
        remoteUid: this.state.remoteUid.filter(value => value !== uid),
      });
    });

    // If Local user joins RTC channel
    await this._engine.addListener('onJoinChannelSuccess', (connection,elapsed) => {
      console.log('JoinChannelSuccess', connection,elapsed);
      // Set state variable to true
      this.setState({ isJoined: true });
    });
   await this._engine?.addListener(
        'onLocalVideoStateChanged',
        (localVideoState, error) => {
          console.info('LocalVideoStateChanged', localVideoState, error);
          switch (error) {
            case LocalVideoStreamState.ExtensionCaptureStarted:
              this.setState({isScreenSharing: true});
              break;
            case LocalVideoStreamState.ExtensionCaptureStoped:
            case LocalVideoStreamState.ExtensionCaptureDisconnected:
            case LocalVideoStreamState.ScreenCapturePermissionDenied:
              this.setState({isScreenSharing: false});
              break;
            default:
              break;
          }
        },
      );
    await this._engine?.joinChannel(
      config.token,
      config.channelName,
      config.uid,
      {}
    );
    
  };

  

  endCall = async () => {
    this._engine?.stopPreview();
    this._engine?.leaveChannel();
    this._engine?.removeAllListeners();
    try {
      this._engine?.release();
      console.log("call end")
    } catch (e) {
      console.log('release error:', e);
    }

    this.setState({ peerIds: [], isJoined: false });
    const {navigation} = this.props;
    navigation.replace('FirstScreen');
    
  };
  handleAppStateChange = async (nextAppState) => {
    if (nextAppState === 'active') {
      console.log('videoAgora', 'BackgroundServiceStop');
      clearInterval(this.intervalReset);
      // await BackgroundService.stop();
      this.resetTimer();
    }
    if (nextAppState !== 'active') {
      //clearInterval(this.intervalReset);
      console.log('videoAgora', 'BackgroundServiceStart');
      // if (isPipOpen) {
      //   PipHandler.enterPipMode(300, 214);
      // }
      if (this.translationRecognizer != null) {
        this.translationRecognizer.stopContinuousRecognitionAsync(() => {
          this.startTranstion('User in backend', false);
        });
      }
      // await BackgroundService.stop();
    }
    this.setState({appState: nextAppState});

    // console.log('state', nextAppState);
  };
  resetTimer = () => {
    this.intervalReset = setInterval(() => {
      console.log('videoAgora', 'resetTimer');
      if (this.resetCount > 60) {
        this.resetCount = 0;
        if (agoraRtm) {
          agoraRtm?.release();
        }
        this.initRtm('Restarting due to no message exchange in last 1 min');
        AudioRecord.stop();
        this.setState({isRecording: false});

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
      //  this.sendDataAPi(responseObj);
      } else {
        if (this.state.isSpeaker) {
          this.resetCount += 10;
        }
      }
      // console.log("this.resetCount", this.resetCount)
    }, 10000);
  };
  initRtm = async (reason: string) => {
    console.log('videoAgora', 'initRtm');
    agoraRtm.createInstance('b5a7270cf93e43678b068f1ea23e2146');
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
     // this.sendDataAPi(responseObj);
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
     // this.sendDataAPi(responseObj);
    }
    agoraRtm.joinChannel(this.state.channelId.toString());
    agoraRtm.addListener('ChannelMessageReceived', message => {
      const msg = JSON.parse(message.text);
      if (msg && msg.text == 'Please turn on CC..!!') {
        this.updateData(msg.name, msg.language);
      } else if (msg && msg.text == 'Please turn off CC..!!') {
        const data = this.state.displaydata;
        const existingIndex = data.findIndex(item => item.name === msg.name);
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
          const existingIndex = data.findIndex(item => item.name === msg.name);
          if (existingIndex != -1) {
            data[existingIndex].text = msg.text;
          } else {
            data.push({name: msg.name, language: '', text: msg.text});
          }

          this.setState({displaydata: data});
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
        this.setState({
          transcriptionResults: 'Resuming translation... ',
        });
      } else {
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
    //  this.sendDataAPi(responseObj);
    });
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
    const existingIndex = data.findIndex(item => item.name === name);
    if (existingIndex != -1) {
      data[existingIndex].language = newTarget;
    } else {
      data.push({name, language: newTarget, text: ''});
    }
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
     //   this.sendDataAPi(responseObj);
      }
    }
  };

  //Audio Recoder for Speech To Text
  startAudioRecord = async () => {
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
  };

  getrecordData = () => {
    console.log("getRecordingData",this.state.isRecording)
    if (!this.state.isRecording|| Platform.OS === 'ios') {
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
    AudioRecord.on('data', data => {
      const pcmData = Buffer.from(data, 'base64');
      pushStream.write(pcmData);
    });

    return AudioConfig.fromStreamInput(pushStream); // Return after stream creation
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
          console.log('LanguageData', 'new', this.state.myLanguage);
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
  getTranslationRecognizer = (
    sourceLang: string,
    reason: string,
    from: Boolean,
  ) => {
    console.log('insideGetTranslation');
    const audioconfig = this.getrecordData();
    console.log('insideGetTranslation1212');
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
      item => item.language === 'en',
    );
    if (existingIndex == -1) {
      TranslationspeechConfig.addTargetLanguage('en');
    }
    this.translationRecognizer = new TranslationRecognizer(
      TranslationspeechConfig,
      audioconfig,
    );
    console.log('checkingTranslation');
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
        } catch (error) {}
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
      //this.sendDataAPi(responseObj);
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
      err => {
        console.log(`ERRORss: ${err}`);
      },
    );
    {
      Platform.OS == 'ios' && this.onspeaker();
    }
  };
  startTranslationCC = () => {
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
  restartTranslationRecognition = (reason: string) => {
    console.log('checkingRecognition', 'restartTranslationRecognition');
    this.setState({TranslationLanguage: false, translationStop: true}, () => {
      if (this.translationRecognizer != null) {
        this.translationRecognizer.stopContinuousRecognitionAsync(() => {
          this.startTranstion(reason, true);
        });
      } else {
        this.startTranstion(reason, true);
      }
    });
  };
  _enableLocalVideo() {
    const {isCamera} = this.state;
    console.log("_enableLocalVideo",isCamera)
    if (isCamera) {
      this._engine?.enableLocalVideo(false);
    } else {
      this._engine?.enableLocalVideo(true);
    }
    this.setState({isCamera: !isCamera});
  }
  _startScreenShare = async () => {
    const {isScreenSharing} = this.state;

    if (isScreenSharing) {
      await this._engine?.stopScreenCapture();
    } else {
      console.log('screenSharingStart');
      await this._engine?.startScreenCapture({
        captureAudio: true,
        captureVideo: true,
      });
    }
    if (Platform.OS === 'android') {
      this.setState({isScreenSharing: !isScreenSharing});
    }
  };
  handleStartService = () => {
    console.log('OnPressClicked');
     CustomModule.startService();
   // this._startScreenShare();
  };
  _leaveChannel = async () => {
    Orientation.lockToPortrait();
    await this._engine?.leaveChannel();
    this.stopInterval();
    AudioRecord.stop();
    Orientation.lockToPortrait();
    const {navigation} = this.props;
    navigation.replace('FirstScreen');
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

  _renderVideos = () => {
    console.log("isJoined",this.state.isJoined);
    return this.state.isJoined ? (
      <View style={style.fullView}>
       
        <RtcSurfaceView
          canvas={{
            uid: 0,
           
          }}
          connection={{
            channelId:this.state.channelId,
            localUid:this.USER_ID
          }}
          zOrderMediaOverlay={true}
        />
        {this._renderRemoteVideos()}
      </View>
    ) : null;
  };

  _renderRemoteVideos = () => {
    const { peerIds } = this.state;
    console.log("checkingPeerId",peerIds);
    return (
      <ScrollView
        style={style.remoteContainer}
        contentContainerStyle={styles.padding}
        horizontal={true}
      >
        {peerIds.map((id) => {
          return (
            <RtcSurfaceView
              style={styles.remote}
              canvas={{
                uid: id,
              }}
              key={id}
            />
          );
        })}
      </ScrollView>
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
        {/* <View
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
              controller={instance => (this.dropdownController = instance)}
            />
          )}
        </View> */}
      </View>
    );
  };
  render() {
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
           <View style={{flex: 0.99}}>
            <View style={styles.max}>
            <View
          style={{
            height: 80,
            
            marginTop: this.state.orientation == 'PORTRAIT' ? 0 : -40,
          }}>
          {this.ccButton()}
        </View>
              <View style={{flex: 0.75}}>{this._renderVideos()}</View>
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
                      {this.state.displaydata.map(item => (
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
                onPress={isJoined ? this.endCall : this._joinChannel}
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
}

export default LatestAgora;
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
