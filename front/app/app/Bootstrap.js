import React from 'react';
import ModalMessage from './rh-components/rh-ModalMessage';
import App from './App';
import AppState from './store/DangerousAppState';
import { fetchConfigData } from './services/fetchConfig';
import LMSKerberosIDRequest from './components/LMSKerberosIDRequest';

const LoadingMessage = (props) => <ModalMessage dismissible={false}><h1>Please wait ...</h1></ModalMessage>;
const ErrorMessage = (props) => <ModalMessage error={true} dismissible={false}><h1>There was a problem loading the configuration.</h1></ModalMessage>;

class ApplicationContainer extends React.Component {

  constructor () {
    super();
    this.state = {
      loading: true,  // Loading the config.json file
      isError: false, // Error loading the file?
      hasUser: false
    };
  }

  // On initial mounting of the component, load config or start app
  componentDidMount () {
    AppState.dangerousSubscribe('listenforuser', this.onStateUpdated.bind(this));
    this.fetchConfig();
  }

  // Start the app or load the configuration file
  fetchConfig () {
    fetchConfigData().fork(console.error,
      c => {
        this.setState({loading: false, hasUser: (c.defaultuser.length)});
      });
  }

  onStateUpdated () {
    // Referencing by string notation because key will only be present once the
    // user account has been successfully fetched from the LMS
    if (AppState.dangerousGetState()['fullUserProfile']) { // eslint-disable-line dot-notation
      AppState.dangerousUnsubscribe('listenforuser');
      this.setState({hasUser: true});
    }
  }

  render () {
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