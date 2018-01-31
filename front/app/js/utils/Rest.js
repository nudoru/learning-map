/*eslint no-undef: "error"*/
/*eslint-env node*/

/*
 Simple REST call module that returns a promise.
 Matt Perkins, hello@mattperkins.me
 */

const combineParams = params => {
  return !params ? '' : params.reduce((acc, pair) => {
      let key = Object.keys(pair)[0],
          p   = key + '=' + encodeURIComponent(pair[key]);
      acc.push(p);
      return acc;
    }, ['?']).join('&');
};

export const request = (reqObj) =>
  new Promise((resolve, reject) => {

    let xhr     = new XMLHttpRequest(),
        json    = reqObj.json || false,
        method  = reqObj.method ? reqObj.method.toUpperCase() : 'GET',
        url     = reqObj.url,
        headers = reqObj.headers || [],
        data    = reqObj.data || null,
        params  = combineParams(reqObj.params);

    xhr.open(method, url + params, true);

    xhr.onerror   = err => reject;
    xhr.ontimeout = err => reject;
    xhr.onabort   = err => reject;

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            if (json) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(xhr.responseText);
            }
          } catch (e) {
            reject('Error parsing result. Status: ' + xhr.status + ', Response: ' + xhr.response);
          }
        } else {
          reject(xhr.status + ', ' + xhr.statusText);
        }
      }
    };

    headers.forEach(headerPair => {
      let prop  = Object.keys(headerPair)[0],
          value = headerPair[prop];
      if (prop && value) {
        xhr.setRequestHeader(prop, value);
      }
    });

    if (json && method !== "GET") {
      xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    } else if (json && method === "GET") {
      xhr.setRequestHeader("Accept", "application/json");
    }

    xhr.send(data);
  });
