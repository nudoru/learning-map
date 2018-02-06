import { configSelector } from '../store/selectors';
import {requestUsers} from '../utils/learningservices/combo/GetUsersFromLMSandLRS'

/*
Gets the user profile from the LMS
 */

export const fetchUserProfile = (userProfile) => {
  let config = configSelector();
  return requestUsers(config.webservice, [userProfile]);
};