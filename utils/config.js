import { Dimensions } from 'react-native';
import {EncryptionMode} from 'react-native-agora'
import logo from '../assets/images/logo.png';
const Dimension = Dimensions.get('screen');
export { logo, Dimension };

//selectedProjectListItem 163516910459233 1637 1807 bearer 
//eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9hcGkuZGV2Lmh1bWFuaWZ5dGVjaG5vbG9naWVzLmNvbVwvYXBpXC9sb2dpbkFuZHJvaWQiLCJpYXQiOjE3MTUzNTc4MjcsIm5iZiI6MTcxNTM1NzgyNywianRpIjoid09pd3pOYk44c25uTzlYWiIsInN1YiI6MTgwNywicHJ2IjoiODdlMGFmMWVmOWZkMTU4MTJmZGVjOTcxNTNhMTRlMGIwNDc1NDZhYSJ9.jt2XCLlI9DXGxVBL5jM_r3x4Sq-riLIwn4X2QuD5zmA 
//appId b5a7270cf93e43678b068f1ea23e2146 1000 microsoft 896ae8a6c1c84cff9956584ce61c7646 eastasia config.primaryResercherUID 240000 123456789 12345678


const config: configType = {
    uid: 1807,
    appId: "b5a7270cf93e43678b068f1ea23e2146",
    channelName: "demo",
    token: "",
    serverUrl: "",
    tokenExpiryTime: 60,
    encryptionMode: EncryptionMode.Aes128Gcm2,
    salt: "",
    cipherKey: "",
    product: "ILS",
    audioFilePath: "",
    soundEffectId: 1,
    soundEffectFilePath: "",
    logFilePath: "",
    mediaLocation: "https://www.appsloveworld.com/wp-content/uploads/2018/10/640.mp4",
    encryptionBase64: "",
    encryptionKey: "",
    imagePath: ""
  };
  
  export type configType = {
    uid: number;
    appId: string;
    channelName: string;
    serverUrl: string;
    tokenExpiryTime: number;
    token: string;
    encryptionMode: EncryptionMode;
    salt: string;
    cipherKey: string;
    product: string;
    audioFilePath: string;
    soundEffectId: number;
    soundEffectFilePath: string,
    logFilePath: string,
    mediaLocation: string,
    encryptionBase64: string,
    encryptionKey: string,
    imagePath: string
  };
  
  export default config;
