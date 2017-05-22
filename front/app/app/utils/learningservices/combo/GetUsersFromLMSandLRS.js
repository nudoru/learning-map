let {curry, concat}          = require('ramda'),
    Task                     = require('data.task'),
    {requestFullUserProfile} = require('../lms/GetFullUserProfile'),
    {
      createAgentEmailQuery,
      requestAllStatements,
      createAggregateQuery,
      requestAggregate
    }                        = require('../lrs/LRS'),
    {chainTasks}             = require('../shared');

const requestUsers = (wsConfig, usersArry, onProgressFn = () => {}) =>
  usersArry.length <= 10 ? requestUsersAsync(wsConfig, usersArry, onProgressFn) : requestUsersSeq(wsConfig, usersArry, onProgressFn);

// Request user details all at once
// TODO can i update progress?
const requestUsersAsync = (wsConfig, usersArry, onProgressFn) =>
  chainTasks(_toTaskArray(wsConfig, usersArry));

// Sequentially request user details
// onProgress is called with the # of users left before each new user is querried
const requestUsersSeq = (wsConfig, usersArry, onProgressFn = () => {}) =>
  _sequenceTasks(_toTaskArray(wsConfig, usersArry), onProgressFn);

// Sequentially execute Tasks
// taskArry - array of Tasks to fork
// onProgressFn - called w/ number of tasks remaining
const _sequenceTasks = (taskArry, onProgressFn) =>
  new Task((rej, res) => {
    // Recursively execute tasks
    const next = (tasks, accumulator) => {
      let task = tasks.shift();
      if (task) {
        onProgressFn(tasks.length);
        task.fork(e => {
          // Warn of error but don't bail
          console.warn(e);
          next(tasks, accumulator);
        }, res => {
          next(tasks, concat(accumulator, [res]));
        });
      } else {
        res(accumulator);
      }
    };
    // Start
    next(taskArry, []);
  });

const _toTaskArray = (wsConfig, list) => list.map(_getUser(wsConfig));

// This is the best way but it's not working - error w/ nested tasks?
//  failing on getcourseprofile core_get_course_status webservice call
//Task.of(_handleResults(username))
//.ap(requestFullUserProfile(wsConfig, username))
//.ap(_requestLRSUser(wsConfig.lrs, username));

const _getUser = curry((wsConfig, username) =>
  chainTasks([requestFullUserProfile(wsConfig, username, {calendar: false}),
    _requestLRSUser(wsConfig, username)])
    .map(_arrangeResults(username)));

const _requestLRSUser = (wsConfig, username) =>
  wsConfig.hasOwnProperty('lrs') ? requestAggregate(wsConfig.lrs, createAggregateQuery({
    ['statement.actor.mbox']: 'mailto:' + username
  })) : Task.of([]);

const _arrangeResults = curry((username, results) => ({
  [username]: {
    lms: results[0], lrs: results[1]
    //lms: results[0].firstname, lrs: results[1].length
  }
}));

module.exports = {requestUsers};