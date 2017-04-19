import { combineReducers } from 'redux';

import { config } from './config';
import { lrsStatements } from './lrsStatements';
import { shadowEnrollments } from './shadowEnrollments';
import { fullUserProfile } from './fullUserProfile';
import { enrolledCourses } from './enrolledCourses';
import { userCalendar } from './userCalendar';
import { coursesInMap } from './coursesInMap';
import { hydratedContent } from './hydratedContent';
import { currentStructure } from './currentStructure';

export const reducers = combineReducers({
  config,
  lrsStatements,
  shadowEnrollments,
  fullUserProfile,
  enrolledCourses,
  userCalendar,
  coursesInMap,
  hydratedContent,
  currentStructure
});