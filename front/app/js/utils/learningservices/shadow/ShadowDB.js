require('isomorphic-fetch');

let Task     = require('data.task'),
    Either   = require('data.either'),
    {concat} = require('ramda'),
    {createSDBQuery, dateObjToSeconds, removeHTML, chainTasks} = require('../shared');

/**
 * Utility
 */
/*
 request({
 json   : true,
 headers: [webserviceConfig.headers],
 url    : webserviceConfig.endpoint + table + '?' + getParameterString(params)
 }).then(resolve).catch(reject)
 */

/**
 * Helpers
 */


// strNewLinesToArray :: String -> Array
const strNewLinesToArray = str => str.split('\n');

// Remove HTML and entities from the descritpion text
// descriptionToStr :: Object -> Object
const descriptionToStr = field => {
  field.description = Either.fromNullable(field.description)
    .map(removeHTML).fold(() => '', row => row);
  return field;
};

// If field.datatype is a menu, then we need to split the choices in param1 into
// an array of the options
// descriptionToStr :: Object -> Object
const menuParamToArray = field => {
  field.param1 = (field.datatype === 'menu' ? Either.Right(field.param1) : Either.Left(field.param1))
    .map(f => [f].map(strNewLinesToArray))
    .fold(obj => obj, obj => obj[0]);
  return field;
};

// mapper :: Function -> Function :: Array -> Object
const mapper = (f, cnct) => (acc, i) => cnct(acc, f(i));

// pickIdAndFullName :: Object -> Object
const pickIdAndFullName = i => ({id: i.id, fullname: i.fullname});

// reduceToIdAndName :: Array<Object> -> Array<Object>
const reduceToIdAndName = items => items.reduce(mapper(pickIdAndFullName, concat), []);

/**
 * Custom course data
 */

      // processCustomCourseFields :: Array<Object> -> Array<Object>
const processCustomCourseFields = items => items.map(descriptionToStr).map(menuParamToArray);

const getCustomCourseFields = config =>
  createSDBQuery(config, 'mdl_course_info_field', {}).map(processCustomCourseFields);

const getCustomFieldsForCourseRaw = (config, id) =>
  createSDBQuery(config, 'mdl_course_info_data', (id ? {courseid: 'eq.' + id} : null));

const getCustomFieldsForCourse = (config, id) =>
  Task.of(fields => course => applyFieldNames(fields, course))
    .ap(getCustomCourseFields(config).map(reduceToIdAndName))
    .ap(getCustomFieldsForCourseRaw(config, id));

// applyFieldNames :: Array<Object> -> Array<Object> -> Array<Object>
const applyFieldNames = (fields, courses) => courses.reduce((acc, crs) =>
    Either.fromNullable(fields.filter(obj => obj.id === crs.fieldid)[0])
      .map(fld => crs.fieldname = fld.fullname)
      .fold(() => concat(acc, [crs]), () => concat(acc, [crs]))
  , []);

/**
 * Evidence / External Learning
 */

const getEvidenceFromDateCompleted = (config, dateObj) =>
  createSDBQuery(config, 'mdl_dp_plan_evidence', {datecompleted: 'gte.' + dateObjToSeconds(dateObj)});

const getEvidenceForUserId = (config, id) =>
  createSDBQuery(config, 'mdl_dp_plan_evidence', {userid: 'eq.' + id});

/**
 * Site event log
 */

const getLogEventsFromDate = (config, dateObj) =>
  createSDBQuery(config, 'mdl_logstore_standard_log', {timecreated: 'gte.' + dateObjToSeconds(dateObj)});

const getLogEventsByAction = (config, action) =>
  createSDBQuery(config, 'mdl_logstore_standard_log', {action: 'eq.' + action});

const getLogEventsByActionAndCourseId = (config, action, id) =>
  createSDBQuery(config, 'mdl_logstore_standard_log', {
    action  : 'eq.' + action,
    courseid: 'eq.' + id
  });

const getLogEventsByUserId = (config, id) =>
  createSDBQuery(config, 'mdl_logstore_standard_log', {userid: 'eq.' + id});

const getLogEventsByCourseId = (config, id) =>
  createSDBQuery(config, 'mdl_logstore_standard_log', {courseid: 'eq.' + id});

/**
 * Enrollments
 * Note, Totara/Moodle misspells "enrol"
 */

const getUserEnrollmentsByUserId = (config, id) =>
  createSDBQuery(config, 'mdl_user_enrolments', {userid: 'eq.' + id});

const getEnrollmentById = (config, id) =>
  createSDBQuery(config, 'mdl_enrol', {id: 'eq.' + id});

const getUserEnrollmentToProgram = (config, userId, programId) =>
    createSDBQuery(config, 'program_status_report', {userid: 'eq.' + userId, programid: 'eq.' + programId});


// Fetches the enrollment IDs for a user and then fetches more details about each
// such as the course ID it's tied to
const requestUserEnrolledCourseDetails = (config, userid) => {
  return new Task((reject, resolve) => {
    getUserEnrollmentsByUserId(config, userid).fork(reject, res => {
      chainTasks(res.map(r => r.enrolid).map(id => getEnrollmentById(config, id)))
        .fork(reject, enrollments => {
          resolve({userEnrollments: res, enrollmentDetails: enrollments});
        });
    });
  });
};


/**
 * SCORM Data
 **/

const getUserScormActivityById = (config, uid, sid) =>
  createSDBQuery(config, 'mdl_scorm_scoes_track', {
    userid : 'eq.' + uid,
    scormid: 'eq.' + sid
  });

module.exports = {
    getCustomCourseFields,
    getCustomFieldsForCourseRaw,
    getCustomFieldsForCourse,
    getEvidenceFromDateCompleted,
    getEvidenceForUserId,
    getLogEventsFromDate,
    getLogEventsByAction,
    getLogEventsByActionAndCourseId,
    getLogEventsByCourseId,
    getLogEventsByUserId,
    getEnrollmentById,
    getUserEnrollmentsByUserId,
    getUserScormActivityById,
    getUserEnrollmentToProgram,
    requestUserEnrolledCourseDetails
};
