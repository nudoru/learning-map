import React from 'react';
import ModalMessage from './rh-components/rh-ModalMessage';
import PleaseWaitModal from './rh-components/rh-PleaseWaitModal';
import App from './App';
import AppStore from './store/AppStore';
import {setConfig} from './store/actions/Actions';
import {fetchConfigData} from './services/fetchConfig';
import LMSKerberosIDRequest from './components/LMSKerberosIDRequest';
import {getParameterByName} from './utils/Toolbox';

const LoadingMessage = _ =>
  <PleaseWaitModal><h1>Please wait ...</h1>
  </PleaseWaitModal>;

const ErrorMessage = _ =>
  <ModalMessage message={{
    title: 'There was a problem loading the configuration.',
    icon : 'exclamation',
    error: true
  }}>
  </ModalMessage>;

let configFile = 'config';

class ApplicationContainer extends React.PureComponent {

  storeListener = null;

  state = {
    loading: true,  // Loading the config.json file
    isError: false, // Error loading the file?
    hasUser: false
  };

  componentDidMount() {
    const mapConfig = getParameterByName('map');
    if (mapConfig) {
      configFile = mapConfig;
    }

    // Email from URL should be for for DEBUG ONLY and removed before a prod build
    const email = getParameterByName('e');
    if (email) {
      // TODO Need to put this in the Redux store rather than a global var
      window.userEmail = email;
    }

    console.log(`From the URL: map ${mapConfig}, user ${email}`);

    this.storeListener = AppStore.subscribe(this._onStateUpdated.bind(this));
    this._fetchConfig();
  }

  // Start the app or load the configuration file
  _fetchConfig() {
    fetchConfigData(configFile).fork(console.error,
      res => {
        AppStore.dispatch(setConfig(res));
        this.setState({
          loading: false,
          hasUser: (res.defaultuser.length || window.userEmail)
        });
      });
  }

  _onStateUpdated() {
    if (AppStore.getState().currentUser.length) {
      this.storeListener();
      this.setState({hasUser: true});
    }
  }

  render() {
    if (this.state.loading) {
      return <LoadingMessage/>;
    } else if (this.state.isError) {
      return <ErrorMessage/>;
    } else if (!this.state.hasUser) {
      return <LMSKerberosIDRequest/>;
    } else {
      return <App/>;
    }
  }
}

export default ApplicationContainer;