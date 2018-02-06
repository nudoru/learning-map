/*
NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE

This needs to be refactored, but since the app is working and bugs have been
addressed in this code, I've decided to leave it as is.
MBP 1/17/18
 */


import Either from 'data.either';
import {curry} from 'ramda';
import moment from 'moment';
import {get} from 'lodash';
import {
  formatSecondsToDate2, removeArrDupes,
  removeWhiteSpace
} from '../utils/Toolbox';
import {hasLength, idMatchObjId, noOp, stripHTML} from '../utils/AppUtils';
import AppStore from './AppStore';


export const configSelector                   = () => AppStore.getState().config;
export const hydratedContentSelector          = () => AppStore.getState().hydratedContent;
export const startEventSelector               = () => configSelector().setup.startEvent;
export const userProfileSelector              = () => AppStore.getState().userProfile;
export const userEnrolledCoursesSelector      = () => userProfileSelector().enrolledCourses;
export const currentStructureSelector         = () => AppStore.getState().currentStructure;
export const coursesInMapSelector             = () => AppStore.getState().coursesInMap;
export const shadowDBEnrollmentsSelector      = () => AppStore.getState().shadowEnrollments;
export const allegoStatementsSelector         = () => AppStore.getState().allegoStatements;
export const userStatementsSelector           = () => AppStore.getState().lrsStatements;

// Filter the LRS statements for the user for the context specified in the config file
// Caching the results so we don't have to do it again

let STATEMENTS_FOR_CONTEXT_CACHE;
export const userStatementsSelectorForContext = () => {
  if (STATEMENTS_FOR_CONTEXT_CACHE) {
    return STATEMENTS_FOR_CONTEXT_CACHE;
  }
  STATEMENTS_FOR_CONTEXT_CACHE = filterStatementsForContext(configSelector().webservice.lrs.contextID, userStatementsSelector());
  return STATEMENTS_FOR_CONTEXT_CACHE;
};

// Given a context id and an array of statements, filter for only the statements that match
const filterStatementsForContext = curry((contextId, statements) =>
  statements.reduce((acc, stmnt) => {
    if ((stmnt.context && stmnt.context.platform) && stmnt.context.platform === contextId) {
      acc.push(stmnt);
    }
    return acc;
  }, []));

// Determine if the LRS is used, is there a connection in the config?
export const useLRS      = () => configSelector().webservice.lrs != null; // eslint-disable-line eqeqeq

// Determine if the shadow db is used, is there a connection in the config?
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

// For date based periods, apply that date to the items and get the current version
// Use the version for which there are LRS statements
export const getCurrentStructure = () =>
  applyStartDateToStructure(startEventSelector(),
    getStructureVersion(configSelector().structure, getLastLRSContentRevision(userStatementsSelectorForContext()) || configSelector().currentVersion));

// Given a course ID, get that enrollment start date from the shadow db
const getUserEnrollmentForId = id => shadowDBEnrollmentsSelector().userEnrollments.filter(e => id === e.enrolid)[0];


