import { configSelector } from '../store/selectors';
import {requestUsers} from '../utils/learningservices/combo/GetUsersFromLMSandLRS'

export const fetchUserProfile = () => {
  let config = configSelector();
  return requestUsers(config.webservice, [config.defaultuser]);
};