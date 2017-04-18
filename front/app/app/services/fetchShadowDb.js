import Task from 'data.task';
import AppState from '../store/AppState';
import {requestUserEnrolledCourseDetails} from '../utils/learning/ShadowDB';

export const useShadowDB = () => {
  // Falsey checking here
  return AppState.getState().config.webservice.shadowdb != null; // eslint-disable-line eqeqeq
};

export const getSBUserEnrolledCourseDetails = () => {
  let {config, fullUserProfile} = AppState.getState();
  return new Task((reject, resolve) => {
    requestUserEnrolledCourseDetails(fullUserProfile.id, config.webservice.shadowdb).then(res => {
      // console.log('Got user enrollments', res);
      resolve(res);
    }, e => {
      reject(e);
    });
  });
};