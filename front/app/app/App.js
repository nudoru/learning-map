import React from 'react';
import { connect } from 'react-redux';
import AppStore from './store/AppStore';
import {setLRSStatements, setShadowEnrollments} from './store/actions/Actions';
import {
  useLRS,
  getNewOrUpdatedContentTitles,
  setStructureVersion,
  hydrateContent,
  applyStartDateToStructure
} from './store/selectors';
import { fetchStatementsForContext } from './services/fetchLRS';
import { fetchLMSData } from './services/fetchLMS';
import { getSBUserEnrolledCourseDetails } from './services/fetchShadowDb';
import Header from './components/Header';
import LearningMap from './components/LearningMap';
import { PleaseWaitModal } from './components/PleaseWaitModal';
import Timeline from './components/Timeline';
import Introduction from './components/Introduction';

class App extends React.Component {

  constructor () {
    super();
    this.state = {ready: false};
    this.storeListener;
  }

  componentDidMount () {
    this.storeListener = AppStore.subscribe(this.onStateUpdated.bind(this));

    this.fetchLMSData();
  }

  onStateUpdated () {
    if(AppStore.getState().lrsStatements !== null) {
      this.storeListener();
      setStructureVersion();
    }
  }

  fetchLMSData () {
    fetchLMSData().fork(console.error, () => {
      this.fetchLRSData();
    });
  }

  // Fetches all statements for the current user's email and then filters for the
  // contextID as set in the config.json file
  fetchLRSData () {
    if(!useLRS()) {
      // TODO fix this call ?
      AppStore.dispatch(setLRSStatements([]));
      this.fetchShadowDBDataEnrollmentData();
    }
    fetchStatementsForContext().fork(e => {
      console.warn('Couldn\'t get LRS statements. An error -OR- no LRS is configured.', e);
      AppStore.dispatch(setLRSStatements([]));
      this.fetchShadowDBDataEnrollmentData();
    }, statements => {
      console.log('got the lrs data!', statements);
      AppStore.dispatch(setLRSStatements(statements));
      this.externalLearningActivityLoaded();
    });
  }

  externalLearningActivityLoaded () {
    // Will mutate the loaded content based on dates and LMS/LRS content
    hydrateContent();
    this.fetchShadowDBDataEnrollmentData();
  }

  fetchShadowDBDataEnrollmentData () {
    getSBUserEnrolledCourseDetails().fork(e => {
      console.log('Failed to get ShadowDB enrollments ...');
      this.shadowDBEnrollmentsLoaded();
    }, res => {
      console.log('got the shadow data!', res);
      AppStore.dispatch(setShadowEnrollments(res));
      this.shadowDBEnrollmentsLoaded();
    });
  }

  shadowDBEnrollmentsLoaded () {
    // Based on a start date tied or a course event or date in the structure, set
    // the start/end dates on each period
    applyStartDateToStructure();
    this.setState({ready: true});
  }

  render () {
    if (this.state.ready) {
      let appState = AppStore.getState(); //DangerousAppState.dangerousGetState();
      return (<div>
        <Header title={appState.config.setup.title}
                secondaryNav={appState.config.setup.secondaryNav}
                username={appState.fullUserProfile.fullname}/>
        <div className="header-overlap">
          <Introduction text={appState.config.currentStructure.introduction}
                        newOrUpdated={getNewOrUpdatedContentTitles()}/>
          <Timeline currentStructure = {appState.config.currentStructure}/>
          <LearningMap/> // Data injected via react-redux connect
        </div>
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