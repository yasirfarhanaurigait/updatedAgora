const moment = require('moment');

const get_Month = (date) => {
  var month = moment(date).format('MMM');
  return month;
}
export { get_Month };

const getDateToSyncByDateTime = (date, time) => {
  var stringDate = moment(date + " " + time, 'DD-MM-YYYY hh:mm A').format('YYYY-MM-DD HH:mm:ss')
  return stringDate;
}
export { getDateToSyncByDateTime }

const getDateToSyncByDateTimeWithAdditionalHour = (date, time, hourToAdd) => {
  var stringDate = moment(date + " " + time, 'DD-MM-YYYY hh:mm A').add(hourToAdd, 'hours').format('YYYY-MM-DD HH:mm:ss')
  return stringDate;
}
export { getDateToSyncByDateTimeWithAdditionalHour }


const getTimeIn12HrsFormat = (date) => {
  var stringTime = moment(date, 'YYYY-MM-DD HH:mm:ss').format('hh:mm a')
  return stringTime;
}
export { getTimeIn12HrsFormat }

const getDateMonthFormat = (date) => {
  var stringTime = moment(date, 'YYYY-MM-DD HH:mm:ss').format('d MMM')
  return stringTime;
}
export { getDateMonthFormat }

const getDateForCalenderSlotFormat = (date) => {
  var stringDate = moment(date, 'YYYY-MM-DD')
  return stringDate;
}
export { getDateForCalenderSlotFormat }

const getDateToSyncServerFormat = (date) => {
  var stringDate = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
  return stringDate;
}
export { getDateToSyncServerFormat }

const getParsedDateInRequiredCalenderFormat = (date) => {
  var dateToReturn = new Date();
  if (date) {
    dateToReturn = new Date(date.split('-').join('/'))
    // var dateArray = date.split(/[ -]/);
    // dateToReturn = new Date([dateArray[1], dateArray[2], dateArray[0]].join('/') + ' ' + dateArray[3]);
  }
  return dateToReturn;
}
export { getParsedDateInRequiredCalenderFormat };


const getParsedTimeInHours = (time) => {
  var timeToReturn;
  if (time) {
    var timeArray = time.split(' ')
    timeToReturn = ((parseInt(timeArray[0].slice(0, -1), 10) * 60) + (parseInt(timeArray[1].slice(0, -1), 10))) / 60;
  }
  return timeToReturn;
}
export { getParsedTimeInHours };

const convertMinsToTime = (time) => {
  var timeArray = time.split('.')
  let hours = Math.floor(timeArray[0] / 60);
  let minutes = timeArray[1] % 60;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  // if(minutes=='0'){
  //   return `${hours}Hrs`;
  // }else{
  return `${hours}Hrs ${minutes}mins`;
  // }
}
export { convertMinsToTime };


const getParsedTimeInMinutes = (time) => {
  var minToReturn;
  if (time) {
    var timeArray = time.split(' ')
    minToReturn = (parseInt(timeArray[0].slice(0, -1), 10) * 60) + (parseInt(timeArray[1].slice(0, -1), 10));
  }
  return minToReturn;
}
export { getParsedTimeInMinutes };

//added by vj 29-11-2021
const getDateFormat = (date) => {
  let difference = moment(date, "YYYY-MM-DD HH:mm:ss").diff(moment(new Date(), "YYYY-MM-DD HH:mm:ss"));
  let milliseconds = moment.duration(difference)
  //Get hours from milliseconds
  var hours = milliseconds / (1000 * 60 * 60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

  //Get remainder from hours and convert to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;
  return h;
}

const getDateFormatNew = (date) => {
  var stringTime = moment(date, 'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss")
  return stringTime;
}
export { getDateFormat }
const getDateFormatMinute = (date) => {
  let difference = moment(date, "YYYY-MM-DD HH:mm:ss").diff(moment(new Date(), "YYYY-MM-DD HH:mm:ss"));
  let milliseconds = moment.duration(difference)

  var hours = milliseconds / (1000 * 60 * 60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;
  //Get remainder from hours and convert to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;
  return m;
}
export { getDateFormatMinute }

const getCurrentDateFormat = () => {
  var date = new Date().getDate(); //Current Date
  var month = new Date().getMonth() + 1; //Current Month
  var year = new Date().getFullYear(); //Current Year
  var hours = new Date().getHours(); //Current Hours
  var min = new Date().getMinutes(); //Current Minutes
  var sec = new Date().getSeconds(); //Current Seconds

  return year + '-' + month + '-' + date

}
export { getCurrentDateFormat }

function isLater(str1) {
  var d1 = moment(str1, "YYYY-MM-DD").format("YYYY-MM-DD")
  var d2 = getCurrentDateFormat()

  return d2 > d1; // true
}
export { isLater }

const formatDuration = (milliseconds) => {
  const totalSeconds = milliseconds / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  return formattedDuration;
}

export { formatDuration };