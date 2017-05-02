import Task from 'data.task';
import { is, prop } from 'ramda';
import AppStore from '../store/AppStore';
import { configSelector } from '../store/selectors';
import {
  setCoursesInMap,
  setEnrolledCourses,
  setFullUserProfile,
  setUserCalendar
} from '../store/actions/Actions';
import { requestFullUserProfile } from '../utils/learning/totara/GetFullUserProfile';
import { requestCourseCatalogEntry } from '../utils/learning/totara/GetCourseCatalogEntry';

const coursesInMap = data => data.map(prop('lmsID')).filter(is(Number));

export const fetchUserProfile = () => {
  return new Task((reject, resolve) => {
    // console.log('getFullUserProfile');
    let config = configSelector();
    // console.log('Requesting user profile for ', config.defaultuser);
    requestFullUserProfile(config.webservice, config.defaultuser).then(res => {
      console.log('Fetched profile', res);
      AppStore.dispatch(setFullUserProfile(res));
      resolve(res);
    }).catch(err => {
      console.warn(err, 'Error getting user\'s profile ' + config.defaultuser);
      reject('Error getting user\'s profile ' + config.defaultuser);
    });
  });
};

export const fetchCoursesInMap = () => {
  return new Task((reject, resolve) => {
    // console.log('fetchCoursesInMap');
    let config    = configSelector(),
        courseIds = coursesInMap(config.content);
    requestCourseCatalogEntry(config.webservice, courseIds).then(res => {
      console.log('Fetched courses in map', res);
      AppStore.dispatch(setCoursesInMap(res));
      resolve(res);
    }).catch(err => {
      reject('Error getting courses from map '+err);
    });
  });
};

// Task
export const fetchLMSData = () =>
  fetchUserProfile()
    .chain(fetchCoursesInMap);