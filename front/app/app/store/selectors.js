import Either from 'data.either';
import { curry, memoize } from 'ramda';
import moment from 'moment';
import {
  formatSecondsToDate2,
  isString,
  removeArrDupes,
  removeWhiteSpace
} from '../utils/Toolbox';
import {
  hasLength,
  idMatchObjId,
  noOp,
  stripHTML
} from '../utils/AppUtils';
import AppStore from './AppStore';

//export const configSelector            = memoize(state => state.config);

export const configSelector              = () => AppStore.getState().config;
export const hydratedContentSelector     = () => AppStore.getState().hydratedContent;
export const userStatementsSelector      = () => AppStore.getState().lrsStatements;
export const startEventSelector          = () => configSelector().setup.startEvent;
export const userProfileSelector         = () => AppStore.getState().userProfile;
export const userEnrolledCoursesSelector = () => userProfileSelector().enrolledCourses;

export const useLRS      = () => configSelector().webservice.lrs != null; // eslint-disable-line eqeqeq
export const useShadowDB = () => configSelector().webservice.shadowdb != null; // eslint-disable-line eqeqeq

// True if there are no errors
export const isConnectionSuccessful = () => {
  let state = AppStore.getState();
  return state.connectionLMSStatus && state.connectionLRSStatus && state.connectionSDBStatus;
};

// Some actions don't have a URL since they're physical tasks. Convert that title
// into a unique URL for tracking to the LRS' object/subject id prop
export const contentTitleToLink = (title, id) => 'https://www.redhat.com/en#' + removeWhiteSpace(stripHTML(title)) + '_' + id;

// Several items have the same endpoint/link. Add the id as a hash to unique them
export const contentLinkWithId = (link, id) => link + '#' + id;

export const getCurrentStructure = () =>
  applyStartDateToStructure(startEventSelector(),
    getStructureVersion(configSelector().structure, getLastLRSContentRevision(userStatementsSelector()) || configSelector().currentVersion));

const getUserEnrollmentForId = id => AppStore.getState().shadowEnrollments.userEnrollments.filter(e => id === e.enrolid)[0];

const getEnrollmentDetailsForCourseId = id => AppStore.getState().shadowEnrollments.enrollmentDetails.filter(e => id === e[0].courseid)[0];

// Determine if the compare date is within a range of days from the start date
const isDateWithinNewRange = curry((startDate, rangeDays, compareDate) =>
  moment(compareDate, 'MM-DD-YY').add(rangeDays, 'days').isSameOrAfter(startDate));

// -1 past, 0 current, 1 future
// Start and End should be moment instances
export const getDateRelationship = (startM, endM) => {
  if (!startM || !endM) {
    return 2;
  }

  let nowM = moment();

  // isSame compares down to the millisecond, so convert it to a date string for the compare
  if (moment(nowM.format('L'), 'MM/DD/YYYY').isSame(moment(startM.format('L'), 'MM/DD/YYYY')) || moment(nowM.format('L'), 'MM/DD/YYYY').isSame(moment(endM.format('L'), 'MM/DD/YYYY'))) {
    return 0;
  } else if (moment(startM).isAfter(nowM)) {
    return 1;
  } else if (nowM.isAfter(endM)) {
    return -1;
  }

  return 0;
};

// Get the version from the most recent LRS statement if there is one
const getLastLRSContentRevision = statements => Either.fromNullable(statements[0])
  .map(stmt => stmt.context.revision)
  .fold(noOp, r => {
    console.log('Last context revision in the LRS is ', r);
    return r;
  });

// Get the period structure for the given version
const getStructureVersion = (data, version) =>
  Either.fromNullable(data.filter(str => str.version === version)[0]).fold(() => [], s => s);

// Based on the start event, apply state/end dates the periods in the structure
export const applyStartDateToStructure = (startEventData, structure) => {
  let startDate;

  if (startEventData.length) {
    let startEventDataParms = startEventData.split(','),
        enrollmentDetails   = getEnrollmentDetailsForCourseId(parseInt(startEventDataParms[1]));

    if (enrollmentDetails) {
      // Get enrollment date from loaded shadow db data
      let courseEnrollment = getUserEnrollmentForId(enrollmentDetails[0].id);
      startDate            = formatSecondsToDate2(courseEnrollment.timecreated);
      console.log('Content dates based on', startEventDataParms, enrollmentDetails, courseEnrollment, startDate);
    } else {
      console.warn(startEventData + ' but no enrollment for that course');
      startDate = null;
    }
  }

  return applyStartDateToStructureObject(startDate, structure);
};

// Period start and end are specified in days (since the main start date). This
// turns them into moment date objects for use later
const applyStartDateToStructureObject = (startDate, structure) =>
  Either.fromNullable(startDate).fold(e => structure, date => {
    structure.data = structure.data.map(adjustPeriodDate(date));
    return structure;
  });

/*
 Disabled because it's not a string. It was in an earlier version. Code preserved
 for possible future use
 if (isString(date)) {
 console.log('Date String!!!!');
 period.startdate = period.startDay ? moment(date, 'MM-DD-YY').add(parseInt(period.startDay), 'days') : null;
 period.enddate   = period.endDay ? moment(date, 'MM-DD-YY').add(parseInt(period.endDay), 'days') : null;
 }
 */
