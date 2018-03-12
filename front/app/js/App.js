import React from 'react';
import AppStore from './store/AppStore';
import {
    setAllegoStatements,
    setCoursesInMap,
    setCurrentStructure,
    setFullUserProfile,
    setHydratedContent,
    setLMSStatus,
    setLRSStatements,
    setSDBStatus,
    setShadowEnrollments,
    setProgramEnrollment
} from './store/actions/Actions';
import {
  getCurrentStructure,
  getHydratedContent,
  getNewOrUpdatedContentTitles,
  isConnectionSuccessful,
  startEventSelector,
  useShadowDB
} from './store/selectors';
import {chainTasks} from './utils/AppUtils';
import {fetchUserProfile} from './services/fetchUserProfile';
import {fetchCoursesInMap, fetchLMSData} from './services/fetchLMS';
import {getSBUserEnrolledCourseDetails, isUserEnrolledToProgram } from './services/fetchShadowDb';
import {fetchAllegoLRSStatements} from './services/fetchAllegoLRS';
import Header from './components/Header';
import LearningMap from './components/LearningMap';
import PleaseWaitModal from './rh-components/rh-PleaseWaitModal';
import ModalMessage from './rh-components/rh-ModalMessage';
import Timeline from './components/Timeline';
import Introduction from './components/Introduction';
import ProgramEnrollment from './components/ProgramEnrollment'
import {XAPIProvider} from "./components/xAPIProvider";

/**
 * App
 *  Header
 *    Introduction
 *    Timeline
 *    XAPIProvider
 *      LearningMap
 *        PeriodCard
 *          TopicCard(s)
 *            ContentRow(s)
 */

const LoadingMessage = () => <PleaseWaitModal><h1>Loading your profile ...</h1>
</PleaseWaitModal>;

class App extends React.PureComponent {

  state = {ready: false, systemError: false, errorMessage: null};
  storeListener = null;

  componentDidMount() {
    this.storeListener = AppStore.subscribe(this._onStateUpdated.bind(this));
    this._fetchProfiles();
  }

  // Catch errors that occur during loading or usage of the application
  _onStateUpdated() {
    if (!(isConnectionSuccessful())) {
      this.setState({systemError: true});
      console.error('Connection to one or more back end systems is down!');
    }
  }

  // Loads the user profile, courses from the LMS which are present in the config
  // file's structure and any Allego statements
  // After it's loaded, it's set in the store
  _fetchProfiles() {
    let state = AppStore.getState(),
        user  = state.config.defaultuser;
    if (state.currentUser.length) {
      user = state.currentUser;
    }

    // This is for DEBUG only
    if(window.userEmail) {
      console.log('setting user from url');
      user = window.userEmail;
    }


    // Using chain rather than map to prevent double wrapping Task monads
    chainTasks([fetchUserProfile(user), fetchCoursesInMap()]).fork(e => {
      console.error('Could not get initial app data!', e);
      this.setState({errorMessage: e});
      AppStore.dispatch(setLMSStatus(false));
    }, res => {
      console.log('Got user profile', res[0]);
      console.log('Got courses in map', res[1]);

      // The way the result is structured, res[0][0] is an object whose key
      // is the user's email address. The value is an object with 'lms' and 'lrs'
      // keys
      // ['0':{'user@email.com':{lms:{},lrs:{}}}]
      let profile = res[0][0][Object.keys(res[0][0])];
      AppStore.dispatch(setCoursesInMap(res[1]));
      AppStore.dispatch(setFullUserProfile(profile.lms));
      AppStore.dispatch(setLRSStatements(profile.lrs));
      if (state.config.setup.programEnroll) {
        isUserEnrolledToProgram().fork(e => {
          console.error('ShadowDB Error: ', e);
          this.setState({errorMessage: e});
          }, res => {
          AppStore.dispatch(setProgramEnrollment(res));
          });
      }
      // Just warn if it fails
      fetchAllegoLRSStatements().fork(console.warn, s => {
        AppStore.dispatch(setAllegoStatements(s));
        this._externalLearningActivityLoaded();
      });

    });
  }

  _externalLearningActivityLoaded() {
    // "Hydrate" all the content, analyse LMS and LRS data to set completions to
    // internal state
    AppStore.dispatch(setHydratedContent(getHydratedContent()));
    // A start event is an enrollment in a given course. If there is one, then
    // this date will need to be loaded from the shadow db since it's not available
    // in the LMS data
    if (useShadowDB() && startEventSelector().length) {
      this._fetchShadowDBDataEnrollmentData();
    } else {
      this._finalizeContent();
    }
  }

  // Get the enrollment date for a given course ID from the shadow db
  _fetchShadowDBDataEnrollmentData() {
    getSBUserEnrolledCourseDetails().fork(e => {
      console.error('ShadowDB Error: ', e);
      this.setState({errorMessage: e});
      AppStore.dispatch(setSDBStatus(false));
      this._finalizeContent();
    }, res => {
      console.log('got the shadow data!', res);
      AppStore.dispatch(setShadowEnrollments(res));
      this._finalizeContent();
    });
  }

  _finalizeContent() {
    // Get current structure allows for there to be multiple versions in the config
    // content structure. This picks the correct version
    AppStore.dispatch(setCurrentStructure(getCurrentStructure()));
    this.setState({ready: true});
  }

    render() {
        const state = AppStore.getState();
        let enrollment = state.config.setup.programEnroll;
        if (this.state.ready) {

            return <main>
                <Header title={state.config.setup.title}
                        secondaryNav={state.config.setup.secondaryNav}
                        username={state.userProfile.fullname}/>
                <article className="header-overlap">
                    <Introduction text={state.currentStructure.introduction}
                                  instructions={state.currentStructure.instructions}
                                  newOrUpdated={getNewOrUpdatedContentTitles()}/>
                    {enrollment ? <ProgramEnrollment enrolledMessage={enrollment.enrolledMessage}
                                                     goEnrollMessage={enrollment.goEnrollMessage}
                                                     goEnrollLink={enrollment.enrollmentLink}
                                                     isEnrolled={state.programEnrollment}/> : null}
                    <Timeline currentStructure={state.currentStructure}/>
                    <XAPIProvider connection={state.config.webservice.lrs}
                                  user={state.userProfile}
                                  login
                                  appTitle={state.config.setup.title}
                                  appVersion={state.currentStructure.version}
                    >
                        <LearningMap config={state.config} userProfile={state.userProfile}
                                     coursesInMap={state.coursesInMap}
                                     hydratedContent={state.hydratedContent}
                                     currentStructure={state.currentStructure}

                        />
                    </XAPIProvider>
                </article>
                {this.state.systemError ? this._renderErrorMessage() : null}
            </main>;
        } else {
            return <div>
                <LoadingMessage/>
                {this.state.systemError ? this._renderErrorMessage() : null}
            </div>;
        }
  }

  _closeErrorMessage() {
    this.setState({systemError: false});
  }

  _renderErrorMessage() {
    return <ModalMessage
      message={{
        title        : 'Connection Problem',
        icon         : 'exclamation',
        error        : true,
        buttonOnClick: this._closeErrorMessage.bind(this),
        buttonLabel  : "Continue anyway"
      }}>
      <p>The connection to one or more back end systems has
        encountered a problem.
        Your progress may not have loaded correctly and may not save.</p>
      <p>Please
        refresh the page to try again.</p>
      {this.state.errorMessage ?
        <p><em>{this.state.errorMessage}</em></p> : null}
    </ModalMessage>;
  }
}

export default App;