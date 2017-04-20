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
import {connectionLMSStatus} from './connectionLMSStatus';
import {connectionLRSStatus} from './connectionLRSStatus';
import {connectionSDBStatus} from './connectionSDBStatus';
import {connectionAllegoStatus} from './connectionAllegoStatus';

export const reducers = combineReducers({
  config,
  lrsStatements,
  shadowEnrollments,
  fullUserProfile,
  enrolledCourses,
  userCalendar,
  coursesInMap,
  hydratedContent,
  currentStructure,
  connectionLMSStatus,
  connectionLRSStatus,
  connectionSDBStatus,
  connectionAllegoStatus
});