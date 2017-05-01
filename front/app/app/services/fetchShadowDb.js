import Task from 'data.task';
import AppStore from '../store/AppStore';
import { requestUserEnrolledCourseDetails } from '../utils/learningservices/shadow/ShadowDB';

export const getSBUserEnrolledCourseDetails = () => {
  let {config, fullUserProfile} = AppStore.getState();
  return new Task((reject, resolve) => {
    requestUserEnrolledCourseDetails(config.webservice.shadowdb, fullUserProfile.id).fork(reject, resolve);
  });
};