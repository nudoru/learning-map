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

let Task                     = require('data.task'),
    Either                   = require('data.either'),
    {curry, compose, concat} = require('ramda'),
    verbDictionary           = require('./ADL-Verbs'),
    activityDictionary       = require('./ADL-Activity'),
    {defaults}               = require('lodash'),
    {createLRSQuery}         = require('../shared'),
    verbURLPrefix            = 'http://adlnet.gov/expapi/verbs/',
    activityURLPrefix        = 'http://adlnet.gov/expapi/activities/',
    defaultLanguage          = 'en-US',
    lrsOptions,
    defaultProps             = {};

// Set connection options
// obj -> endpoint: Str, token: Str, version: Str
// token is the key/secret or user/pass base 64 encoded: 'key:secret' -> base64
const setLRSOptions = (obj) => {
  lrsOptions = obj;
  setDefaultsFromOptions(lrsOptions);
};

// Set defaults to be applied to each statement
const setStatementDefaults = (defaultObj) => {
  defaultProps = Object.assign(Object.create(null), defaultObj);
};

// Set basic statement props that I've commonly used
const setDefaultsFromOptions = (options) => {
  setStatementDefaults({
    result : {
      completion: true
    },
    context: {
      platform         : options.contextID,
      revision         : '1',
      contextActivities: {
        grouping: [{id: options.contextGroup}],
        parent  : [{
          id        : options.contextParent,
          objectType: 'Activity'
        }],
        category: [{
          id        : options.contextCategory,
          definition: {type: 'http://id.tincanapi.com/activitytype/source'}
        }]
      }
    }
  });
};

const _getDictionaryWordsList = (dictionary) => {
  return Object.keys(dictionary).map((key) => dictionary[key].display[defaultLanguage]);
};

// Returns array of verbs from the ADL list
const getVerbsList = () => {
  return _getDictionaryWordsList(verbDictionary);
};

// True if the verb is on the ADL list
const _validateVerb = (verb) => {
  return getVerbsList().indexOf(verb.toLowerCase()) >= 0;
};

// Returns array of activity from the ADL list
const getActivitiesList = () => {
  return _getDictionaryWordsList(activityDictionary);
};

// True if the activity is on the ADL list
const _validateActivity = (activity) => {
  return getActivitiesList().indexOf(activity.toLowerCase()) >= 0;
};

// Create an xAPI statement object from a partial
const createStatement = (partialStatement) => {
  let statement,
      {
        subjectName,
        subjectID,
        subjectAccount,
        subjectAccountID,
        verbDisplay,
        objectID,
        objectType,
        objectName
      } = partialStatement;

  // This check may be used for troubleshooting
  // if (!_validateVerb(verbDisplay)) {
  //   console.log('Verb is not in the dictionary: ' + verbDisplay);
  // }

  statement = defaults({
    actor : {
      name      : subjectName,
      mbox      : 'mailto:' + subjectID,
      objectType: 'Agent'
      //account   : {
      //  homePage: subjectAccount,
      //  name    : subjectAccountID
      //}
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
};

// Send an xAPI statement
// statement may be an array of statements
// ex: sendStatement(opts, createStatement(fragment)).fork(console.warn, log);
const sendStatement = curry((options, statement) => {
  if (options) {
    setLRSOptions(options);
  }

  return Either.fromNullable(options || lrsOptions)
    .fold(
      () => new Task.rejected('sendStatement: Need LRS options'),
      () => createLRSQuery(lrsOptions, 'POST', {}, JSON.stringify(statement))
    );
});

// Send a partial xAPI statement to the LRS. Will first be filled out w/ defaults
const sendFragment = curry((options, fragment) => compose(sendStatement(options), createStatement)(fragment));

// Helper to create an LRS statement query from an email address
const createAgentEmailQuery = email => ({
  agent: JSON.stringify({
    objectType: 'Agent',
    mbox      : `mailto:${email}`
  })
});

// Get first 100 statements from the LRS
// Statement may be an individual ID, array or null for all of them
// ex: requestStatements(opts, createAgentEmailQuery('blueberry@pietown.com')).fork(console.warn, log);
const requestStatements = curry((options, query) => {
  if (options) {
    setLRSOptions(options);
  }

  return Either.fromNullable(options || lrsOptions)
    .fold(
      () => new Task.rejected('requestStatements: Need LRS options'),
      () => createLRSQuery(lrsOptions, 'GET', query)
    );
});

const requestAllStatements = curry((options, query) => {
  if (options) {
    setLRSOptions(options);
  }

  return new Task((rej, res) => {

    const makeQuery = (more) => Either.fromNullable(options || lrsOptions)
      .fold(
        () => new Task.rejected('requestAllStatements: Need LRS options'),
        () => {
          return more ? createLRSQuery(lrsOptions, 'GET', more) : createLRSQuery(lrsOptions, 'GET', query);
        }
      );

    // Recursively execute tasks
    const next = (task, accumulator) => {
      task.fork(e => {
        console.error(e);
        rej(e);
      }, statmentRes => {
        if (statmentRes.more) {
          next(makeQuery(statmentRes.more), concat(accumulator, statmentRes.statements));
        } else {
          res(concat(accumulator, statmentRes.statements));
        }
      });
    };

    // Start
    next(makeQuery(null), []);
  });

});

/*let acc = [],
 counter = 0,
 more;

 if (options) {
 setLRSOptions(options);
 }

 //'/data/xAPI/statements?agent=%7B%22objectType%22%3A%22Agent%22%2C%22mbox%22%3A%22mailto%3Amperkins%40redhat.com%22%7D&offset=100'
 const makeQuery = (more) => Either.fromNullable(options || lrsOptions)
 .fold(
 () => new Task.rejected('getStatements: Need LRS options'),
 () => {
 return more ? createLRSQueryWithParam(lrsOptions, 'GET', more) : createLRSQuery(lrsOptions, 'GET', query)
 }
 );

 const doFetch = () => new Task((rej, res) => {
 makeQuery().fork(rej, statements => {
 if (statements.more !== null) {
 console.log('res has a more!', statements.more);
 res('foo');
 } else {
 res(statements);
 }
 });
 });

 return doFetch();*/

module.exports = {
  setLRSOptions,
  setStatementDefaults,
  getVerbsList,
  getActivitiesList,
  createStatement,
  sendStatement,
  sendFragment,
  createAgentEmailQuery,
  requestStatements,
  requestAllStatements
};