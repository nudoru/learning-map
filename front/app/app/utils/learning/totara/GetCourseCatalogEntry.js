/*eslint no-undef: "error"*/
/*eslint-env node*/

let {request}            = require('../../Rest'),
    {
      dynamicSortObjArry,
      removeTagsStr,
      removeEntityStr,
      getParameterString,
      formatSecondsToDate
    }                    = require('../../../../../../shared/utils/Toolbox'),
    courseCategories,
    deepLinkURL          = '/course/view.php?id=',
    wsURL                = '/webservice/rest/server.php',
    webserviceConfig;

/**
 * Retrieves course catalog entries for specific courses
 *
 * @param wsConfig {urlStem, token}
 * @param courseidArray Array of course IDs to fetch from the LMS
 * @returns {Promise}
 */
module.exports.requestCourseCatalogEntry = (wsConfig, courseidArray) => {

  webserviceConfig = wsConfig;

  function createCoursesWSURL() {
    let paramString = getParameterString({
        wstoken           : wsConfig.token,
        wsfunction        : 'core_course_get_courses',
        moodlewsrestformat: 'json'
      }) + courseidArray.reduce((p, c, i) => {
        p += '&options[ids][' + i + ']=' + c;
        return p;
      }, '');

    return wsConfig.urlStem + wsURL + '?' + paramString;
  }

  return new Promise((resolve, reject) => {
    request({
      json: true,
      url : createCoursesWSURL()
    }).then((data)=> {
      let cleaned = cleanCatalogData(data);
      resolve(cleaned);
    }).catch((err)=> {
      reject('Error fetching catalog courses', err);
    });
  });
};

/*
 * Functionality below is a duplicate from GetCourseCatalog
 */

function cleanCatalogData(src) {
  return src.reduce((p, c) => {
    let category = '',
        mod      = getCourseDeliveryMode(c);
    p.push({
      category    : category,
      datecreated : formatSecondsToDate(c.timecreated),
      datemodified: formatSecondsToDate(c.timemodified),
      startdate   : formatSecondsToDate(c.startdate),
      format      : c.format,
      id          : c.id,
      coursecode  : c.idnumber,
      lang        : c.lang,
      numsections : c.numsections,
      fullname    : c.fullname,
      shortname   : c.shortname,
      summary     : removeTagsStr(removeEntityStr(c.summary)),
      deliverymode: mod,
      deeplink    : webserviceConfig.urlStem + deepLinkURL + c.id
    });
    return p;
  }, [])
    .sort(dynamicSortObjArry('fullname'));
}


/*
 Make a best guess at the mode of delivery. MoD is a custom field and doesn't come
 back via web service calls.
 */
function getCourseDeliveryMode(courseObj) {

  let format          = courseObj.format,
      coursetype      = courseObj.coursetype,
      coursefmt0Value = courseObj.courseformatoptions[0].value,
      numsections     = courseObj.hasOwnProperty('numsections') ? courseObj.numsections : null;

  if (format === 'topics' && (coursetype === 0 || coursetype === 2) && coursefmt0Value === 1 && numsections === 1) {
    return 'ROLE'
  } else if (format === 'topics' && coursetype === 2 && (coursefmt0Value === 3 || coursefmt0Value === 4)) {
    return 'Instructor-led';
  } else if (format === 'topics' && coursetype === 2 && numsections === 10) {
    return 'n/a';
  }

  // Default to this
  // format === 'singleactivity' && coursetype === 0 && coursefmt0Value === 'scorm' && numsections === null
  return 'Online self paced';
}

