import Task from 'data.task';
import {configSelector, userProfileSelector} from '../store/selectors'
import { requestUserEnrolledCourseDetails } from '../utils/learningservices/shadow/ShadowDB';

export const getSBUserEnrolledCourseDetails = () => {
  return new Task((reject, resolve) => {
    requestUserEnrolledCourseDetails(configSelector().webservice.shadowdb, userProfileSelector().id).fork(reject, resolve);
  });
};