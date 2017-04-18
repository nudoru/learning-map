/*eslint no-undef: "error"*/
/*eslint-env node*/

let {getParameterString} = require('../../Toolbox');

module.exports.createURL = (wsurl, token, funct) => {
  return wsurl + '?' + getParameterString({
      wstoken           : token,
      wsfunction        : funct,
      moodlewsrestformat: 'json'
    });
};
