import { getParsedDateInRequiredCalenderFormat } from "./function";

const commonCalenderListInRequiredFormat = (existingList) => {
    var calenderList = [];
    calenderList = existingList.map((item) => {
        //var fillFormTaskObj = item.Tasks_array.filter((item) => item.taskType == 1)[0]
        //var interviewTaskObj = item.Tasks_array.filter((item) => item.taskType == 2)[0]
        var fillFormTaskObj =  item.taskType == 1
        var interviewTaskObj = item.taskType == 2
       
        return {
            projectId: item.project_ID,
            title: item.title,
            fillFormMinute: getMyProjectParsedTimeInMinutes(fillFormTaskObj?.taskDuration),
            videoMinute: getMyProjectParsedTimeInMinutes(interviewTaskObj?.taskDuration),
            //fillFormBy: item.fillBy,
            taskType: item.taskType,
            taskHeading : item.taskHeading,   
            taskDuration : item.taskDuration, 
            buttonAction : item.buttonAction,
            fillFormBy : getCalenderParsedTime(item.dates),
           /* projectIdentity: item.projectIdentity,
            eligibilitySuggetions: item.eligibilitySuggetions,
            longDescription: item.insights,
            fromDate: getParsedDateInRequiredCalenderFormat(item.startsDuration),
            startsOn: getParsedDateInRequiredCalenderFormat(item.startsOn),
            toDate: getParsedDateInRequiredCalenderFormat(item.endDuration),
            imageUrls: item.imagePath != null ? item.imagePath.split(' , ') : [],
            hours: getMyProjectParsedTime(item.hours),
            price: 2000,
            spotLeft: 0,
            shortDescription: item.projectDescription,
            isFillFormCompleted: false,
            isVideoCallCompleted: false,
            interviewFormCompletedOn: getParsedDateInRequiredCalenderFormat(item.startsDuration),
            videoInterviewCompletedOn: getParsedDateInRequiredCalenderFormat(item.startsDuration),
            appliedDate: getParsedDateInRequiredCalenderFormat(item.appliedOn),
            scheduleSlotProjectTaskId: interviewTaskObj?.projectTask_ID,
            isInterviewScheduled: interviewTaskObj?.interviewStartTime != null,
            interviewScheduledStartTime: interviewTaskObj?.interviewStartTime,
            interviewScheduledEndTime: interviewTaskObj?.interviewEndTime,
            interviewfillBy: interviewTaskObj?.fillBy,  */
        };
    });

    return calenderList;
}
export { commonCalenderListInRequiredFormat };

const getTodayCalenderListListInRequiredFormat = (existingList) => {
    var calenderList = commonCalenderListInRequiredFormat(existingList);
    return calenderList;
}
export { getTodayCalenderListListInRequiredFormat };

const getThisWeekListInRequiredFormat = (existingList) => {
    var calenderList = commonCalenderListInRequiredFormat(existingList);
    
    return calenderList;
}
export { getThisWeekListInRequiredFormat };

const getThisMonthListInRequiredFormat = (existingList) => {
    var calenderList = commonCalenderListInRequiredFormat(existingList);
  
    return calenderList;
}
export { getThisMonthListInRequiredFormat };


const getCalenderParsedTime = (time) => {
    var timeToReturn;
    if (time) {
        var timeArray = time.split(' ')
        //timeToReturn = ((parseInt(timeArray[0].slice(0, -1), 10) * 60) + (parseInt(timeArray[1].slice(0, -1), 10))) / 60;
        var date = new Date(timeArray[0]);
        // alert(date);
        const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
        var dd = date.getDate();
        var mm = monthNames[date.getMonth() + 1]; //January is 0!   
        timeToReturn = dd + ' ' + mm;
    }
    return timeToReturn;
}
export { getCalenderParsedTime };

/*
const getMyProjectParsedTime = (time) => {
    var timeToReturn;
    if (time) {
        var timeArray = time.split(' ')
        timeToReturn = ((parseInt(timeArray[0].slice(0, -1), 10) * 60) + (parseInt(timeArray[1].slice(0, -1), 10))) / 60;
    }
    return timeToReturn;
}
export { getMyProjectParsedTime };

const convertMinsToTime = (time) => {
    let hours = Math.floor(time / 60);
    let minutes = time % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}hrs:${minutes}mins`;
  }

*/
const getMyProjectParsedTimeInMinutes = (time) => {
    var minToReturn;
    if (time) {
        var timeArray = time.split(' ')
        minToReturn = (parseInt(timeArray[0].slice(0, -1), 10) * 60) + (parseInt(timeArray[1].slice(0, -1), 10));
    }
    return minToReturn;
}
export { getMyProjectParsedTimeInMinutes };

