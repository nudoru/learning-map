import moment from 'moment';
import {compose, curry, both, contains} from 'ramda';
import {
  removeTagsStr,
  removeEntityStr,
  removeWhiteSpace
} from './Toolbox';

export const noOp = () => {
};

// -1 past, 0 current, 1 future
// Start and End should be moment instances
export const getTimePeriod = (startM, endM) => {
  if (!startM || !endM) {
    return 2;
  }

  let nowM = moment();

  // isSame compares down to the millisecond, so convert it to a date string for the compare
  if (moment(nowM.format("L"), 'MM/DD/YYYY').isSame(moment(startM.format("L"), 'MM/DD/YYYY')) || moment(nowM.format("L"), 'MM/DD/YYYY').isSame(moment(endM.format("L"), 'MM/DD/YYYY'))) {
    return 0;
  } else if (moment(startM).isAfter(nowM)) {
    return 1;
  } else if (nowM.isAfter(endM)) {
    return -1;
  }

  return 0;
};

// Some actions don't have a URL since they're physical tasks. Convert that title
// into a unique URL for tracking to the LRS' object/subject id prop
export const contentTitleToLink = (title, id) => 'https://www.redhat.com/en#' + removeWhiteSpace(removeEntityStr(removeTagsStr(title))) + '_' + id;

// Several items have the same endpoint/link. Add the id as a hash to unique them
export const contentLinkWithId = (link, id) => link + '#'+id;

//------------------------------------------------------------------------------
// Composabile f()s
//------------------------------------------------------------------------------

// Characters we shouldn't allow in user ID input
export const badInputChars = ['#', '@', '!', ';', '[', ']', '(', ')', '{', '}', '"', '\'', '%', '&', '$', '|', ' '];
// Number, String => true | false
export const stringLengthIsLessThan = curry((maxLen, str) => (str.length && str.length <= maxLen ));
// String => true | false
export const containsNoBadChars = (str) => badInputChars.some(char => contains(char, str));
// Array => true | false
export const hasLength = a => a.length ? true : false;
// String, Object => true : false
export const idMatchObjId = curry((id, obj) => id === obj.id);
// Object<Object<Boolean>> => Number
export const isCompletedToNum = c => c.status.completed ? 2 : 1;

//------------------------------------------------------------------------------
// Utils
//------------------------------------------------------------------------------

// Validate user name input, length must be >0 and <30 and have no bad chars
// String => true | false
export const validateInputStr = (str) => both(stringLengthIsLessThan(30), containsNoBadChars)(str);

// String -> String
export const stripHTML = (str) => compose(removeTagsStr, removeEntityStr)(str);