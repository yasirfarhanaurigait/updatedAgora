import React, {useState, useEffect,Component} from 'react';
import {View, Text, AppState,Dimensions,
  PermissionsAndroid,
  TouchableOpacity,
  Platform,ScrollView,} from 'react-native';
import AgoraUIKit from 'agora-rn-uikit';
import PipHandler from 'react-native-pip-android';
import AudioRecord from 'react-native-live-audio-stream';
import RtmEngine, {RtmMessage} from 'agora-react-native-rtm';
import Orientation from 'react-native-orientation'
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const Buffer = require('buffer').Buffer;

// Import Agora Engine module
import AgoraRTC from 'react-native-agora';
import RtcEngine, {
  createAgoraRtcEngine,
  ChannelProfile,
  ClientRole,
  LocalVideoStreamError,
  RtcEngineContext,
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
  ScreenCaptureParameters,
} from 'react-native-agora';
import {
  AudioConfig,
  AudioInputStream,
  SpeechTranslationConfig,
  TranslationRecognizer,
  ResultReason,
} from 'microsoft-cognitiveservices-speech-sdk';
const config = require('../utils/agora.config.json');
const agoraRtm = new RtmEngine();

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
  videoCall: Boolean;
  screenShare: Boolean;
  RTMState: number;
}

class AgoraNewUi extends Component<{}, Stated, any> {
 
