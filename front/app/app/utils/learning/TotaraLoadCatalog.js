/*eslint no-undef: "error"*/
/*eslint-env node*/

/**
 * Retrieves a list of categories, courses, unique category names based on the courses
 * and a guess at the possible mode of delivery for each course.
 */

let {createURL}      = require('./TotaraUtils'),
    {request}        = require('../Rest'),
    {
      dynamicSortObjArry,
      uniqueArry,
      removeTagsStr,
      removeEntityStr
    }                = require('../../../../../../shared/utils/Toolbox'),
    webserviceConfig,
    categories,
    hiddenCategories = ['(hidden) Course Templates', 'n/a'],
    catalog,
    courseCategoryList,
    courseMODList;

/**
 * Returns a promise
 *
 * wsConfig should contain keys for url, token and courseLinkStem (for generating
 * deep links)
 * @param wsConfig
 * @returns {Promise}
 */
module.exports.requestCatalog = (wsConfig) => {

  webserviceConfig = wsConfig;

  return new Promise((resolve, reject) => {

    function requestCategories() {
      request({
        json: true,
        url : createURL(wsConfig.url, wsConfig.token, 'core_course_get_categories')
      }).then((data)=> {
        categories = data;
        requestCatalog();
      }).catch((err)=> {
        reject('Error fetching categories', err);
      });
    }

    function requestCatalog() {
      request({
        json: true,
        url : createURL(wsConfig.url, wsConfig.token, 'core_course_get_courses')
      }).then((data)=> {
        catalog            = cleanCatalogData(data);
        courseCategoryList = buildCategoryList(catalog);
        courseMODList      = buildDeliveryModeList(catalog);
        resolve({categories, catalog, courseCategoryList, courseMODList});

      }).catch((err)=> {
        reject('Error fetching course catalog', err);
      });
    }

    requestCategories();

  });
};


function cleanCatalogData(src) {
  // TODO faster to filter first rather than after
  return src.reduce((p, c) => {
    p.push({
      category    : getCourseCategory(c.categoryid),
      datecreated : formatMSToDate(c.timecreated),
      datemodified: formatMSToDate(c.timemodified),
      startdate   : formatMSToDate(c.startdate),
      format      : c.format,
      id          : c.id,
      coursecode  : c.idnumber,
      lang        : c.lang,
      numsections : c.numsections,
      fullname    : c.fullname,
      shortname   : c.shortname,
      summary     : getShortSummary(c.summary),
      deliverymode: getCourseDeliveryMode(c.summary, c.courseformatoptions),
      deeplink    : webserviceConfig.courseLinkStem + c.id
    });
    return p;
  }, [])
    .filter(isInAHiddenCategory)
    .sort(dynamicSortObjArry('fullname'));
}

// Iterate over the hidden categories array and remove any courses in those
// categories
function isInAHiddenCategory(courseObj) {
  let courseCategory = courseObj.category;
  return !hiddenCategories.reduce((p, c) => p || c === courseCategory, false);
}


function getCourseCategory(courseCategoryID) {
  let category = categories.filter((cat) => {
    return cat.id === courseCategoryID;
  })[0];

  // Course id === 1 has no category ID and will break filter
  return category && category.hasOwnProperty('name') ? category.name : 'n/a';
}

function formatMSToDate(ms) {
  return new Date(parseInt(ms)).toLocaleDateString()
}

function getShortSummary(str) {
  // return ellipsesStr(removeTagsStr(removeEntityStr(str)), 1000);
  return removeTagsStr(removeEntityStr(str));
}

/*
 SCORM [{"name":"activitytype","value":"scorm"}]
 ILT [{"name":"numsections","value":4},{"name":"hiddensections","value":1},{"name":"coursedisplay","value":0}]
 ROLE [{"name":"numsections","value":2},{"name":"hiddensections","value":1},{"name":"coursedisplay","value":0}]
 */
function getCourseDeliveryMode(summary, courseFormatObj) {
  if (summary.indexOf(' ROLE ') > 0) {
    return 'ROLE'
  }

  if (courseFormatObj[0].name === 'numsections') {
    // TODO, is 3 accurate here?
    if (courseFormatObj[0].value === 4 || courseFormatObj[0].value === 3) {
      return 'Instructor-led';
      // } else if (courseFormatObj[0].value === 2) {
      //   return 'ROLE';
    } else if (courseFormatObj[0].value === 1) {
      return 'Online self paced with assessment';
    } else {
      // console.log('MOD not determined', courseFormatObj);
      return 'n/a';
    }
  }
  return 'Online self paced';
}

function buildCategoryList(data) {
  return uniqueArry(data.map((course) => course.category));
}

function buildDeliveryModeList(data) {
  return uniqueArry(data.map((course) => course.deliverymode));
}