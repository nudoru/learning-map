import Task from 'data.task';
import {request} from '../utils/Rest';
import AppState from '../store/AppState';

export const fetchConfigData = () => {
  return new Task((reject, resolve) => {
    request({json: true, url: 'config.json'}).then((data) => {
      AppState.setState({config: data});
      resolve(data);
    }).catch((err) => {
      console.warn('Error loading configuration', err);
      reject(err);
    });
  });
};