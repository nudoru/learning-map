import Task from 'data.task';
import Either from 'data.either';
import { is, prop } from 'ramda';
import AppStore from '../store/AppStore';
import {setFullUserProfile, setEnrolledCourses, setUserCalendar, setCoursesInMap} from '../store/actions/Actions';
import { requestFullUserProfile } from '../utils/learning/totara/GetFullUserProfile';
import { requestCourseCatalogEntry } from '../utils/learning/totara/GetCourseCatalogEntry';
import { requestUserCalendar } from '../utils/learning/totara/GetUserCalendar';

const coursesInMap = data => data.map(prop('lmsID')).filter(is(Number));

export const fetchUserProfile = () => {
  return new Task((reject, resolve) => {
    // console.log('getFullUserProfile');
    let {config}    = AppStore.getState();
    // console.log('Requesting user profile for ', config.defaultuser);
    requestFullUserProfile(config.webservice, config.defaultuser).then(res => {
      console.log('Fetched profile',res);
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
    let {config}    = AppStore.getState(),
        courseIds   = coursesInMap(config.content);
    requestCourseCatalogEntry(config.webservice, courseIds).then(res => {
      console.log('Fetched courses in map', res);
      AppStore.dispatch(setCoursesInMap(res));
      resolve(res);
    }).catch(err => {
      reject('Error getting courses from map');
    });
  });
};

// Task
export const fetchLMSData = () =>
  fetchUserProfile()
    .chain(fetchCoursesInMap);