import { combineReducers } from 'redux';

import { config } from './config';
import { lrsStatements } from './lrsStatements';
import { allegoStatements } from './allegoStatements';
import { shadowEnrollments } from './shadowEnrollments';
import { currentUser } from './currentUser';
import { userProfile } from './userProfile';
import { coursesInMap } from './coursesInMap';
import { hydratedContent } from './hydratedContent';
import { currentStructure } from './currentStructure';
import { connectionLMSStatus } from './connectionLMSStatus';
import { connectionLRSStatus } from './connectionLRSStatus';
import { connectionSDBStatus } from './connectionSDBStatus';
import { programEnrollment } from './programEnrollment.js';
import { requiredItemsCompleted } from './requiredItemsCompleted.js';

export const reducers = combineReducers({
    config,
    lrsStatements,
    allegoStatements,
    shadowEnrollments,
    currentUser,
    programEnrollment,
    userProfile,
    coursesInMap,
    hydratedContent,
    currentStructure,
    connectionLMSStatus,
    connectionLRSStatus,
    connectionSDBStatus,
    requiredItemsCompleted
});