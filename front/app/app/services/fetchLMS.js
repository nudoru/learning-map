import Task from 'data.task';
import { is, prop } from 'ramda';
import { configSelector } from '../store/selectors';
import { requestCatalog } from '../utils/learningservices/lms/GetCourseCatalog';

const coursesInMap = data => data.map(prop('lmsID')).filter(is(Number));

export const fetchCoursesInMap = () =>
  new Task((reject, resolve) => {
    let config    = configSelector(),
        courseIds = coursesInMap(configSelector().content);
    requestCatalog(config.webservice, courseIds).fork(reject, resolve);
  });