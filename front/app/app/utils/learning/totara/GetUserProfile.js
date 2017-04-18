/*eslint no-undef: "error"*/
/*eslint-env node*/


let {request}            = require('../../Rest'),
    {getParameterString} = require('../../Toolbox');

/**
 * Retrieves user profile from the Moodle core_user_get_users web service.
 * It's recommended to use username/kerberos ID as the search criteria
 *
 * @param wsConfig {urlStem, token}
 * @param field System field to query, username is recommended
 * @param value Value of the field to match
 * @returns {Promise}
 */
module.exports.requestUserProfile = (wsConfig, field, value) => {

  function createWSURL() {
    return wsConfig.urlStem + '/webservice/rest/server.php' + '?' + getParameterString({
        wstoken             : wsConfig.token,
        wsfunction          : 'core_user_get_users',
        moodlewsrestformat  : 'json',
        'criteria[0][key]'  : field,
        'criteria[0][value]': value
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

