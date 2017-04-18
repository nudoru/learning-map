import Task from 'data.task';
import AppState from '../store/AppState';

export const fetchConfigData = () => {
  return new Task((reject, resolve) => {
    fetch('config.json')
      .then(res => res.json().then(json => {
        AppState.setState({config: json});
        resolve(json);
      }))
      .catch((err) => {
        console.warn('Error isLoading configuration', err);
        reject(err);
      });
  });
};