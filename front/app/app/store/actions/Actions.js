import * as ACTIONS from './ActionsEnum';

export const SetConfig = (payload)  => {
  return {
    type: ACTIONS.SET_CONFIG,
    payload
  };
};

export const SetDefaultUser = (payload)  => {
  return {
    type: ACTIONS.SET_DEFAULT_USER,
    payload
  };
};

export const SetContent = (payload)  => {
  return {
    type: ACTIONS.SET_CONTENT,
    payload
  };
};

export const SetCurrentStructure = (payload)  => {
  return {
    type: ACTIONS.SET_CURRENT_STRUCTURE,
    payload
  };
};

export const SetCurrentStructureDates = (payload)  => {
  return {
    type: ACTIONS.SET_CURRENT_STRUCTURE_DATES,
    payload
  };
};

export const SetLRSStatements = (payload)  => {
  return {
    type: ACTIONS.SET_LRS_STATEMENTS,
    payload
  };
};

export const SetShadowEnrollments = (payload)  => {
  return {
    type: ACTIONS.SET_SHADOW_ENROLLMENTS,
    payload
  };
};

export const SetFullUserProfile = (payload)  => {
  return {
    type: ACTIONS.SET_FULL_USER_PROFILE,
    payload
  };
};

export const SetEnrolledCourses = (payload)  => {
  return {
    type: ACTIONS.SET_ENROLLED_COURSES,
    payload
  };
};

export const SetUserCalendar = (payload)  => {
  return {
    type: ACTIONS.SET_USER_CALENDAR,
    payload
  };
};

export const SetCoursesInMap = (payload)  => {
  return {
    type: ACTIONS.SET_COURSES_IN_MAP,
    payload
  };
};