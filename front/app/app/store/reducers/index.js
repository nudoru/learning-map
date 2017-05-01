import { combineReducers } from 'redux';

import { config } from './config';
import { lrsStatements } from './lrsStatements';
import { shadowEnrollments } from './shadowEnrollments';
import { userProfile } from './userProfile';
import { coursesInMap } from './coursesInMap';
import { hydratedContent } from './hydratedContent';
import { currentStructure } from './currentStructure';
import {connectionLMSStatus} from './connectionLMSStatus';
import {connectionLRSStatus} from './connectionLRSStatus';
import {connectionSDBStatus} from './connectionSDBStatus';

export const reducers = combineReducers({
  config,
  lrsStatements,
  shadowEnrollments,
  userProfile,
  coursesInMap,
  hydratedContent,
  currentStructure,
  connectionLMSStatus,
  connectionLRSStatus,
  connectionSDBStatus
});