const getEnrollmentDetailsForCourseId = id => shadowDBEnrollmentsSelector().enrollmentDetails.filter(e => id === e[0].courseid)[0];

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
    let startEventDataParms = startEventData.split(',');

    //enroll,637
    if (startEventDataParms[0] === 'enroll') {
      let enrollmentDetails = getEnrollmentDetailsForCourseId(parseInt(startEventDataParms[1]));
      if (enrollmentDetails) {
        // Get enrollment date from loaded shadow db data
        let courseEnrollment = getUserEnrollmentForId(enrollmentDetails[0].id);
        startDate            = formatSecondsToDate2(courseEnrollment.timecreated);
        console.log('Content dates based on', startEventDataParms, enrollmentDetails, courseEnrollment, startDate);
      } else {
        console.warn(startEventData + ' but no enrollment for that course');
        startDate = null;
      }
    } else if (startEventDataParms[0] === 'date') {
      startDate = new Date(startEventDataParms[1]);
      console.log('Content dates based on', startEventDataParms, startDate);
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
  removeArrDupes(currentStructureSelector().data.reduce((pAcc, period) =>
    pAcc.concat(period.topics.reduce((tAcc, topic) =>
      tAcc.concat(topic.content), [])), [])).sort();

// Gets new or updated content titles from the content IDs in period topics
// Content MUST have been hydrated prior to calling
// This happens in the App.js after LMS and LRS content is loaded
export const getNewOrUpdatedContentTitles = () => getContentIDsInStructure().reduce((acc, cntId) => {
  let cnt = getContentObjById(cntId);
  if (cnt.isNew || cnt.isUpdated) {
    acc.push(cnt.title + ' (' + (cnt.isNew ? 'New' : (cnt.isUpdated ? 'Updated' : '')) + ')');
  }
  return acc;
}, []);

// Array => Number
export const getNumActivitiesForPeriod = period =>
  period.topics
    .filter(t => hasLength(t.content))
    .reduce((acc, topic) => acc += topic.content.length, 0);

export const getNumCompletedActivitiesForTopic = topic =>
  topic.content.reduce((acc, contentid) => {
    if (getContentObjById(contentid).isComplete) {
      acc++;
    }
    return acc;
  }, 0);

export const getNumCompletedActivitiesForPeriod = period =>
  period.topics
    .filter(t => hasLength(t.content))
    .reduce((acc, topic) => acc += getNumCompletedActivitiesForTopic(topic), 0);

export const getEnrollmentRecordLMSCourse = (userEnrolledCourses, courseLMSId) =>
  userEnrolledCourses
    .filter(idMatchObjId(courseLMSId));

const getAllStatementsForID       = id => userStatementsSelectorForContext().filter(s => s.object.id === id);
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

// content should be a hydrated content collection
export const areRequiredActivitiesCompleted = content =>
  content.reduce((acc, c) => {
    if (c.isRequired) {
      acc = acc && c.isComplete;
    }
    return acc;
  }, true);

export const getAllegoStatement = (idArr, verb) =>
  allegoStatementsSelector()
    .filter(filterStatementVerb(verb))
    .filter(filterStatementAllegoID(idArr));

export const filterStatementVerb = curry((verb, el) => el.verb.display['en-US'] === verb);

export const filterStatementAllegoID = curry((idArr, el) => {
  // Old version that looks at the ID of the recorded video which is INCORRECT!
  // let statementid = el.object.id.split('_')[1]; // "https://my.allego.com#scored_174014"
  // statement.context.contextActivities.parent[0].definition.name['en-US']

  let contextParent = get(el, 'context.contextActivities.parent[0].definition.name[\'en-US\']');

  if (contextParent) {
    console.log('Got contextparent', contextParent, 'is match', (idArr.indexOf(contextParent) >= 0))
    return idArr.indexOf(contextParent) >= 0
  }

  let statementid = el.object.definition.name['en-US'];
  return idArr.indexOf(statementid) >= 0;
});

export const getHydratedContent = () => {
  let coursesInMap    = coursesInMapSelector(),
      config          = configSelector(),
      {content}       = config,
      today           = moment(new Date()),
      newIfWithinDays = parseInt(config.newIfWithinDays) || 30;

  return content.reduce((acc, contobj) => {
    let o             = Object.assign({}, contobj),
        statement,
        allegoStatement,
        lmsEnrollment = getEnrollmentRecordLMSCourse(userEnrolledCoursesSelector(), o.lmsID)[0];

    o.isNew            = isDateWithinNewRange(today, newIfWithinDays, o.dateAdded);
    o.isUpdated        = isDateWithinNewRange(today, newIfWithinDays, o.dateUpdated);
    o.isPending        = false;
    o.isComplete       = false;
    o.lmsStatus        = 0;
    o.lmsStatusDate    = null;
    o.lrsStatus        = null;
    o.lrsStatusDate    = null;
    o.allegoStatus     = '';
    o.allegoStatusDate = null;
    o.lmsDetails       = null;


    if (o.lmsID || o.hasOwnProperty('allegoID') && o.allegoID.length) {
      //if (o.lmsID) {
      o.requireConfirm = false;
    }

    if (o.contentLink) {
      //console.log('getting content links for',o);
      statement = getStatusStatementForContentID(contentLinkWithId(o.contentLink, o.id));
    } else {
      statement = getStatusStatementForContentID(contentTitleToLink(o.title, o.id));
    }

    if (statement) {
      o.lrsStatus     = statement.verb.display['en-US'];
      o.lrsStatusDate = moment(statement.timestamp);

      // Complete if clicked and NOT require confirmation OR completed AND required confirmed
      o.isComplete = (o.lrsStatus === 'clicked' && !o.requireConfirm) || (o.lrsStatus === 'completed' && o.requireConfirm);
    }

    if (o.hasOwnProperty('allegoID')) {
      allegoStatement = getAllegoStatement(o.allegoID, o.allegoVerb);
      console.log('Allego statement(s)', allegoStatement);
      if (allegoStatement.length) {
        o.allegoStatus     = allegoStatement[0].verb.display['en-US'];
        o.allegoStatusDate = moment(allegoStatement[0].timestamp);
      }
      console.log(`allego status = "${o.allegoStatus}" and date is = "${o.allegoStatusDate}"`);

      o.isComplete = o.allegoStatus.length > 0;
    }

    if (lmsEnrollment) {
      // If there is no record then you are not enrolled, otherwise you must
      // be incomplete or complete. Not started isn't available
      let statusKey = lmsEnrollment.status.completionstatus || lmsEnrollment.status;
      o.lmsStatus   = statusKey.completed ? 2 : 1;

      //console.log(lmsEnrollment.id, statusKey, o.lmsStatus)

      if (o.lmsStatus === 2) {
        // Totara dates are seconds since 1/1/70 12:00am
        o.lmsStatusDate = moment(new Date(parseInt(statusKey.completions[0].timecompleted * 1000)));
        o.isComplete    = true;
      }
    }

    if (o.lmsID) {
      o.lmsDetails  = coursesInMap.filter(c => c.id === o.lmsID)[0];
      o.contentLink = o.lmsDetails ? o.lmsDetails.deeplink : '';
      o.summary     = o.summary || stripHTML(o.lmsDetails.summary);
    }

    // Broken up on 11/02 due to false positive bug detecting Allego completions when there is no data present
    // o.isComplete = o.lmsStatus === 2 || (o.lrsStatus === 'clicked' && !o.requireConfirm || o.lrsStatus === 'completed' && o.requireConfirm) || o.allegoStatus.length > 0;

    // console.log('is it complete?', o.isComplete);

    acc.push(o);
    return acc;
  }, []);
};