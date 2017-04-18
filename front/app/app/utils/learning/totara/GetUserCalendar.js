/*eslint no-undef: "error"*/
/*eslint-env node*/


let {html2json}         = require('../html2json'),
    {request}           = require('../../Rest'),
    {
      dynamicSortObjArry,
      getParameterString,
      formatSecondsToDate,
      formatSecDurationToStr,
      convertTimeStrToHourStr,
      getMatchDates,
      getMatchTimes
    }                   = require('../../../../../../shared/utils/Toolbox'),
    webserviceConfig,
    targetUserId,
    classFields         = ['Delivery&nbsp;Mode', 'Region', 'Country', 'City', 'Private', 'Class&nbsp;date/time', 'Duration', 'Room'],
    classFieldsKey      = ['mod', 'region', 'country', 'city', 'private', 'schedule', 'duration', 'room'];

/**
 * Retrieves user f2f class calendar information from the Moodle
 * core_calendar_get_calendar_events web service filtered for only bookings of
 * the target user.
 *
 * @param wsConfig {urlStem, token}
 * @param userid Numeric ID of the user
 * @returns {Promise}
 */
module.exports.requestUserCalendar = (wsConfig, userid) => {

  webserviceConfig = wsConfig;
  targetUserId     = userid;

  return new Promise((resolve, reject) => {

    function requestCalendar() {
      request({
        json: true,
        url : createAllEventsWSURL()
      }).then((data)=> {
        resolve(condenseClasses(data.events));
      }).catch((err)=> {
        reject('Error fetching course calendar', err);
      });
    }

    function createAllEventsWSURL() {
      return webserviceConfig.urlStem + '/webservice/rest/server.php' + '?' + getParameterString({
          wstoken              : webserviceConfig.token,
          wsfunction           : 'core_calendar_get_calendar_events',
          'events[groupids][0]': 0,
          moodlewsrestformat   : 'json'
        });
    }

    requestCalendar();

  });
};

function condenseClasses(clsData) {
  return clsData
    .filter(cls => cls.eventtype === 'facetofacebooking')
    .filter(cls => parseInt(cls.userid) === targetUserId)
    .sort(dynamicSortObjArry('name'))
    .reduce((calendar, cls) => {
      let classObj    = parseClassObject(cls),
          calendarIdx = calendar.findIndex(c => c.name === classObj.fullname);

      if (calendarIdx < 0) {
        let courseObj = createCourseObject(classObj);
        if (courseObj) {
          calendar.push(courseObj);
        }
      } else {
        calendar[calendarIdx].classes.push(classObj);
      }
      return calendar;
    }, []);
}

function createCourseObject(classObj) {
  return {
    classes : [classObj],
    name    : classObj.fullname,
    region  : classObj.classDetails.region,
    duration: classObj.duration
  };
}

function parseClassObject(cls) {
  // Class schedule information is HTML, convert to an object to make it easier
  // to parse
  let classSchedule = html2json(cls.description);
  return {
    userid      : cls.userid,
    courseid    : cls.courseid,
    eventtype   : cls.eventtype,
    format      : cls.format,
    groupid     : cls.groupid,
    id          : cls.id,
    instance    : cls.instance,
    uuid        : parseInt(cls.uuid),
    fullname    : cls.name,
    duration    : formatSecDurationToStr(cls.timeduration),
    deeplink    : webserviceConfig.urlStem + '/course/view.php?id=' + cls.courseid,
    signupLink  : pickSignupLink(classSchedule),
    classDetails: pickDetails(classSchedule),
    datecreated : formatSecondsToDate(cls.timecreated),
    datemodified: formatSecondsToDate(cls.timemodified),
    startdate   : formatSecondsToDate(cls.startdate)
  };
}

function pickSignupLink(obj) {
  return obj.child.reduce((p, c) => {
    if (c.tag === 'a') {
      p = c.attr.href;
    }
    return p;
  }, '');
}

// Iterate over a dl element and get the dd text for the matching dt
function pickDetails(obj) {
  return obj.child.reduce((p, c) => {
    if (c.tag === 'dl') {
      classFields.forEach((field, i) => {
        p[classFieldsKey[i]] = pickDetailField(field, c.child);
      });
    }
    return p;
  }, {});
}

// Look over the dt/dd list and find the data we want since a dd is the next
// element we're getting it with the i+1
function pickDetailField(field, arry) {
  return arry.reduce((acc, c, idx) => {
    if (c.tag === 'dt') {
      if (c.child[0].text === field) {
        if (field === 'Class&nbsp;date/time') {
          acc = convertDateStringToDateObj(arry[idx + 1].child[0].text);
        } else if (field === 'Room') {
          // This is a list of spans we need to parse through
          acc = {
            room    : arry[idx + 1].child[0] ? arry[idx + 1].child[0].child[0].text : '',
            building: arry[idx + 1].child[1] ? arry[idx + 1].child[1].child[0].text : '',
            address : arry[idx + 1].child[2] ? arry[idx + 1].child[2].child[0].text : ''
          };
        } else {
          // an element that we need to grab text node from
          acc = arry[idx + 1].child ? arry[idx + 1].child[0].text : '';
        }
      }
    }
    return acc;
  }, '');
}

// The calendar ws returns the date, time and time zone in a formatted string, ex:
// October 17, 2016 - October 18, 2016, 9:00 AM - 5:00 PM America/New_York
// Need to bread it up into pieces
function convertDateStringToDateObj(str) {
  let dates     = getMatchDates(str),
      times     = getMatchTimes(str).map((t) => convertTimeStrToHourStr(t, true)),
      parts     = str.split(' '),
      zone      = parts[parts.length - 1],
      startDate = dates[0] ? dates[0].trim() : 'January 1, 1970',
      endDate   = dates[1] ? dates[1].trim() : null;

  return {
    start : {
      date     : startDate,
      startTime: times[0],
      endTime  : times[1],
      zone     : zone
    }, end: {
      date     : endDate,
      startTime: times[0],
      endTime  : times[1],
      zone     : zone
    }
  }
}