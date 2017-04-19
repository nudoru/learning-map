import Task from 'data.task';
import AppStore from '../store/AppStore';
import {requestUserEnrolledCourseDetails} from '../utils/learning/ShadowDB';

export const getSBUserEnrolledCourseDetails = () => {
  let {config, fullUserProfile} = AppStore.getState();
  return new Task((reject, resolve) => {
    requestUserEnrolledCourseDetails(fullUserProfile.id, config.webservice.shadowdb).then(res => {
      resolve(res);
    }, e => {
      reject(e);
    });
  });
};