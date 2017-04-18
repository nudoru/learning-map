import Task from 'data.task';
import Either from 'data.either';
import { is, prop } from 'ramda';
import DangerousAppState from '../store/DangerousAppState';
import { requestFullUserProfile } from '../utils/learning/totara/GetFullUserProfile';
import { requestCourseCatalogEntry } from '../utils/learning/totara/GetCourseCatalogEntry';
import { requestUserCalendar } from '../utils/learning/totara/GetUserCalendar';

const coursesInMap = data => data.map(prop('lmsID')).filter(is(Number));

export const fetchUserProfile = () => {
  return new Task((reject, resolve) => {
    // console.log('getFullUserProfile');
    let {config}    = DangerousAppState.dangerousGetState();
    // console.log('Requesting user profile for ', config.defaultuser);
    requestFullUserProfile(config.webservice, config.defaultuser).then(res => {
      // TODO REDUX ACTION
      DangerousAppState.dangerousSetState({fullUserProfile: res});
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
    let {config}    = DangerousAppState.dangerousGetState(),
        courseIds   = DangerousAppState.dangerousGetState().fullUserProfile.enrolledCourses.map(prop('id'));
    requestCourseCatalogEntry(config.webservice, courseIds).then(res => {
      // TODO REDUX ACTION
      DangerousAppState.dangerousSetState({enrolledCourses: res});
      resolve(res);
    }).catch(err => {
      reject('Error getting user\'s enrolled courses');
    });
  });
};

export const fetchUserCalendar = () => {
  return new Task((reject, resolve) => {
    // console.log('fetchUserCalendar');
    let {config}    = DangerousAppState.dangerousGetState();
    Either.fromNullable(DangerousAppState.dangerousGetState().fullUserProfile.id).fold(console.error, (id) => {
      requestUserCalendar(config.webservice, id).then(res => {
        // TODO REDUX ACTION
        DangerousAppState.dangerousSetState({userCalendar: res});
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
    let {config}    = DangerousAppState.dangerousGetState(),
        courseIds   = coursesInMap(config.content);
    requestCourseCatalogEntry(config.webservice, courseIds).then(res => {
      // TODO REDUX ACTION
      DangerousAppState.dangerousSetState({coursesInMap: res});
      resolve(res);
    }).catch(err => {
      reject('Error getting courses from map');
    });
  });
};

// Task
export const fetchLMSData = () =>
  fetchUserProfile()
    .chain(res => {
      return fetchEnrolledCourses();
    })
    .chain(res => {
      return fetchUserCalendar();
    })
    .chain(res => {
      return fetchCoursesInMap();
    });