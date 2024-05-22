import colors from '../assets/colors/colors';
import { Dimension } from '../utils/config';

const fontFamily_bold = {
  fontFamily: Platform.OS === 'ios' ? 'NotoSans-Bold' : 'NotoSans-Bold',
};

const fontFamily_Regular = {
  fontFamily: Platform.OS === 'ios' ? 'Noto Sans' : 'NatoSans-Regular',
};

export default {
  bigBtn: {
    alignSelf: 'center',
    elevation: 5,
    width: Dimension.width / 2,
  },
  logo: {
    width: Dimension.width / 4,

    resizeMode: 'contain',
  },
  bigLogo: {
    width: Dimension.width / 2,
    resizeMode: 'contain',
  },
  textMenu: {
    ...fontFamily_Regular,
    fontSize: 14,
    lineHeight: 21,
  },
  heading: {
    ...fontFamily_bold,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 32.69,
  },
  text_24: {
    ...fontFamily_Regular,
    fontSize: 20,
  },
  text_36: {
    ...fontFamily_bold,
    fontSize: 32,
  },
  subHeading: {
    ...fontFamily_Regular,
    fontSize: 14,

    lineHeight: 19.07,
  },
  subHeadingMultipicker: {
    ...fontFamily_Regular,
    fontSize: 13,

    lineHeight: 15.07,
  },
  subHeading_bold: {
    ...fontFamily_bold,
    fontSize: 14,
    fontWeight: 'bold',
    // lineHeight: 28,
  },

  textLight: {
    ...fontFamily_Regular,
    fontSize: 12,
  },
  textLightBold: {
    ...fontFamily_bold,
    fontSize: 12,
    fontWeight: 'bold',
  },
  textMedium: {
    ...fontFamily_bold,
    fontSize: 18,
  },
  textMediumBold: {
    ...fontFamily_bold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  textTutorial: {
    ...fontFamily_bold,
    fontSize: 19,
    lineHeight: 25.88,
  },
  textSmall: {
    ...fontFamily_Regular,
    fontSize: 10,
  },
  text_7: {
    ...fontFamily_bold,
    fontSize: 7,
  },
  textSmallBold: {
    ...fontFamily_bold,
    fontSize: 10,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: Dimension.width / 10,
    paddingTop: Dimension.height / 50,
  },
  textBold: {
    ...fontFamily_bold,
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 29.96,
  },
  text_30: {
    ...fontFamily_bold,
    fontSize: 24,
    fontWeight: 'bold',
  },
  text_25: {
    ...fontFamily_bold,
    fontSize: 25,
  },
  text_20: {
    ...fontFamily_bold,
    fontSize: 20,
  },
  text_28: {
    ...fontFamily_bold,
    fontSize: 28,
  },
  text_12: {
    ...fontFamily_bold,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  flexSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  btnStyle: {
    width: 120,
  },
  bigBtnStyle: {
    width: 180,
    marginVertical: 15,
  },
  paddingVertical: {
    paddingVertical: 10,
  },
  card: {
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    borderColor:colors.bold_white, // if you need 
    borderWidth:1,
    overflow: 'hidden',
  },
  smallBar: {
    borderLeftWidth: 0.6,
    borderColor: colors.bold_white,
    height: 25,
  },
  cardContent: {
    padding: 10,
    paddingBottom: 0,
  },
  dateContent: {
    backgroundColor: colors.primaryLight,
    position: 'absolute',
    top: 20,
    left: 10,
    borderRadius: 5,
  },
  questionContainer: {
    marginTop: 0,
    minHeight: Dimension.height / 2,
    flexGrow: 1,
    paddingBottom: 400,
  },
  questionContentContainer: {
    paddingBottom: Dimension.height / 6,
  },
  dateCardStyle: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  max: {
    flex: 1,
  },
  buttonHolder: {
    height: 100,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0093E9',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
  },
  fullView: {
    width: '100%',
    height: '100%',
    zIndex: 1
    

  },
  remoteContainer: {
    width: '100%',
    height: 150,
    position: 'absolute',
    top: 5,
  },
  remote: {
    width: 150,
    height: 150,
    marginHorizontal: 2.5,

  },
  noUserText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#0093E9',
  },
  checkboxContainer: {
    flexDirection: "row",
    marginHorizontal: 0
  },
  imageView: {
    borderWidth: 0.5, borderColor: colors.white, borderRadius: 20,
    padding: 20,
    backgroundColor: colors.light_white,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1
    },
  },
  imageStyle:{
    height: 200, 
    resizeMode: 'cover', 
    borderRadius: 10
  },
  buttonView:{
    paddingVertical: 10
  },
  buttonView1:{
    marginVertical: 5, 
    alignSelf: 'center'
  },
  buttonView2:{
    marginVertical: 5, 
    alignSelf: 'center'
  },
  buttonListView:{
    alignSelf: 'center' 
  },
  subHeadingView:{
    paddingTop: 15 
  },
  customButtonView:{
    paddingTop: 20, 
    alignItems: 'center'
  },
  goBackBtnView:{
    marginVertical: 5, 
    alignSelf: 'center'
  }
};
