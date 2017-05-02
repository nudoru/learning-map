import Task from 'data.task';
import {compose, curry, both, contains, sequence} from 'ramda';
import {
  removeTagsStr,
  removeEntityStr
} from './Toolbox';

export const noOp = () => {
};

// Chain an array of Tasks in to one task
export const chainTasks = (taskArry) => sequence(Task.of, taskArry);

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

//------------------------------------------------------------------------------
// Utils
//------------------------------------------------------------------------------

// Validate user name input, length must be >0 and <30 and have no bad chars
// String => true | false
export const validateInputStr = (str) => both(stringLengthIsLessThan(30), containsNoBadChars)(str);

// String -> String
export const stripHTML = (str) => compose(removeTagsStr, removeEntityStr)(str);