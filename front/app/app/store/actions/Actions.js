import * as Actions from './ActionTypes';

export const setConfig = (payload) => ({
    type: Actions.SET_CONFIG,
    payload
  });

export const setDefaultUser = (payload) => ({
    type: Actions.SET_DEFAULT_USER,
    payload
  });

export const setHydratedContent = (payload) => ({
    type: Actions.SET_HYDRATEDCONTENT,
    payload
  });

export const setCurrentStructure = (payload) => ({
    type: Actions.SET_CURRENT_STRUCTURE,
    payload
  });

export const setLRSStatements = (payload) => ({
    type: Actions.SET_LRS_STATEMENTS,
    payload
  });

export const setShadowEnrollments = (payload) => ({
    type: Actions.SET_SHADOW_ENROLLMENTS,
    payload
  });

export const setFullUserProfile = (payload) => ({
    type: Actions.SET_FULL_USER_PROFILE,
    payload
  });

export const setEnrolledCourses = (payload) => ({
    type: Actions.SET_ENROLLED_COURSES,
    payload
  });

export const setUserCalendar = (payload) => ({
    type: Actions.SET_USER_CALENDAR,
    payload
  });

export const setCoursesInMap = (payload) => ({
    type: Actions.SET_COURSES_IN_MAP,
    payload
  });