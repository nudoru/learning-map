import Either from 'data.either';
import { curry } from 'ramda';
import moment from 'moment';
import {
  formatSecondsToDate2,
  isString,
  removeArrDupes
} from '../utils/Toolbox';
import {
  contentLinkWithId,
  contentTitleToLink,
  hasLength,
  idMatchObjId,
  isCompletedToNum,
  noOp,
  stripHTML
} from '../utils/AppUtils';
import DangerousAppState from './DangerousAppState';

export const useLRS = () => DangerousAppState.dangerousGetState().config.webservice.lrs != null; // eslint-disable-line eqeqeq

export const useShadowDB = () => DangerousAppState.dangerousGetState().config.webservice.shadowdb != null; // eslint-disable-line eqeqeq

// Get the period structure to either config default or last from the LRS
export const setStructureVersion = () => {
  let {config, lrsStatements} = DangerousAppState.dangerousGetState(),
      strVersion              = config.currentVersion;

  // Get the version from the most recent LRS statement if there is one
  Either.fromNullable(lrsStatements[0])
    .map(c => c.context.revision)
    .fold(noOp, r => {
      console.log('Last context revision in the LRS is ', r);
      strVersion = r;
    });

  // TODO REDUX ACTION
  DangerousAppState.dangerousSetState({config: {currentStructure: getStructureForVersion(strVersion, config.structure)}});
};

// Get the period structure for the given version
const getStructureForVersion = (version, data) =>
  Either.fromNullable(data.filter(str => str.version === version)[0]).fold(() => [], s => Object.assign({}, s));

export const getContentObjById = id =>
  Either.fromNullable(DangerousAppState.dangerousGetState().config.content.filter(idMatchObjId(id))[0])
    .fold(
      () => {
        console.error('Content with ID ' + id + ' not found!');
        return {};
      },
      res => res);

