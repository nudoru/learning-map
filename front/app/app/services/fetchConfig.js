import Task from 'data.task';

export const fetchConfigData = () => {
  return new Task((reject, resolve) => {
    fetch('config.json')
      .then(res => res.json().then(json => {
        resolve(json);
      }))
      .catch((err) => {
        console.warn('Error isLoading configuration', err);
        reject(err);
      });
  });
};