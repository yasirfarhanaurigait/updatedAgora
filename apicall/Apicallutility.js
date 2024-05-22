// export const BASE_URL = 'https://api.app.humanifytech.com/api/';
  export const BASE_URL = 'https://api.dev.humanifytechnologies.com/api/';
 //export const BASE_URL = 'https://api.az.dev.humanifytechnologies.com/api/';
//"https://maverickapi.estonetech.in/api/"

//onBoarding
export const CREATE_ACCOUNT_API = 'createAccount';
export const LOGIN_API = 'loginAndroid';
export const VALIDATE_OTP = 'validateOtp';
export const REQUEST_OTP_API = 'generateOtp';
export const VERIFY_OTP_API = 'verifyOtp';
export const REST_PASSWORD_API = 'resetPasswordOtp';
export const CHECK_USER = 'checkUser';

//profile builder
export const PRE_PROFILE_DATA_API = 'preProfileData';
export const CREATE_PROFILE_API = 'createProfile';

export const PROJECT_FORM_API = 'showScreener';
export const PROJECT_LIST_API = 'projectList';
export const APPLY_PROJECT_API = 'appliedNow';
export const SUBMIT_FORM_API = 'addScreenerAnswer';
export const MY_PROJECT_API = 'myProject';
export const GET_INTERVIEW_SLOT_API = 'getInterviewSlot';
export const CONFIRM_INTERVIEW_SLOT_API = 'confirmInterviewSlot';
export const RESCHEDULE_INTERVIEW_SLOT_API = 'rescheduleInterview';
export const REQUEST_INTERVIEW_SLOT_API = 'addRequestInterviewSlot';
export const LOGOUT_API = 'logoutAndroid';
export const PROJECT_TASK_API = 'getProjectTaskQuestions';
export const PRE_EDITPROFILE_DATA_API = 'getRespondentProfile';
export const GET_PROFILE_BUILDER_INFO_API = 'getRespondentProfile';
export const EDIT_PROFILE_API = 'editProfile';
export const CALENDER_API = 'getCalenderNotification';
export const GET_ACCOUNT_DEATILS_API = 'getAccountDetails';
export const UPDATE_ACCOUNT_DEATILS_API = 'updateAccountDetails';
export const CHANGE_PASSWORD_API = 'changePassword';
export const GET_NOTIFICATIONS_API = 'getNotification';
export const UPDATE_PROJECT_READ_COUNT_API = 'updateReadProjectCount';
export const Question_Image_API = 'uploadQuestionImage';
export const Question_Audio_API= 'uploadQuestionMP3';
export const UPDATE_USER_PROFILE = 'updateUserProfile';
export const NO_OF_PARTICIPANT_API = 'noOfParticipant';
//export const APPLY_PROJECTTASk_API = 'appliedNow'
export const DELETE_ACCOUNT = 'DeleteRespondentAccount';

let token = null;
export const setToken = (validToken) => {
  token = validToken;
};

const fetchAPI = async (api, method, data, headers) => {
  console.log("URL",`${BASE_URL}${api}`);
  console.log("POST DATA", JSON.stringify(data));
  try {
    if (token) {
      if (!headers) {
        headers = {};
      }
      headers.Authorization = `${token.token_type} ${token.access_token}`;
    }
    let res = await fetch(`${BASE_URL}${api}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });
    res = await res.json();
    console.log("res",res);
    return res;
  } catch (e) {
    console.error(e);
    return {};
  }
};
export default fetchAPI;
