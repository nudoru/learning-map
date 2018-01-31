import Task from 'data.task';

export const fetchConfigData = (url) => {
  return new Task((reject, resolve) => {
    fetch(url+'.json')
      .then(res => res.json().then(json => {
        resolve(json);
      }))
      .catch((err) => {
        console.warn('Error isLoading configuration', err);
        reject(err);
      });
  });
};