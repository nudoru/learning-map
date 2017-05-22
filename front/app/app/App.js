import React from 'react';
import { connect } from 'react-redux';
import AppStore from './store/AppStore';
import {
  setCoursesInMap,
  setCurrentStructure,
  setFullUserProfile,
  setHydratedContent,
  setLMSStatus,
  setLRSStatements,
  setAllegoStatements,
  setSDBStatus,
  setShadowEnrollments
} from './store/actions/Actions';
import {
  getCurrentStructure,
  getHydratedContent,
  getNewOrUpdatedContentTitles,
  isConnectionSuccessful,
  startEventSelector,
  useShadowDB
} from './store/selectors';
import { chainTasks } from './utils/AppUtils';
import { fetchUserProfile } from './services/fetchUserProfile';
import { fetchCoursesInMap, fetchLMSData } from './services/fetchLMS';
import { getSBUserEnrolledCourseDetails } from './services/fetchShadowDb';
import {fetchAllegoLRSStatements} from './services/fetchAllegoLRS';
import Header from './components/Header';
import LearningMap from './components/LearningMap';
import PleaseWaitModal from './rh-components/rh-PleaseWaitModal';
import ModalMessage from './rh-components/rh-ModalMessage';
import Timeline from './components/Timeline';
import Introduction from './components/Introduction';

const LoadingMessage = () =>
  <PleaseWaitModal><h1>Loading your profile ...</h1>
  </PleaseWaitModal>;

class App extends React.Component {

  constructor () {
    super();
    this.state = {ready: false, systemError: false, errorMessage: null};
    this.storeListener;
  }

  componentDidMount () {
    this.storeListener = AppStore.subscribe(this.onStateUpdated.bind(this));
    this.fetchProfiles();
  }

  onStateUpdated () {
    if (!(isConnectionSuccessful())) {
      this.setState({systemError: true});
      console.error('Connection to one or more back end systems is down!');
    }
  }

  fetchProfiles () {
    let state = AppStore.getState(),
        user = state.config.defaultuser;

    if(state.currentUser.length) {
      user = state.currentUser;
    }

    chainTasks([fetchUserProfile(user), fetchCoursesInMap()]).fork(e => {
      console.error('Could not get initial app data!', e);
      this.setState({errorMessage: e});
      AppStore.dispatch(setLMSStatus(false));
    }, res => {
      console.log('Got user profile', res[0]);
      console.log('Got courses in map', res[1]);

      let profile = res[0][0][Object.keys(res[0][0])];

      AppStore.dispatch(setCoursesInMap(res[1]));
      AppStore.dispatch(setFullUserProfile(profile.lms));
      AppStore.dispatch(setLRSStatements(profile.lrs));

      fetchAllegoLRSStatements().fork(console.warn, s => {
        AppStore.dispatch(setAllegoStatements(s));
        this.externalLearningActivityLoaded();
      });

    });
  }

  externalLearningActivityLoaded () {
    AppStore.dispatch(setHydratedContent(getHydratedContent()));
    if (useShadowDB() && startEventSelector().length) {
      this.fetchShadowDBDataEnrollmentData();
    } else {
      console.log('no start event, skipping');
      this.finalizeContent();
    }
  }

  fetchShadowDBDataEnrollmentData () {
    getSBUserEnrolledCourseDetails().fork(e => {
      console.error('ShadowDB Error: ', e);
      this.setState({errorMessage: e});
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

  finalizeContent () {
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
      return (<div>
        <LoadingMessage/>
        {this.state.systemError ? this.errorMessage() : null}
      </div>);
    }
  }

  closeErrorMessage () {
    this.setState({systemError: false});
  }

  errorMessage () {
    return (<ModalMessage
      message={{
        title: 'Connection Problem',
        icon : 'exclamation',
        error: true,
        buttonOnClick: this.closeErrorMessage.bind(this),
        buttonLabel: "Continue anyway"
      }}>
      <p>The connection to one or more back end systems has
      encountered a problem.
      Your progress may not have loaded correctly and may not save.</p><p>Please
      refresh the page to try again.</p>
      {this.state.errorMessage ?
        <p><em>{this.state.errorMessage}</em></p> : null}
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