const adjustPeriodDate = curry((date, period) => {
  period.startdate = period.startDay ? moment(date).add(parseInt(period.startDay), 'days') : null;
  period.enddate   = period.endDay ? moment(date).add(parseInt(period.endDay), 'days') : null;
  return period;
});

////////////////////////////////////////////////////////////////////////////////

export const getContentObjById = id =>
  Either.fromNullable(hydratedContentSelector().filter(idMatchObjId(id))[0])
    .fold(
      () => {
        console.error('Content with ID ' + id + ' not found!');
        return {};
      },
      res => res);

// Get unique content IDs from period topics
const getContentIDsInStructure = () =>
  removeArrDupes(AppStore.getState().currentStructure.data.reduce((pAcc, period) =>
    pAcc.concat(period.topics.reduce((tAcc, topic) =>
      tAcc.concat(topic.content), [])), [])).sort();

// Gets new or updated content titles from the content IDs in period topics
// Content MUST have been hydrated prior to calling
// This happens in the App.js after LMS and LRS content is loaded
export const getNewOrUpdatedContentTitles = () => getContentIDsInStructure().reduce((acc, cntId) => {
  let cnt = getContentObjById(cntId);
  if (cnt.isNew || cnt.isUpdated) {
    acc.push(cnt.title + ' (' + (cnt.isNew ? 'New' : (cnt.isUpdated ? 'Updated' : '') ) + ')');
  }
  return acc;
}, []);

// Array => Number
export const getNumActivitiesForPeriod = period =>
  period.topics
    .filter(t => hasLength(t.content))
    .reduce((acc, topic) => acc += topic.content.length, 0);

export const getEnrollmentRecordLMSCourse = (userEnrolledCourses, courseLMSId) =>
  userEnrolledCourses
    .filter(idMatchObjId(courseLMSId));

const getAllStatementsForID       = id => userStatementsSelector().filter(s => s.object.id === id);
const getCompletionStatementForID = id => getAllStatementsForID(id).filter(st => st.verb.display['en-US'] === 'completed')[0];
const getClickedStatementForID    = id => getAllStatementsForID(id).filter(st => st.verb.display['en-US'] === 'clicked')[0];

// Get the "completed" statement if exists then "clicked" or null if not
export const getStatusStatementForContentID = id => getCompletionStatementForID(id) || getClickedStatementForID(id);

export const isTopicComplete = obj =>
  obj.content.reduce((res, contentId) =>
  getContentObjById(contentId).isComplete && res, true);

export const isPeriodComplete = obj =>
  obj.topics.reduce((res, topic) =>
  isTopicComplete(topic) && res, true);

export const getHydratedContent = () => {
  let {coursesInMap, config} = AppStore.getState(),
      {content}                               = config,
      today                                   = moment(new Date()),
      newIfWithinDays                         = parseInt(config.newIfWithinDays) || 30;

  return content.reduce((acc, contobj) => {
    let o             = Object.assign({}, contobj),
        statement,
        lmsEnrollment = getEnrollmentRecordLMSCourse(userEnrolledCoursesSelector(), o.lmsID)[0];

    if (o.contentLink) {
      statement = getStatusStatementForContentID(contentLinkWithId(o.contentLink, o.id));
    } else {
      statement = getStatusStatementForContentID(contentTitleToLink(o.title, o.id));
    }

    o.isNew         = isDateWithinNewRange(today, newIfWithinDays, o.dateAdded);
    o.isUpdated     = isDateWithinNewRange(today, newIfWithinDays, o.dateUpdated);
    o.isPending     = false;
    o.lmsStatus     = 0;
    o.lmsStatusDate = null;
    o.lrsStatus     = null;
    o.lrsStatusDate = null;
    o.lmsDetails    = null;

    if (o.lmsID) {
      o.requireConfirm = false;
    }

    if (statement) {
      o.lrsStatus     = statement.verb.display['en-US'];
      o.lrsStatusDate = moment(statement.timestamp);
    }

    if (lmsEnrollment) {
      // If there is no record then you are not enrolled, otherwise you must
      // be incomplete or complete. Not started isn't available
      o.lmsStatus = lmsEnrollment.status.completed ? 2 : 1;
      if (o.lmsStatus === 2) {
        // Totara dates are seconds since 1/1/70 12:00am
        o.lmsStatusDate = moment(new Date(parseInt(lmsEnrollment.status.completions[0].timecompleted * 1000)));
      }
    }

    if (o.lmsID) {
      o.lmsDetails  = coursesInMap.filter(c => c.id === o.lmsID)[0];
      o.contentLink = o.lmsDetails.deeplink;
      o.summary     = o.summary || stripHTML(o.lmsDetails.summary);
    }

    o.isComplete = o.lmsStatus === 2 || (o.lrsStatus === 'clicked' && !o.requireConfirm || o.lrsStatus === 'completed' && o.requireConfirm);

    acc.push(o);
    return acc;
  }, []);
};