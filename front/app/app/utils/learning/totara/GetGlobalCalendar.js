/*eslint no-undef: "error"*/
/*eslint-env node*/

let moment              = require('moment'),
    {html2json}         = require('../../utils/html2json'),
    {request}           = require('../../Rest'),
    {
      dynamicSortObjArry,
      getParameterString,
      formatSecondsToDate,
      formatSecDurationToStr,
      convertTimeStrToHourStr,
      getMatchDates,
      getMatchTimes
    }                   = require('../../Toolbox'),
    {requestCatalog}    = require('./GetCourseCatalog'),
    webserviceConfig,
    courseCatalog,
    wsURL               = '/webservice/rest/server.php',
    deepLinkURL         = '/course/view.php?id=',
    privateStr          = '(PRIVATE)',
    classFields         = ['Delivery&nbsp;Mode', 'Region', 'Country', 'City', 'Private', 'Class&nbsp;date/time', 'Duration', 'Room'],
    classFieldsKey      = ['mod', 'region', 'country', 'city', 'private', 'schedule', 'duration', 'room'];

/**
 * Retrieves user f2f class calendar information from the Moodle
 * core_calendar_get_calendar_events web service.
 * To more information to the results such as deep links and categories, the
 * course catalog is also loaded to provide this information.
 * Once loaded, the result for each session is condensed under an object for
 * each unique class name.
 *
 * @param wsConfig {urlStem, token}
 * @returns {Promise}
 */
module.exports.requestCalendar = (wsConfig) => {

  webserviceConfig = wsConfig;

  return new Promise((resolve, reject) => {
    let catalogReq, calendarReq;

    /*
    Other possible options for making the call
     'events[eventids][0]' : 1,
     'events[courseids][0]': 0,
     'options[userevents]' : 0,
     'options[siteevents]' : 1,
     'options[ignorehidden]' : 1,
     */
    function createAllEventsWSURL() {
      return webserviceConfig.urlStem + wsURL + '?' + getParameterString({
          wstoken               : webserviceConfig.token,
          wsfunction            : 'core_calendar_get_calendar_events',
          'events[groupids][0]' : 0,
          moodlewsrestformat    : 'json'
        });
    }

    catalogReq = requestCatalog(wsConfig).then((data) => {
      console.log('Catalog loaded');
      return data;
    }).catch((err) => {
      reject('Error fetching course cleanedCatalogData', err);
    });

    calendarReq = request({
      json: true,
      url : createAllEventsWSURL()
    }).then((data)=> {
      console.log('Calendar loaded');
      return data;
    }).catch((err)=> {
      reject('Error fetching course calendar', err);
    });

    Promise.all([catalogReq, calendarReq]).then(data => {
      courseCatalog = data[0];
      resolve({
        calendar: condenseClasses(data[1].events),
        catalog : courseCatalog
      });
    }, err => {
      console.warn('Error fetching global calendar',err);
      reject(err);
    });

  });
};


function condenseClasses(clsData) {
  // Results include an item for every session and user booking (enrollment)
  // Need to perform filtering to get only sessions and entries for other users
  return clsData
    .filter(cls => cls.eventtype === 'facetofacesession')
    .filter(cls => cls.userid === 0)
    .filter(cls => cls.name.indexOf(privateStr) === -1)
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
  let catalogMatch = getCatalogCourseByName(classObj.fullname);

  if (catalogMatch) {
    return {
      classes   : [classObj],
      name      : classObj.fullname,
      region    : classObj.classDetails.region,
      duration  : classObj.duration,
      id        : catalogMatch.id,
      coursecode: catalogMatch.shortname,
      mod       : catalogMatch.deliverymode,
      category  : catalogMatch.category,
      summary   : catalogMatch.summary,
      deeplink  : catalogMatch.deeplink
    };
  }
  return null;
}

function getCatalogCourseByName(name) {
  return courseCatalog.cleanedCatalogData.filter((course) => {
    return course.fullname === name;
  })[0];
}

function parseClassObject(cls) {
  // Class schedule information is HTML, convert to an object to make it easier
  // to parse
  let classSchedule = html2json(cls.description);
  return {
    courseid    : cls.courseid,
    eventtype   : cls.eventtype,
    format      : cls.format,
    groupid     : cls.groupid,
    id          : cls.id,
    instance    : cls.instance,
    uuid        : parseInt(cls.uuid),
    fullname    : cls.name,
    duration    : formatSecDurationToStr(cls.timeduration),
    deeplink    : webserviceConfig.urlStem + deepLinkURL + cls.courseid,
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
  return arry.reduce((p, c, i) => {
    if (c.tag === 'dt') {
      if (c.child[0].text === field) {
        if (field === 'Class&nbsp;date/time') {
          p = convertDateStringToDateObj(arry[i + 1].child[0].text);
        } else if (field === 'Room') {
          // This is a list of spans we need to parse through
          p = {
            room    : arry[i + 1].child[0] ? arry[i + 1].child[0].child[0].text : '',
            building: arry[i + 1].child[1] ? arry[i + 1].child[1].child[0].text : '',
            address : arry[i + 1].child[2] ? arry[i + 1].child[2].child[0].text : ''
          };
        } else {
          // an element that we need to grab text node from
          p = arry[i + 1].child ? arry[i + 1].child[0].text : '';
        }
      }
    }
    return p;
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