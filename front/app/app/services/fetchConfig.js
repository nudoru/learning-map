import Task from 'data.task';
import DangerousAppState from '../store/DangerousAppState';

export const fetchConfigData = () => {
  return new Task((reject, resolve) => {
    fetch('config.json')
      .then(res => res.json().then(json => {
        // TODO REDUX ACTION
        DangerousAppState.dangerousSetState({config: json});
        resolve(json);
      }))
      .catch((err) => {
        console.warn('Error isLoading configuration', err);
        reject(err);
      });
  });
};