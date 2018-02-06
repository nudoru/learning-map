/*
 config - content from the config.json file
 + config.currentStructure - added after processing, copy of the structure.version
  that matches the current
 coursesInMap - LMS data for all of the objects in the config.content array w/ LMS ids
 enrolledCourses - LMS data for all of the courses the user is enrolled in
 userProfile - LMS data for the user
 lrsStatements - LRS/xAPI statements for the user that match the app's
  config.webservice.lrs.contextid
 shadowEnrollments - Shadow DB data for - enrollmentDetails, userEnrollments
 */

export default {
  config             : {
    // There will be additional props here from the config json file
    defaultuser     : '',
    currentStructure: {}
  },
  lrsStatements      : [],
  shadowEnrollments  : {
    userEnrollments  : [],
    enrollmentDetails: []
  },
  currentUser        : '',
  allegoStatements   : [],
  userProfile        : {},
  coursesInMap       : [],
  currentStructure   : {},
  hydratedContent    : [],
  connectionLMSStatus: true,
  connectionLRSStatus: true,
  connectionSDBStatus: true
};