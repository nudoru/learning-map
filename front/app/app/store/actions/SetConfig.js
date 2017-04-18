import * as ACTIONS from './Actions';

const SetConfig = (config)  => {
  return {
    type: ACTIONS.SET_CONFIG,
    config
  };
};

export default SetConfig;