  translationRecognizer: TranslationRecognizer;
  USER_ID = Math.floor(Math.random() * 1000000001);
  _engine: RtcEngine | undefined;
  resetCount: number = 0;
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
      videoCall:true,
      screenShare:false,
      RTMState: 3,
    };
    // this.dropdownController = null;
    // this.intervalReset = null;
    // this.intervalId = null;
    // this.intervalIdCheckRam = null;
  }

  UNSAFE_componentWillMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    console.log("channedlId",config.channelId);
    // Initialize Agora Engine
    this.initEngine();
    this.initRtm('RTM Initilized');
    this.startTranstion('Translation Initilized', true);
    this.startAudioRecord();
  }

  componentWillUnmount() {
    
    console.log('videoAgora', 'componentWillUnmount');
    //this.sendTurnOff();
   // AudioRecord.stop();
    
    // if (agoraRtm != null) {
    //   agoraRtm.release();
    // }
    // if (agoraRtm != null) {
    //   agoraRtm?.release();
    // }
    
   // Dimensions.removeEventListener('change', this.determineAndSetOrientation);
  
    // if (Platform.OS == 'android') {
    //   AppState.removeEventListener('change', this.handleAppStateChange);
    // }
    
  }
   initEngine = async () => {
    //const agoraEngine = await AgoraRTC.createEngine();
    const agoraEngine = createAgoraRtcEngine();
    console.log('initEngine', agoraEngine);
   // await agoraEngine.enableVideo();
   

   this._engine=agoraEngine;
   this._addListeners();
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
    //  this.sendDataAPi(responseObj);
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
  _addListeners = () => {
    console.log("inside_AddListerners",this._engine);
    this._engine?.addListener('Warning', (warningCode) => {
      console.info('Warning', warningCode);
    });
    this._engine?.addListener('Error', (errorCode) => {
      console.info('Error', errorCode);
    });
    this._engine?.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.info('JoinChannelSuccess', channel, uid, elapsed);
      this.setState({isJoined: true});
      this.setState({uidItem: {respondant: uid}});
      this.state.uidarray.push(this.state.uidItem);
    });
    this._engine?.addListener('LeaveChannel', (stats) => {
      console.info('LeaveChannel', stats);
      this.removeUID('respondant');
      this.setState({isJoined: false, remoteUid: [], uidarray: [{}]});
    });
    this._engine?.addListener(
      'NetworkQuality',
      (quality, UpLinkNetworkQuality, dLinkNetworkQuality) => {
        var networkQual = '';
        if (UpLinkNetworkQuality == 1) {
          networkQual = 'Excellent';
        } else if (UpLinkNetworkQuality == 2) {
          networkQual = 'Good';
        } else if (UpLinkNetworkQuality == 3) {
          networkQual = 'Poor';
        } else if (UpLinkNetworkQuality == 4) {
          networkQual = 'Bad';
        } else if (UpLinkNetworkQuality == 5) {
          networkQual = 'Very Bad';
        } else if (UpLinkNetworkQuality == 6) {
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
          //  this.sendDataAPi(responseObj);
            this.setState({
              networkQuality: quality,
              networkMsgTime: currentTimestamp,
            });
          }
        }
      },
    );

    this._engine?.addListener('UserJoined', (uid, elapsed) => {
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
    this._engine?.addListener('UserOffline', (uid, reason) => {
      console.info('UserOffline', uid, reason);
      if (Platform.OS == 'ios') {
        setTimeout(() => {
          this.restartTranslationRecognition('User Left');
        }, 2000);
      }
      if (uid === config.primaryResercherUID) {
        this.setState({isPrimaryResearcherJoined: false});
       // this.removeUID('primaryResearcher');
      } else if (
        uid === config.sreenShareUID ||
        uid === config.othersreenShareUID
      ) {
        this.setState({isRemoteScreenShared: false});
      //  this.removeUID('screenShare');
      } else {
        this.setState({isOtherUserJoined: false});
     //   this.removeUID('other');
      }
      this.setState({
        remoteUid: this.state.remoteUid.filter((value) => value !== uid),
      });
    });
    this._engine?.addListener(
      'RemoteVideoStateChanged',
      (remoteVideoState, error) => {
        // if (remoteVideoState == config.sreenShareUID && error === 0) {
        //   this.setState({ isRemoteScreenShared: false });
        // }
        // console.info('RemoteVideoStateChanged', remoteVideoState, error);
      },
    );

    this._engine?.addListener(
      'LocalVideoStateChanged',
      (localVideoState, error) => {
        console.info('LocalVideoStateChanged', localVideoState, error);
        switch (error) {
          case LocalVideoStreamError.ExtensionCaptureStarted:
            this.setState({isScreenSharing: true});
            break;
          case LocalVideoStreamError.ExtensionCaptureStoped:
          case LocalVideoStreamError.ExtensionCaptureDisconnected:
          case LocalVideoStreamError.ScreenCapturePermissionDenied:
            this.setState({isScreenSharing: false});
            break;
          default:
            break;
        }
      },
    );
    // this._engine?.addListener('RtcStats', (rtcStats, error) => {
    //   console.log('RtcStats', rtcStats, error);
    // });
    // this._engine?.addListener('LocalVideoStats', (rtcStats, error) => {
    //   console.log('LocalVideoStats', rtcStats, error);
    // });
    // this._engine?.addListener('RemoteVideoStats', (rtcStats, error) => {
    //   console.log('RemoteVideoStats', rtcStats, error);
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
    console.log("insideStartTranslation");
    this.getTranslationRecognizer('hi-IN', reason, from);
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
          console.log("insideStartTranslation121");
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

  getTranslationRecognizer = (
    sourceLang: string,
    reason: string,
    from: Boolean,
  ) => {
    console.log("insidegetTranslationRecognizer");
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
     // this.sendDataAPi(responseObj);
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
      //  this.sendDataAPi(responseObj);
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
        //  this.sendDataAPi(responseObj);
        }
      },
      (err) => {
        console.log(`ERRORss: ${err}`);
      },
    );
    {
      Platform.OS == 'ios' && this.onspeaker();
    }
  };
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
    console.log("insideGetRecordData");
    const pushStream = AudioInputStream.createPushStream(); // Create stream outside event handler

    // Handle data within event listener
    AudioRecord.on('data', (data) => {
      const pcmData = Buffer.from(data, 'base64');
      pushStream.write(pcmData);
    });

    return AudioConfig.fromStreamInput(pushStream); // Return after stream creation
  };

   
  async onspeaker() {
    try {
      await this._engine?.setEnableSpeakerphone(true);
      this.setState({isLoudSpeaker: true});
    } catch (error) {
      console.log('speaker Error', error);
    }
  }

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
       // this.sendDataAPi(responseObj);
      }
    }
  };
   handleAppStateChange = nextAppState => {
    if (nextAppState !== 'active') {
      // Enter PiP mode when app is not active
      console.log('Background');
      
       // PipHandler.enterPipMode(300, 214);
      
    }
  };

   startScreenCapture = async () => {
    console.log('insideScreenCapture', this._engine);
    try {
      if (this._engine) {
        // Start screen capture
        console.log('insideScreenCapture');
        await this._engine.startScreenCapture();
      }
    } catch (error) {
      console.error('Failed to start screen capture:', error);
    }
   
    this.setState({screenShare: true});
  };

   stopScreenCapture = async () => {
    console.log('stopScreenCapture', this._engine);
    try {
      if (this._engine) {
        // Stop screen capture
        await this._engine.stopScreenCapture();
        await this._engine.disableVideo()
      }
    } catch (error) {
      console.error('Failed to stop screen capture:', error);
    }
   
    this.setState({screenShare: false});
  };

   handleEndCall = () => {
    this.setState({videoCall: false});
    if (this.state.screenShare) {
      this.stopScreenCapture();
    }
  };
   connectionData = {
    appId: 'b5a7270cf93e43678b068f1ea23e2146',
    channel: 'demo',
    enableScreenShare: true,
    rtmUid:'161911000000001'
  };
   rtcCallbacks =  {
    EndCall: () => this.handleEndCall()
  };
  render() {
  return (
    <View style={{flex: 1}}>
      {this.state.videoCall ? (
        <>
          <AgoraUIKit
            connectionData={this.connectionData}
            rtcCallbacks={this.rtcCallbacks}
          />
          <View style={{position: 'absolute', top: 20, right: 20}}>
            <Icon
              name="monitor-share"
              size={30}
              color="black"
              onPress={this.startScreenCapture}
            />
          </View>
          {/* <View style={{flex: 0.25}}>
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
              </View> */}
        </>
      ) : (
        <View style={{backgroundColor:'blue',width:80,margin:20}}>
        <TouchableOpacity onPress={() => this.setState({videoCall: true})}>
          <Text style={{color:'white'}}>Start Call</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
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

ccButton = () => {
  return (
    <View
      style={{
        flexDirection:
          this.state.orientation != 'PORTRAIT' ? 'row' : 'column',
      }}>
    
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
  );
};
}

export default AgoraNewUi;
