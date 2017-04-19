import Task from 'data.task';
import AppStore from '../store/AppStore';
import {LRS} from '../utils/learning/lrs/LRS';

// Get LRS statements for the current user id (email) only
export const fetchUserStatements = () => {
  let state = AppStore.getState(),
      query = [{
        agent: JSON.stringify({
          objectType: 'Agent',
          mbox      : 'mailto:' + state.fullUserProfile.email
        })
      }];

  LRS.configure(state.config.webservice.lrs);

  return new Task((reject, resolve) => {
    LRS.getStatements(query).fork(err => {
      console.warn('Error fetching user statements', err);
      reject(err);
    }, data => {
      resolve(data);
    });
  });
};

// Gets statements from the LRS and filters them for only ones that match the context
// specified in the config
export const fetchStatementsForContext = () => {
  return new Task((reject, resolve) => {
    fetchUserStatements().fork(e => reject(e), statements => {
      // TODO REDUX
      let {config} = AppStore.getState(),
          res      = statements.statements.reduce((acc, stmnt) => {
            if ((stmnt.context && stmnt.context.platform) && stmnt.context.platform === config.webservice.lrs.contextID) {
              acc.push(stmnt);
            }
            return acc;
          }, []);
      resolve(res);
    });
  });
};