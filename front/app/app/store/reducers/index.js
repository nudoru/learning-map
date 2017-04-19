import {combineReducers} from 'redux';

import {config} from './config';
import {lrsStatements} from './lrsStatements';
import {shadowEnrollments} from './shadowEnrollments';
import {fullUserProfile} from './fullUserProfile';
import {enrolledCourses} from './enrolledCourses';
import {userCalendar} from './userCalendar';
import {coursesInMap} from './coursesInMap';


export const reducers = combineReducers({config, lrsStatements, shadowEnrollments, fullUserProfile, enrolledCourses, userCalendar, coursesInMap});