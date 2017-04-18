/*eslint no-undef: "error"*/
/*eslint-env node*/


let {requestUserProfile}          = require('./GetUserProfile'),
    {requestCourseStatusForUser}  = require('./GetCourseStatusForUser'),
    {requestCourseProfileForUser} = require('./GetCourseProfileForUser'),
    {requestUserCalendar}         = require('./GetUserCalendar'),
    {formatSecondsToDate}         = require('../../Toolbox');

/**
 * Retrieves user profile, enrolled courses and their status by combining several
 * web service calls.
 *
 * @param wsConfig {urlStem, token}
 * @param username User name
 * @returns {Promise}
 */
module.exports.requestFullUserProfile = (wsConfig, username) => {

  // Get the base user information in this series of calls
  function requestBaseUserProfile() {
    return new Promise((resolve, reject) => {
      let queryField = 'username', userProfile, userID, userCalendarReq, userCourseProfileReq;

      if (username.indexOf('@') > 0) {
        queryField = 'email';
      }

      // Get the user profile in order to get the user ID to get the rest of the info
      requestUserProfile(wsConfig, queryField, username).then(res => {
        userProfile = res.users[0];
        userID      = userProfile.id;

        // console.log('Got base user, req the rest...');

        userCalendarReq = requestUserCalendar(wsConfig, userID).then(res => {
          // console.log('Got calendar ...');
          return res;
        }).catch(err => {
          console.warn('Error getting user calendar', err);
        });

        userCourseProfileReq = requestCourseProfileForUser(wsConfig, userID).then(res => {
          // console.log('Got course profile ...');
          return res;
        }).catch(err => {
          console.warn('Error getting user course profile', err);
        });

        Promise.all([userCalendarReq, userCourseProfileReq]).then(resArray => {
          userProfile.calendar        = resArray[0];
          userProfile.enrolledCourses = resArray[1][0].enrolledcourses;
          // console.log('Cleaning ...');
          resolve(cleanUserProfile(userProfile));
        }, err => {
          console.warn('General error, getting user profile', err);
          reject('Error info for user', username, err);
        });

      }).catch(err => {
        reject('Error getting profile for user', username, err);
      });

    });
  }

  // For each enrolled course, need to make a call to get status/completion
  return new Promise((resolve, reject) => {

    requestBaseUserProfile().then(baseUser => {

      let enrolledCourseIDs = [], enrolledPromises;

      if (baseUser.enrolledCourses) {
        enrolledCourseIDs = baseUser.enrolledCourses.map(crs => crs.id);

        enrolledPromises  = enrolledCourseIDs.map(id => {
          return requestCourseStatusForUser(wsConfig, id, baseUser.id).then(res => {
            res.id = id;
            return res;
          }).catch(err => {
            console.warn('Error getting course status', id, err);
          });
        });

        Promise.all(enrolledPromises).then(resStatus => {
          baseUser.enrolledCourses.map(crs => {
            let matchStatus = resStatus.filter(stat => stat.id === crs.id)[0];
            crs.status      = matchStatus.completionstatus;
            return crs;
          });
          resolve(baseUser);
        }, err => {
          console.warn('Error getting user course status', err);
          reject('Error getting course status for user', username, err);
        });

      } else {
        baseUser.enrolledCourses = [];
        resolve(baseUser);
      }

    }).catch(err => {
      console.warn('Error getting base user profile', err);
      reject('Error getting profile for user ' + username + ' ' + err);
    })
  });

};


// Clean up some of the data in the profile object for a better result
function cleanUserProfile(profileObject) {
  let cleaned = Object.assign({}, profileObject);

  cleaned.firstaccess = formatSecondsToDate(profileObject.firstaccess);
  cleaned.lastaccess  = formatSecondsToDate(profileObject.lastaccess);

  cleaned.customfields = profileObject.customfields.reduce((acc, field) => {
    let val = field.value;

    if (field.type === 'datetime') {
      val = formatSecondsToDate(val);
    } else if (field.type === 'checkbox') {
      val = val === '1';
    }

    acc[field.shortname] = val;
    return acc;
  }, {});

  return cleaned;
}
