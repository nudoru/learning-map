import * as Actions from './ActionTypes';

export const setConfig = (payload)  => {
  return {
    type: Actions.SET_CONFIG,
    payload
  };
};

export const setDefaultUser = (payload)  => {
  return {
    type: Actions.SET_DEFAULT_USER,
    payload
  };
};

export const setContent = (payload)  => {
  return {
    type: Actions.SET_CONTENT,
    payload
  };
};

export const setCurrentStructure = (payload)  => {
  return {
    type: Actions.SET_CURRENT_STRUCTURE,
    payload
  };
};

export const setCurrentStructureDates = (payload)  => {
  return {
    type: Actions.SET_CURRENT_STRUCTURE_DATES,
    payload
  };
};

export const setLRSStatements = (payload)  => {
  return {
    type: Actions.SET_LRS_STATEMENTS,
    payload
  };
};

export const setShadowEnrollments = (payload)  => {
  return {
    type: Actions.SET_SHADOW_ENROLLMENTS,
    payload
  };
};

export const setFullUserProfile = (payload)  => {
  return {
    type: Actions.SET_FULL_USER_PROFILE,
    payload
  };
};

export const setEnrolledCourses = (payload)  => {
  return {
    type: Actions.SET_ENROLLED_COURSES,
    payload
  };
};

export const setUserCalendar = (payload)  => {
  return {
    type: Actions.SET_USER_CALENDAR,
    payload
  };
};

export const setCoursesInMap = (payload)  => {
  return {
    type: Actions.SET_COURSES_IN_MAP,
    payload
  };
};