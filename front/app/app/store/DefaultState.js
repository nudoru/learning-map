/*
 config - content from the config.json file
 + config.currentStructure - added after processing, copy of the structure.version that matches the current
 coursesInMap - LMS data for all of the objects in the config.content array w/ LMS ids
 enrolledCourses - LMS data for all of the courses the user is enrolled in
 fullUserProfile - LMS data for the user
 lrsStatements - LRS/xAPI statements for the user that match the app's config.webservice.lrs.contextid
 userCalendar - LRS data for the user's calendar
 shadowEnrollments - Shadow DB data for - enrollmentDetails, userEnrollments
 */

export default {
  config           : {
    defaultuser     : '',
    currentStructure: null,
    content         : null
  },
  lrsStatements    : [],
  shadowEnrollments: null,
  fullUserProfile  : null,
  enrolledCourses  : null,
  userCalendar     : null,
  coursesInMap     : null
};