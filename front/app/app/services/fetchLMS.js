import Task from 'data.task';
import Either from 'data.either';
import {curry, prop, isNil, is} from 'ramda';
import AppState from '../store/AppState';
import {requestFullUserProfile} from '../utils/learning/totara/GetFullUserProfile';
import {requestCourseCatalogEntry} from '../utils/learning/totara/GetCourseCatalogEntry';
import {requestUserCalendar} from '../utils/learning/totara/GetUserCalendar';

const coursesInMap = data => data.map(prop('lmsID')).filter(is(Number));

export const fetchUserProfile = () => {
  return new Task((reject, resolve) => {
    // console.log('getFullUserProfile');
    let {config}    = AppState.getState();
    // console.log('Requesting user profile for ', config.defaultuser);
    requestFullUserProfile(config.webservice, config.defaultuser).then(res => {
      AppState.setState({fullUserProfile: res});
      resolve(res);
    }).catch(err => {
      console.warn(err, 'Error getting user\'s profile ' + config.defaultuser);
      reject('Error getting user\'s profile ' + config.defaultuser);
    });
  });
};

export const fetchEnrolledCourses = () => {
  return new Task((reject, resolve) => {
    // console.log('fetchEnrolledCourses');
    let {config}    = AppState.getState(),
        courseIds   = AppState.getState().fullUserProfile.enrolledCourses.map(prop('id'));
    requestCourseCatalogEntry(config.webservice, courseIds).then(res => {
      AppState.setState({enrolledCourses: res});
      resolve(res);
    }).catch(err => {
      reject('Error getting user\'s enrolled courses');
    });
  });
};

export const fetchUserCalendar = () => {
  return new Task((reject, resolve) => {
    // console.log('fetchUserCalendar');
    let {config}    = AppState.getState();
    Either.fromNullable(AppState.getState().fullUserProfile.id).fold(console.error, (id) => {
      requestUserCalendar(config.webservice, id).then(res => {
        AppState.setState({userCalendar: res});
        resolve(res);
      }).catch(err => {
        reject('Error getting user\'s calendar');
      });
    })
  });
};

export const fetchCoursesInMap = () => {
  return new Task((reject, resolve) => {
    // console.log('fetchCoursesInMap');
    let {config}    = AppState.getState(),
        courseIds   = coursesInMap(config.content);
    requestCourseCatalogEntry(config.webservice, courseIds).then(res => {
      AppState.setState({coursesInMap: res});
      resolve(res);
    }).catch(err => {
      reject('Error getting courses from map');
    });
  });
};

// Task
export const fetchLMSData = () =>
  fetchUserProfile()
    .chain((r) => {
      return fetchEnrolledCourses();
    })
    .chain((r) => {
      return fetchUserCalendar();
    })
    .chain((r) => {
      return fetchCoursesInMap();
    });