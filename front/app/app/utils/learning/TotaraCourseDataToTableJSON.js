export const formatCourses = (raw) => {
  return raw.reduce((output, rawcourse) => {
    output.push({
      'Course'     : rawcourse.fullname,
      // 'Course code': rawcourse.shortname,
      // 'Link'       : rawcourse.deeplink,
      // 'Category'   : rawcourse.category,
      'MoD'        : rawcourse.deliverymode
    });
    return output;
  }, []);
};