import Task from 'data.task';

/*
Load the config file. By default this is 'config.json' but may be changed with a
URL parameter: ?map=filename
'.json' will be appended here
 */

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