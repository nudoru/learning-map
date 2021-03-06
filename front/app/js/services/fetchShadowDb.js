import Task from 'data.task';
import {configSelector, userProfileSelector} from '../store/selectors'
import { requestUserEnrolledCourseDetails } from '../utils/learningservices/shadow/ShadowDB';

/*
Gets enrollment details for all courses from the shadow db
 */

export const getSBUserEnrolledCourseDetails = () => new Task((reject, resolve) => {
    requestUserEnrolledCourseDetails(configSelector().webservice.shadowdb, userProfileSelector().id).fork(reject, resolve);
  });