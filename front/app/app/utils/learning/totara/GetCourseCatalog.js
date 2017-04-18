/*eslint no-undef: "error"*/
/*eslint-env node*/

let {request}           = require('../../Rest'),
    {requestCategories} = require('./GetCategories'),
    {
      dynamicSortObjArry,
      removeTagsStr,
      removeEntityStr,
      getParameterString,
      formatSecondsToDate
    }                   = require('../../Toolbox'),
    webserviceConfig,
    wsURL               = '/webservice/rest/server.php',
    deepLinkURL         = '/course/view.php?id=',
    courseCategories,
    hiddenCategories    = ['(hidden) Course Templates', 'n/a'];


/**
 * Retrieves a list of courses from the Moodle core_course_get_courses web
 * service.
 * It first fetches the list of categories so that the plain text category can
 * be assigned to each course from the category ID prop.
 * The RHU mode of delivery custom field isn't conveyed via the results, so we
 * guess at the value based on the course template set up.
 * Courses matching one of the hiddenCategories are removed from the results.
 * Only courses available to all audiences are returned.
 *
 * @param wsConfig {urlStem, token}
 * @returns {Promise}
 */
module.exports.requestCatalog = (wsConfig) => {

  webserviceConfig = wsConfig;

  return new Promise((resolve, reject) => {
    let categoryReq, catalogReq;

    function createWSURL(funct) {
      return webserviceConfig.urlStem + wsURL + '?' + getParameterString({
          wstoken           : webserviceConfig.token,
          wsfunction        : funct,
          moodlewsrestformat: 'json'
        });
    }

    categoryReq = requestCategories(wsConfig).then((data)=>{
      console.log('Loaded categories');
      return data;
    }).catch((err)=> {
      reject('Error fetching course categories', err);
    });

    catalogReq = request({
      json: true,
      url : createWSURL('core_course_get_courses')
    }).then((data)=> {
      console.log('Loaded catalog');
      return data;
    }).catch((err)=> {
      reject('Error fetching course catalog', err);
    });

    Promise.all([categoryReq, catalogReq]).then(data => {
      courseCategories = data[0];
      let cleanedCatalogData = cleanCatalogData(data[1]);
      resolve({
        courseCategories,
        cleanedCatalogData: cleanedCatalogData.data,
        courseCategoryList: cleanedCatalogData.categories,
        courseMODList     : cleanedCatalogData.mod
      });
    }, err => {
      console.warn('Error fetching catalog',err);
      reject(err);
    });

  });
};

function cleanCatalogData(src) {
  let uniqueCategories = {},
      uniqueMoD        = {},
      data             = src.reduce((p, c) => {
        let category = getCourseCategory(c.categoryid),
            mod;
        // None in the hidden categories and only available to all learners
        if (!hiddenCategories.includes(category) && c.audiencevisible === 2) {
          mod = getCourseDeliveryMode(c);
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

          // Build a unique list
          uniqueCategories[category] = null;
          uniqueMoD[mod]             = null;

        }
        return p;
      }, [])
        .sort(dynamicSortObjArry('fullname'));

  return {
    data,
    categories: Object.keys(uniqueCategories),
    mod       : Object.keys(uniqueMoD)
  };
}

// Match the ID of a course category to the loaded courseCategories
function getCourseCategory(courseCategoryID) {
  let category = courseCategories.filter((cat) => {
    return cat.id === courseCategoryID;
  })[0];

  // Course id === 1 has no category ID and will break filter
  // This seems to be a system default entry for the name of the LMS
  return category && category.hasOwnProperty('name') ? category.name : 'n/a';
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