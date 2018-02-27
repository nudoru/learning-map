import Task from 'data.task';
import { is, prop, either } from 'ramda';
import { configSelector } from '../store/selectors';
import { requestCatalog } from '../utils/learningservices/lms/GetCourseCatalog';

// Filter out lms course IDs from the config data
const coursesInMap = data => [].concat.apply([], data.map(prop('lmsID')).filter(either(is(Number), is(Array))));


export const fetchCoursesInMap = () =>
  new Task((reject, resolve) => {
    let config    = configSelector(),
        courseIds = coursesInMap(configSelector().content);
    requestCatalog(config.webservice, courseIds).fork(reject, resolve);
  });