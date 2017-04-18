/*eslint no-undef: "error"*/
/*eslint-env node*/


let {request}            = require('../../Rest'),
    {getParameterString} = require('../../../../../../shared/utils/Toolbox'),
    wsURL                = '/webservice/rest/server.php';

/**
 * Retrieves user profile and enrolled course information from the Moodle
 * core_user_get_course_user_profiles web service.
 * Response includes courses (SCORM and ILT) the user is enrolled in. Courses
 * are in-progress and completed.
 *
 * @param wsConfig {urlStem, token}
 * @param userid Numeric ID of the user
 * @returns {Promise}
 */
module.exports.requestCourseProfileForUser = (wsConfig, userid) => {

  function createWSURL() {
    return wsConfig.urlStem + wsURL + '?' + getParameterString({
        wstoken                : wsConfig.token,
        wsfunction             : 'core_user_get_course_user_profiles',
        moodlewsrestformat     : 'json',
        'userlist[0][userid]'  : userid,
        'userlist[0][courseid]': 1 // This needs to be >0 but results seem to be the same for any value
      });
  }

  return new Promise((resolve, reject) => {
    request({
      json: true,
      url : createWSURL()
    }).then((data)=> {
      resolve(data);
    }).catch((err)=> {
      reject('Error fetching user profile', err);
    });
  });
};

