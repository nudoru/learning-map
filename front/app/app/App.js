import React from 'react';
import { connect } from 'react-redux';
import AppStore from './store/AppStore';
import {
  setLRSStatements,
  setShadowEnrollments,
  setCurrentStructure,
  setHydratedContent,
  setLMSStatus,
  setLRSStatus,
  setSDBStatus
} from './store/actions/Actions';
import {
  useLRS,
  getNewOrUpdatedContentTitles,
  getCurrentStructure,
  getHydratedContent
} from './store/selectors';
import { fetchStatementsForContext } from './services/fetchLRS';
import { fetchLMSData } from './services/fetchLMS';
import { getSBUserEnrolledCourseDetails } from './services/fetchShadowDb';
import Header from './components/Header';
import LearningMap from './components/LearningMap';
import { PleaseWaitModal } from './components/PleaseWaitModal';
import ModalMessage from './rh-components/rh-ModalMessage';
import Timeline from './components/Timeline';
import Introduction from './components/Introduction';

const ErrorMessage = (props) => <ModalMessage error={true}
                                              dismissible={false}><h1>Connection
  Problem</h1><p>The connection to one or more back end systems has failed. Your
  progress may not have loaded correctly and may not save.</p><p>Please refresh the page to try again.</p>
</ModalMessage>;

class App extends React.Component {

  constructor () {
    super();
    this.state = {ready: false, systemError: false, errorDisplayed: false};
    this.storeListener;
  }

  componentDidMount () {
    this.storeListener = AppStore.subscribe(this.onStateUpdated.bind(this));
    this.fetchLMSData();
  }

  onStateUpdated () {
    let state = AppStore.getState();
    if (!(state.connectionLMSStatus && state.connectionLRSStatus && state.connectionSDBStatus && state.connectionAllegoStatus)) {
      this.setState({systemError: true, errorDisplayed: false});
      console.error('Connection to one or more back end systems is down!');
    }
  }

  fetchLMSData () {
    fetchLMSData().fork(e => {
      console.error('LMS Error: ', e);
      AppStore.dispatch(setLMSStatus(false));
    }, res => {
      // res was the last in the chain, or course in map
      this.fetchLRSData();
    });
  }

  // Fetches all statements for the current user's email and then filters for the
  // contextID as set in the config.json file
  fetchLRSData () {
    if (!useLRS()) {
      this.externalLearningActivityLoaded();
    }

    fetchStatementsForContext().fork(e => {
      console.warn('Couldn\'t get LRS statements. An error -OR- no LRS is configured.', e);
      console.error('LRS Error: ', e);
      AppStore.dispatch(setLRSStatus(false));
      this.externalLearningActivityLoaded();
    }, statements => {
      console.log('got the lrs data!', statements);
      AppStore.dispatch(setLRSStatements(statements));
      this.externalLearningActivityLoaded();
    });
  }

  externalLearningActivityLoaded () {
    // Will mutate the loaded content based on dates and LMS/LRS content
    AppStore.dispatch(setHydratedContent(getHydratedContent()));
    this.fetchShadowDBDataEnrollmentData();
  }

  fetchShadowDBDataEnrollmentData () {
    getSBUserEnrolledCourseDetails().fork(e => {
      console.error('ShadowDB Error: ', e);
      AppStore.dispatch(setSDBStatus(false));
      this.shadowDBEnrollmentsLoaded();
    }, res => {
      console.log('got the shadow data!', res);
      AppStore.dispatch(setShadowEnrollments(res));
      this.shadowDBEnrollmentsLoaded();
    });
  }

  shadowDBEnrollmentsLoaded () {
    AppStore.dispatch(setCurrentStructure(getCurrentStructure()));
    this.setState({ready: true});
  }

  render () {
    if (this.state.ready) {
      let appState = AppStore.getState(); //DangerousAppState.dangerousGetState();
      // Props are injected via react-redux connect
      return (<div>
        <Header/>
        <div className="header-overlap">
          <Introduction newOrUpdated={getNewOrUpdatedContentTitles()}/>
          <Timeline/>
          <LearningMap/>
        </div>
        {this.state.systemError ? <ErrorMessage/> : null}
      </div>);
    } else {
      return <PleaseWaitModal
        message="Loading your information from the LMS"/>;
    }
  }
}

App.propTypes = {};

const mapStateToProps = state => {
  return {
    config: state.config
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);