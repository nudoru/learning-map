/*eslint no-undef: "error"*/
/*eslint-env node*/

/**
 * Retrieve user profile from a given field
 **/

let {request}            = require('../../Rest'),
    {getParameterString} = require('../../../../../../shared/utils/Toolbox'),
    wsURL                = '/webservice/rest/server.php';


function createWSURL(urlStem, token, courseid) {
  return urlStem + wsURL + '?' + getParameterString({
      wstoken           : token,
      wsfunction        : 'core_course_get_contents',
      moodlewsrestformat: 'json',
      'courseid'        : courseid
    });
}

/**
 * Retrieves extended course information from the Moodle
 * core_course_get_contents web service
 *
 * @param wsConfig {urlStem, token}
 * @param courseid Numeric ID of the course
 * @returns {Promise}
 */
let requestCourseContents = (wsConfig, courseid) => {
  return new Promise((resolve, reject) => {
    request({
      json: true,
      url : createWSURL(wsConfig.urlStem, wsConfig.token, courseid)
    }).then((data)=> {
      resolve(data);
    }).catch((err)=> {
      reject('Error fetching user profile', err);
    });
  });
};

/**
 * Retrieves extended course information for an array for course IDs
 *
 * @param wsConfig {urlStem, token}
 * @param courseidArry Array of numeric course IDs
 * @returns {Promise}
 */
let requestMultipleCourseContents = (wsConfig, courseidArry) => {

  return new Promise((resolve, reject) => {

    let requestPromises, courseContents;

    requestPromises = courseidArry.map(id => {
      return requestCourseContents(wsConfig, id).then(res => {
        res.id = id;
        return res;
      }).catch(err => {
        console.warn('Error getting course status', id, err);
      });
    });

    Promise.all(requestPromises).then(contents => {
      courseContents = contents.reduce((p, crs, i) => {
        p[courseidArry[i]] = crs;
        return p;
      }, {});

      resolve(courseContents);
    }, err => {
      console.warn('Error getting course contents', err);
      reject('Error getting course contents', courseidArry, err);
    });


  });

};

module.exports.requestCourseContents         = requestCourseContents;
module.exports.requestMultipleCourseContents = requestMultipleCourseContents;