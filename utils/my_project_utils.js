import {getParsedDateInRequiredCalenderFormat} from './function';

const commonProjectListInRequiredFormat = (existingList) => {
  var projectList = [];
  var taskArray = [];
  projectList = existingList.map((item) => {
    taskArray = [];
    var fillFormTaskObj = item.Tasks_array.filter(
      (item) => item.taskType == 1,
    )[0];
    var interviewTaskObj = item.Tasks_array.filter(
      (item) => item.taskType == 2,
    )[0];
    taskArray =
      item.Tasks_array != null
        ? item.Tasks_array.map((item) => {
            return {
              projectTaskID: item.projectTask_ID,
              taskName: item.taskName,
              taskType: item.taskType,
              taskDuration: item.taskDuration,
            };
          })
        : [];
    return {
      projectId: item.project_ID,
      isRead: item.isRead,
      title: item.projectTitle,
      projectIdentity: item.projectIdentity,
      eligibilitySuggetions: item.eligibilitySuggetions,
      longDescription: item.insights,
      fromDate: getParsedDateInRequiredCalenderFormat(item.startsDuration),
      startsOn: getParsedDateInRequiredCalenderFormat(item.startsOn),
      toDate: getParsedDateInRequiredCalenderFormat(item.endDuration),
      imageUrls: item.imagePath != null ? item.imagePath : [],
      tasksArray: item.Tasks_array,
      // hours: getMyProjectParsedTime(item.hours),
      hours: item.hours,
      price: item.reward,
      // price: 2000,
      spotLeft: 0,
      shortDescription: item.projectDescription,
      fillFormMinute: getMyProjectParsedTimeInMinutes(
        fillFormTaskObj?.taskDuration,
      ),
      isFillFormCompleted: false,
      videoMinute: getMyProjectParsedTimeInMinutes(
        interviewTaskObj?.taskDuration,
      ),
      isVideoCallCompleted: false,
      interviewFormCompletedOn: getParsedDateInRequiredCalenderFormat(
        item.startsDuration,
      ),
      videoInterviewCompletedOn: getParsedDateInRequiredCalenderFormat(
        item.startsDuration,
      ),
      appliedDate: getParsedDateInRequiredCalenderFormat(item.appliedOn),
      scheduleSlotProjectTaskId: interviewTaskObj?.projectTask_ID,
      isInterviewScheduled: interviewTaskObj?.interviewStartTime != null,
      interviewScheduledStartTime: interviewTaskObj?.interviewStartTime,
      interviewScheduledEndTime: interviewTaskObj?.interviewEndTime,
      fillFormBy: fillFormTaskObj?.fillBy,
      interviewfillBy: interviewTaskObj?.fillBy,
      agoraChannelName: interviewTaskObj?.agoraChannelName,
      IsFormCompleted: interviewTaskObj?.IsFormCompleted,
      IsInterviewComplete: interviewTaskObj?.IsInterviewComplete,
      interviewSchedule_ID: interviewTaskObj?.interviewSchedule_ID,
      scheduleSlotFormProjectTaskId: fillFormTaskObj?.projectTask_ID,
      RespondentDevice:item?.RespondentDevice
    };
  });
  return projectList;
};
export {commonProjectListInRequiredFormat};

const getOngoingProjectListInRequiredFormat = (existingList) => {
  var projectList = commonProjectListInRequiredFormat(existingList);
  return projectList;
};
export {getOngoingProjectListInRequiredFormat};

const getAcceptedProjectListInRequiredFormat = (existingList) => {
  var projectList = commonProjectListInRequiredFormat(existingList);
  // projectList.map((item) => {
  //     return {
  //         ...item,
  //         fromDate: item.startsOn,
  //     };
  // });
  return projectList;
};
export {getAcceptedProjectListInRequiredFormat};

const getAppliedProjectListInRequiredFormat = (existingList) => {
  var projectList = commonProjectListInRequiredFormat(existingList);
  // projectList.map((item) => {
  //     return {
  //         ...item,
  //         fromDate: getOngoingProjectParsedDate(item.startsOn),
  //     };
  // });
  return projectList;
};
export {getAppliedProjectListInRequiredFormat};

const getCompletedProjectListInRequiredFormat = (existingList) => {
  var projectList = commonProjectListInRequiredFormat(existingList);
  // projectList.map((item) => {
  //     return {
  //         ...item,
  //         fromDate: getOngoingProjectParsedDate(item.startsOn),
  //     };
  // });
  return projectList;
};
export {getCompletedProjectListInRequiredFormat};

const getMyProjectParsedTime = (time) => {
  var timeToReturn;
  if (time) {
    var timeArray = time.split(' ');
    timeToReturn =
      (parseInt(timeArray[0].slice(0, -1), 10) * 60 +
        parseInt(timeArray[1].slice(0, -1), 10)) /
      60;
  }
  return timeToReturn;
};

const convertMinsToTime = (time) => {
  let hours = Math.floor(time / 60);
  let minutes = time % 60;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}hrs:${minutes}mins`;
};

export {getMyProjectParsedTime};

const getMyProjectParsedTimeInMinutes = (time) => {
  var minToReturn;
  if (time) {
    var timeArray = time.split(' ');
    minToReturn =
      parseInt(timeArray[0].slice(0, -1), 10) * 60 +
      parseInt(timeArray[1].slice(0, -1), 10);
  }
  return minToReturn;
};
export {getMyProjectParsedTimeInMinutes};
