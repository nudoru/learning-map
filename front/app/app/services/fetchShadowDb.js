import Task from 'data.task';
import DangerousAppState from '../store/DangerousAppState';
import {requestUserEnrolledCourseDetails} from '../utils/learning/ShadowDB';

export const getSBUserEnrolledCourseDetails = () => {
  let {config, fullUserProfile} = DangerousAppState.dangerousGetState();
  return new Task((reject, resolve) => {
    requestUserEnrolledCourseDetails(fullUserProfile.id, config.webservice.shadowdb).then(res => {
      // console.log('Got user enrollments', res);
      resolve(res);
    }, e => {
      reject(e);
    });
  });
};