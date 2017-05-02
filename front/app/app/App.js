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
  useShadowDB,
  startEventSelector,
  isConnectionSuccessful,
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

class App extends React.Component {

  constructor () {
    super();
    this.state = {ready: false, systemError: false};
    this.storeListener;
  }

  componentDidMount () {
    this.storeListener = AppStore.subscribe(this.onStateUpdated.bind(this));
    this.fetchLMSData();
  }

  onStateUpdated () {
    if (!(isConnectionSuccessful())) {
      this.setState({systemError: true});
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
    if(useShadowDB() && startEventSelector().length) {
      this.fetchShadowDBDataEnrollmentData();
    } else {
      console.log('no start event, skipping')
      this.finalizeContent();
    }
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
    this.finalizeContent();
  }

  finalizeContent() {
    AppStore.dispatch(setCurrentStructure(getCurrentStructure()));
    this.setState({ready: true});
  }

  render () {
    if (this.state.ready) {
      // Props are injected via react-redux connect
      return (<div>
        <Header/>
        <div className="header-overlap">
          <Introduction newOrUpdated={getNewOrUpdatedContentTitles()}/>
          <Timeline/>
          <LearningMap/>
        </div>
        {this.state.systemError ? this.errorMessage() : null}
      </div>);
    } else {
      return <PleaseWaitModal
        message="Loading your information from the LMS"/>;
    }
  }

  closeErrorMessage() {
    this.setState({systemError: false});
  }

  errorMessage () {
    return (<ModalMessage error={true}
                          dismissible={true}
                          dismissFunc={this.closeErrorMessage.bind(this)}
                          dismissButtonLabel="Continue anyway">
      <h1>Connection
      Problem</h1><p>The connection to one or more back end systems has encountered a problem.
      Your progress may not have loaded correctly and may not save.</p><p>Please
      refresh the page to try again.</p>
    </ModalMessage>);
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