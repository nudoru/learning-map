import Task from 'data.task';
import AppState from '../store/AppState';
import {LRS} from '../utils/learning/lrs/LRS';

export const useLRS = () => {
  // Falsey checking here
  return AppState.getState().config.webservice.lrs != null; // eslint-disable-line eqeqeq
};

// Get LRS statements for the current user id (email) only
export const fetchUserStatements = () => {
  if (!useLRS()) {
    return new Task((reject, resolve) => reject());
  }

  let state = AppState.getState(),
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
      AppState.setState({config: data});
      resolve(data);
    });
  });
};

// Gets statements from the LRS and filters them for only ones that match the context
// specified in the config
export const fetchStatementsForContext = () => {
  return new Task((reject, resolve) => {
    fetchUserStatements().fork(e => reject(e), statements => {
      let {config} = AppState.getState(),
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