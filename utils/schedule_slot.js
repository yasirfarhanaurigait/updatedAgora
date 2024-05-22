import { getDateForCalenderSlotFormat, getTimeIn12HrsFormat } from "./function";

const getSlotListInRequiredFormat = (existingList) => {
    var slotList = {};
    // var slotList = Object.assign({});
    existingList.forEach((item) => {
        var date = getDateForCalenderSlotFormat(item.scheduleStartTime);
        var startTime = getTimeIn12HrsFormat(item.scheduleStartTime);
        var endTime = getTimeIn12HrsFormat(item.scheduleEndTime);

        // slotList = {
        //     ...slotList,
        //     [date]: Object.assign(slotList[date] ? slotList[date] : [], [
        //         {
        //             label: startTime + ' - ' + endTime, value: item.projectsScheduleCalendar_ID
        //         }])
        // };
        var slotListToAdd = slotList[date] ? slotList[date] : []
        slotListToAdd.push({label: startTime + ' - ' + endTime, value: item.projectsScheduleCalendar_ID})
        slotList = {
            ...slotList,
            [date]: slotListToAdd
        };
    });

    return slotList;
}
export { getSlotListInRequiredFormat };