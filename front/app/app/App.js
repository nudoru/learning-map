import React from 'react';
import AppState from './store/AppState';
import {
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
  }

  componentDidMount () {
    AppState.subscribe('listenforlrs', this.onStateUpdated.bind(this));

    this.fetchLMSData();
  }

  onStateUpdated () {
    // Referencing by string notation because key will only be present once the
    // user account has been successfully fetched from the LMS
    if (AppState.getState()['lrsStatements']) { // eslint-disable-line dot-notation
      AppState.unsubscribe('listenforlrs');

      setStructureVersion();
    }
  }

  fetchLMSData () {
    fetchLMSData().fork(console.error, () => {
      console.log('got the lms data!', AppState.getState());
      this.fetchLRSData();
    });
  }

  // Fetches all statements for the current user's email and then filters for the
  // contextID as set in the config.json file
  fetchLRSData () {
    fetchStatementsForContext().fork(e => {
      console.warn('Couldn\'t get LRS statements. An error -OR- no LRS is configured.', e);
      AppState.setState({lrsStatements: []});
      this.fetchShadowDBDataEnrollmentData();
    }, statements => {
      console.log('got the lrs data!', statements);
      AppState.setState({lrsStatements: statements});
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
      AppState.setState({shadowEnrollments: res});
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
      let appState = AppState.getState();
      return (<div>
        <Header title={appState.config.setup.title}
                secondaryNav={appState.config.setup.secondaryNav}
                username={appState.fullUserProfile.fullname}/>
        <div className="header-overlap">
          <Introduction text={appState.config.currentStructure.introduction}
                        newOrUpdated={getNewOrUpdatedContentTitles()}/>
          <Timeline {...appState.config}/>
          <LearningMap {...appState}/>
        </div>
      </div>);
    } else {
      return <PleaseWaitModal
        message="Loading your information from the LMS"/>;
    }
  }
}

App.propTypes = {};

export default App;