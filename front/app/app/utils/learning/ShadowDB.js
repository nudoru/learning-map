import {request} from '../Rest';

export const fetchUserEnrollmentsByUserId = (id, config) => {
  let wsFn = '/api/userEnrollmentsByUserId/';

  return new Promise((resolve, reject) => {
    request({
      json   : true,
      url    : config.endpoint + wsFn + id,
      headers: [{'x-access-token': config.token}]
    }).then((data) => {
      resolve(data);
    }).catch((err) => {
      reject('Error fetching shadow/userEnrollmentsById ' + err);
    });
  });
};


const fetchEnrollmentById = (id, config) => {
  return new Promise((resolve, reject) => {
    request({
      json   : true,
      url    : config.endpoint + '/api/enrollmentById/' + id,
      headers: [{'x-access-token': config.token}]
    }).then((data) => {
      resolve(data);
    }).catch((err) => {
      reject('Error fetching shadow/enrollmentById, ' + err);
    });
  });
};

export const requestUserEnrolledCourseDetails = (userid, config) => {
  return new Promise((resolve, reject) => {
    fetchUserEnrollmentsByUserId(userid, config).then(res => {
      // console.log('got enrollments for user', res);
      let enrollmentPromises = res.map(r => r.enrolid).map(id => fetchEnrollmentById(id, config));
      Promise.all(enrollmentPromises).then(resE => {
        // console.log('got enroll details', resE);
        resolve({userEnrollments: res, enrollmentDetails: resE});
      }).catch(err => reject)
    }).catch(err => reject);
  });
};