// Get unique content IDs from period topics
const getContentIDsInStructure = () =>
  removeArrDupes(DangerousAppState.dangerousGetState().config.currentStructure.data.reduce((pAcc, period) =>
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

// Array => Number
// 0 = not enrolled, 1 = incomplete/in progress, 2 = complete
export const getStatusForLMSCourse = (lmsID, userEnrolledCourses) =>
  userEnrolledCourses
    .filter(idMatchObjId(lmsID))
    .map(isCompletedToNum)[0];

export const getEnrollmentRecordLMSCourse = (lmsID, userEnrolledCourses) =>
  userEnrolledCourses
    .filter(idMatchObjId(lmsID));

// Get URLs (id) for content that has a link and doesn't have an LMS id
export const getContentIDForLRS = () => {
  return DangerousAppState.dangerousGetState().config.content.reduce((acc, cont) => {
    if (!cont.lmsID && cont.contentLink) {
      acc.push(cont.contentLink);
    }
    return acc;
  }, []);
};

export const getMostRecentStatusForContentID = (id) => {
  let statement = getMostRecentStatementForID(id);
  if (statement) {
    return statement.verb.display['en-US'];
  }
  return '';
};

// Get the "completed" statement if exists then "clicked" or null if not
export const getBestStatusStatementForContentID = id => getCompletionStatementForID(id) || getClickedStatementForID(id);

const getAllStatementsForID       = id => DangerousAppState.dangerousGetState().lrsStatements.filter(s => s.object.id === id);
const getMostRecentStatementForID = id => getAllStatementsForID(id)[0];
const getCompletionStatementForID = id => getAllStatementsForID(id).filter(st => st.verb.display['en-US'] === 'completed')[0];
const getClickedStatementForID    = id => getAllStatementsForID(id).filter(st => st.verb.display['en-US'] === 'clicked')[0];

export const isTopicComplete = obj =>
  obj.content.reduce((res, contentId) =>
  getContentObjById(contentId).isComplete && res, true);

export const isPeriodComplete = obj =>
  obj.topics.reduce((res, topic) =>
  isTopicComplete(topic) && res, true);

// Iterates over the content array and based on the start date determines if it's
// within the range of days
const setContentForNewAndUpdated = curry((startDate, newIfWithinDays, contentArry) =>
  contentArry.reduce(isContentNew(isDateWithinNewRange(startDate, newIfWithinDays)), []));

// Giving a compare function, returns a reducing function
const isContentNew = curry((compare, acc, obj) => {
  obj.isNew     = compare(obj.dateAdded);
  obj.isUpdated = compare(obj.dateUpdated);
  acc.push(obj);
  return acc;
});

// Mutate the loaded content by determining new and updated content and applying
// any loaded LMS or LRS data
// TODO REDUX ACTION
export const hydrateContent = () => DangerousAppState.dangerousSetState({config: {content: getHydratedContent()}});

// Get the default start
export const applyStartDateToStructure = () => {
  let structure           = DangerousAppState.dangerousGetState().config.currentStructure,
      startDate           = structure.startDate,
      startEventData      = DangerousAppState.dangerousGetState().config.setup.startEvent,
      startEventDataParms = startEventData ? startEventData.split(',') : null;

  // console.log('Applying dates ...', DangerousAppState.dangerousGetState());

  if (startEventDataParms) {
    let enrollmentDetails = getEnrollmentDetailsForCourseId(parseInt(startEventDataParms[1]));
    if (enrollmentDetails) {
      let courseEnrollment = getUserEnrollmentForId(enrollmentDetails[0].id);
      startDate            = formatSecondsToDate2(courseEnrollment.timecreated);
      // console.log(startEventDataParms, enrollmentDetails, courseEnrollment, startDate)
    } else {
      console.warn(startEventData + ' but no enrollment for that course');
      startDate = null;
    }
  }

  // TODO REDUX ACTION
  DangerousAppState.dangerousSetState({config: {currentStructure: applyStartDateToStructureObject(startDate, structure)}});
};

const getUserEnrollmentForId          = id => DangerousAppState.dangerousGetState().shadowEnrollments.userEnrollments.filter(e => id === e.enrolid)[0];
const getEnrollmentDetailsForCourseId = id => DangerousAppState.dangerousGetState().shadowEnrollments.enrollmentDetails.filter(e => id === e[0].courseid)[0];

// Determine if the compare date is within a range of days from the start date
const isDateWithinNewRange = curry((startDate, rangeDays, compareDate) =>
  moment(compareDate, 'MM-DD-YY').add(rangeDays, 'days').isSameOrAfter(startDate));

// Period start and end are specified in days (since the main start date). This
// turns them into moment date objects for use later
const applyStartDateToStructureObject = (startDate, structure) => {
  // let startDate = structure.startDate;
  if (!startDate) {
    return structure;
  }

  structure.data = structure.data.map(period => {
    // If it's a string
    if (isString(startDate)) {
      period.startdate = period.startDay ? moment(startDate, 'MM-DD-YY').add(parseInt(period.startDay), 'days') : null;
      period.enddate   = period.endDay ? moment(startDate, 'MM-DD-YY').add(parseInt(period.endDay), 'days') : null;
    } else {
      // A date object
      period.startdate = period.startDay ? moment(startDate).add(parseInt(period.startDay), 'days') : null;
      period.enddate   = period.endDay ? moment(startDate).add(parseInt(period.endDay), 'days') : null;
    }

    return period;
  });

  return structure;
};

// Add lms status, details and lrs status to the content objects in the array
export const getHydratedContent = () => {
  let {fullUserProfile, coursesInMap, config} = DangerousAppState.dangerousGetState(),
      {content}                               = config;

  // TODO better incorporate this function
  // Apply isNew and isUpdated
  return setContentForNewAndUpdated(moment(new Date()), (parseInt(config.newIfWithinDays) || 30), content)
    .reduce((acc, contobj) => {
      let o             = Object.assign({}, contobj),
          statement,
          lmsEnrollment = getEnrollmentRecordLMSCourse(o.lmsID, fullUserProfile.enrolledCourses)[0];

      if (o.contentLink) {
        statement = getBestStatusStatementForContentID(contentLinkWithId(o.contentLink, o.id));
      } else {
        statement = getBestStatusStatementForContentID(contentTitleToLink(o.title, o.id));
      }

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