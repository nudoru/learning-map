import {
  sendFragment,
  setStatementDefaults
} from '../utils/learningservices/lrs/LRS';
import {useLRS} from "../store/selectors";
import AppStore from "../store/AppStore"; //Needed for setting error state
import {setLRSStatus} from "../store/actions/Actions";

let propsCache;

// export const getLRSConnectionInfo = _ => propsCache.config.webservice.lrs;

export const connectToLRS = (props) => {
  if (!useLRS()) {
    return;
  }

  propsCache = props;
  setAppStatementDefaults();
  // Send user x loggedin statement, disable for dev and testing to avoid spamming the LRS
  sendLoggedInStatement();
};

export const setAppStatementDefaults = _ => {
  const {config, userProfile} = propsCache;

  setStatementDefaults({
    result : {
      completion: true
    },
    context: {
      platform         : config.webservice.lrs.contextID,
      revision         : propsCache.currentStructure.version,
      contextActivities: {
        grouping: [{id: config.webservice.lrs.contextGroup}],
        parent  : [{
          id        : config.webservice.lrs.contextParent,
          objectType: 'Activity'
        }],
        category: [{
          id        : config.webservice.lrs.contextCategory,
          definition: {type: 'http://id.tincanapi.com/activitytype/source'}
        }]
      },
      extensions       : {
        ['http://learning.redhat.com/lmsid']   : userProfile.id,
        ['http://learning.redhat.com/oracleid']: userProfile.idnumber
      }
    }
  });
};

export const sendLoggedInStatement = _ => {
  const {config} = propsCache;

  sendXAPIStatement({
    verbDisplay: 'loggedin',
    objectName : config.setup.title,
    objectType : 'page',
    objectID   : config.webservice.lrs.contextID // URL
  });
};

// When a link is clicked
export const sendLinkStatement = (name, link) => {
  //send link statement undefined undefined#undefined
  console.log('send link statement', name, link);
  sendStatementForLink('clicked', name, link);
};

// When the complete button is toggled on
export const sendCompletedStatement = (name, link) => {
  console.log('send link statement', name, link);
  sendStatementForLink('completed', name, link);
};

export const sendStatementForLink = (verb, name, link) => {
  // some links may not have URL, just default to the context ID
  link = link || propsCache.config.webservice.lrs.contextID;
  sendXAPIStatement({
    verbDisplay: verb,
    objectName : name,
    objectType : 'link',
    objectID   : link
  });
};

export const sendXAPIStatement = fragment => {
  if (!useLRS()) {
    return;
  }

  const {config, userProfile} = propsCache;

  fragment.subjectName = userProfile.fullname;
  fragment.subjectID   = userProfile.email;

  sendFragment(config.webservice.lrs, fragment)
    .fork(e => {
        console.error('Error sending statement: ', e);
        // For error messaging
        AppStore.dispatch(setLRSStatus(false));
      },
      r => {
        console.log('Statement sent!', r);
      });
};