/*eslint no-undef: "error"*/
/*eslint-env node*/

let {request}            = require('../../Rest'),
    {getParameterString} = require('../../../../../../shared/utils/Toolbox'),
    wsURL                = '/webservice/rest/server.php';

/**
 * Retrieves a list of categories from the Moodle core_course_get_categories web
 * service
 *
 * @param wsConfig {urlStem, token}
 * @returns {Promise}
 */
module.exports.requestCategories = (wsConfig) => {

  function createWSURL(funct) {
    return wsConfig.urlStem + wsURL + '?' + getParameterString({
        wstoken           : wsConfig.token,
        wsfunction        : funct,
        moodlewsrestformat: 'json'
      });
  }

  return new Promise((resolve, reject) => {
    request({
      json: true,
      url : createWSURL('core_course_get_categories')
    }).then((data)=> {
      resolve(data);
    }).catch((err)=> {
      reject('Error fetching courseCategories', err);
    });
  });
};

