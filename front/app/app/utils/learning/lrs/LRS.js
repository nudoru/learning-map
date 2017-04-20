/**
 * Simple module to send xAPI statements to an LRS
 * Matt Perkins, mperkins@redhat.com
 * Last Updated, 1/6/17
 *
 * Full doc https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#result
 * TinCan Module docs http://rusticisoftware.github.io/TinCanJS/
 * Statements https://tincanapi.com/statements-101/
 * More https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#parttwo
 * XAPI Wrapper here https://github.com/adlnet/xAPIWrapper/blob/master/src/xapiwrapper.js
 *
 */

let Task                 = require('data.task'),
    verbDictionary = require('./ADL-Verbs'),
    activityDictionary   = require('./ADL-Activity'),
    {defaults}           = require('lodash'),
    {request}            = require('../../Rest'),
    lrsConfig,
    defaultProps         = {},
    verbURLPrefix        = 'http://adlnet.gov/expapi/verbs/',
    activityURLPrefix    = 'http://adlnet.gov/expapi/activities/',
    defaultLanguage      = 'en-US';

export const LRS = {

  // Set connection options
  // obj -> endpoint: Str, token: Str, version: Str
  configure(obj) {
    lrsConfig = obj;
  },

  // Set defaults to be applied to each statement
  setStatementDefaults(defaultObj) {
    defaultProps = Object.assign(Object.create(null), defaultObj);
  },

  // Returns array of verbs from the ADL list
  getVerbsList() {
    return this.getDictionaryWordsList(verbDictionary);
  },

  // True if the verb is on the ADL list
  validateVerb(verb) {
    return this.getVerbsList().indexOf(verb.toLowerCase()) >= 0;
  },

  // Returns array of activity from the ADL list
  getActivitiesList() {
    return this.getDictionaryWordsList(activityDictionary);
  },

  // True if the activity is on the ADL list
  validateActivity(activity) {
    return this.getActivitiesList().indexOf(activity.toLowerCase()) >= 0;
  },

  getDictionaryWordsList(dictionary) {
    return Object.keys(dictionary).map((key) => dictionary[key].display[defaultLanguage]);
  },


  // Create an xAPI statement object from a partial
  createStatement(partialStatement) {
    let statement,
        {
          subjectName,
          subjectID,
          verbDisplay,
          objectID,
          objectType,
          objectName
        } = partialStatement;

    // if (!this.validateVerb(verbDisplay)) {
    //   console.log('Verb is not in the dictionary: ' + verbDisplay);
    // }

    statement = defaults({
      actor : {
        name: subjectName,
        mbox: 'mailto:' + subjectID
      },
      verb  : {
        id     : verbURLPrefix + verbDisplay.toLowerCase(),
        display: {'en-US': verbDisplay.toLowerCase()}
      },
      object: {
        id        : objectID,
        definition: {
          type: objectType ? activityURLPrefix + objectType : null,
          name: {'en-US': objectName}
        }
      }
    }, defaultProps);
    return statement;
  },

  // Send an xAPI statement
  // statement may be an array of statements
  sendStatement(statement) {
    console.log('Sending statement',statement);
    return new Task((reject, resolve) => {
      request({
        json   : true,
        method : 'POST',
        url    : lrsConfig.endpoint + '/statements',
        headers: [{'Authorization': 'Basic ' + lrsConfig.token}, {'X-Experience-API-Version': lrsConfig.version}],
        data   : JSON.stringify(statement)
      })
        .then((data) => {
          // Data will be an array with the statement ID as the member -> [id]
          resolve(data);
        })
        .catch((err) => {
          console.warn('Error sending statement', err);
          reject(err);
        });
    });
  },

  // Get statements from the LRS
  // Statement may be an individual ID, array or null for all of them
  /*
   Statements for a user [{agent: JSON.stringify({objectType: 'Agent', mbox: 'mailto:joe@redhat.com'})}]
   */

  getStatements(queryObj) {
    return new Task((reject, resolve) => {
      request({
        json   : true,
        method : 'GET',
        url    : lrsConfig.endpoint + '/statements',
        headers: [{'Authorization': 'Basic ' + lrsConfig.token}, {'X-Experience-API-Version': lrsConfig.version}],
        params   : queryObj
      })
        .then(data => {
          // Data will be an array with the statement ID as the member -> [id]
          resolve(data);
        })
        .catch(err => {
          console.warn('Error getting statements', err);
          reject(err);
        });
    });
  }

};