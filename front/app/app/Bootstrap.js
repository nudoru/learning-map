import React from 'react';
import { Provider } from 'react-redux';
import ModalMessage from './rh-components/rh-ModalMessage';
import PleaseWaitModal from './rh-components/rh-PleaseWaitModal';
import App from './App';
import AppStore from './store/AppStore';
import { userProfileSelector } from './store/selectors';
import { setConfig } from './store/actions/Actions';
import { fetchConfigData } from './services/fetchConfig';
import LMSKerberosIDRequest from './components/LMSKerberosIDRequest';

const LoadingMessage = () =>
  <PleaseWaitModal><h1>Please wait ...</h1>
  </PleaseWaitModal>;

const ErrorMessage = () =>
  <ModalMessage message={{
    title: 'There was a problem loading the configuration.',
    icon : 'exclamation',
    error: true
  }}>
  </ModalMessage>;

const Application = (props) => <Provider store={AppStore}>
  <App/>
</Provider>;

class ApplicationContainer extends React.Component {

  constructor () {
    super();
    this.storeListener;
    this.state = {
      loading: true,  // Loading the config.json file
      isError: false, // Error loading the file?
      hasUser: false
    };
  }

  // On initial mounting of the component, load config or start app
  componentDidMount () {
    this.storeListener = AppStore.subscribe(this.onStateUpdated.bind(this));
    this.fetchConfig();
  }

  // Start the app or load the configuration file
  fetchConfig () {
    fetchConfigData().fork(console.error,
      res => {
        AppStore.dispatch(setConfig(res));
        this.setState({loading: false, hasUser: (res.defaultuser.length)});
      });
  }

  onStateUpdated () {
    // Keys will only be present once the user account has been successfully
    // fetched from the LMS
    if (AppStore.getState().currentUser.length) {
    //if (Object.keys(userProfileSelector()).length) {
      this.storeListener();
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
      return <Application/>;
    }
  }
}

export default ApplicationContainer;