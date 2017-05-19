import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ModalMessage from '../rh-components/rh-ModalMessage';
import IconCircle from '../rh-components/rh-IconCircle';
import AppStore from '../store/AppStore';
import { configSelector } from '../store/selectors';
import { setCurrentUser } from '../store/actions/Actions';
import { requestUserProfile } from '../utils/learningservices/lms/GetUserProfile';
import { validateInputStr } from '../utils/AppUtils';
import {Status} from '../rh-components/rh-Status';
import {
  HForm,
  FormHGroupRow,
  FormHGroup,
  HInputDecorator
} from '../rh-components/rh-Form';

class LMSKerberosIDRequest extends React.Component {

  constructor () {
    super();
    this.state = {
      isPrompting  : true,
      isFetching   : false,
      isWSError    : false,
      isInputError : false,
      usernameInput: '',
      lastRequest  : ''
    };
  }

  componentDidMount () {
    this.refs.emailInput.focus();
  }

  onEmailInputChange (e) {
    let userinput = this.refs.emailInput.value;
    this.setState({
      isInputError : validateInputStr(userinput),
      usernameInput: userinput
    });
  }

  onContinueClick (e) {
    e.preventDefault();
    let userinput = this.refs.emailInput.value;

    if (this.state.isInputError || userinput.length === 0) {
      console.warn('Invalid id');
      return false;
    }

    this.testUserID(userinput);
  }

  testUserID (userinput) {
    this.setState({
      isFetching : true,
      isWSError  : false,
      isPrompting: false,
      lastRequest: userinput //this.refs.emailInput.value
    });

    requestUserProfile(configSelector().webservice, userinput)
      .fork(err => {
        console.warn('requestUserProfile, WS error', err);
        this.setState({isFetching: false, isWSError: true, isPrompting: true});
      }, res => {
        if (res.users.length) {
          // This will set the user. Bootstrap will pick up this store change and show
          // the app, removing this prompt
          AppStore.dispatch(setCurrentUser(userinput + '@redhat.com'));
        } else {
          this.setState({
            isFetching: false,
            isWSError: true,
            isPrompting: true
          });
        }

      });
  }

  render () {
    let {isPrompting, isFetching, isWSError, isInputError, usernameInput, lastRequest} = this.state,
        content;

    if (isPrompting) {
      let err, buttonStyles = ['rh-button'];

      if (isInputError) {
        err =
          <Status type="warning">That doesn't look like a valid
            ID.</Status>;
      } else if (isWSError) {
        err =
          <Status type="danger">There was problem getting
            the profile for <strong>{lastRequest}</strong>! Please check your
            spelling and try
            again.</Status>;
      }

      if (isInputError || usernameInput.length === 0) {
        buttonStyles.push('disabled');
      }

      content = (<div>
        <form className="rh-form">
          <h1>Please enter your email address to continue.</h1><p>You must be
          connected to the corporate network or VPN to access.</p>
            <FormHGroupRow>
              <FormHGroup>
                <HInputDecorator icon="user"/>
                <input ref="emailInput" type="text" maxLength="30"
                       defaultValue={this.state.usernameInput}
                       onInput={this.onEmailInputChange.bind(this)}/>
                <HInputDecorator>@redhat.com</HInputDecorator>
              </FormHGroup>
            </FormHGroupRow>
          {err}
          <button
            className={buttonStyles.join(' ')}
            onClick={this.onContinueClick.bind(this)}>Continue
          </button>
        </form>
      </div>);
    } else if (isFetching) {
      content = (<div><h1>Loading your profile ...</h1>
        <div className="text-center">
          <i className="fa fa-spinner fa-pulse fa-2x fa-fw"/>
        </div>
      </div>);
    }

    return (
      <ReactCSSTransitionGroup transitionName="modal"
                               transitionAppear={true}
                               transitionAppearTimeout={1000}
                               transitionEnterTimeout={1000}
                               transitionLeaveTimeout={1000}>
        <ModalMessage message={{
          icon : 'user',
          error: isWSError || isInputError
        }}>
          <div className="rh-login">
            {content}
          </div>
        </ModalMessage>
      </ReactCSSTransitionGroup>);
  }
}

LMSKerberosIDRequest.defaultProps = {};
LMSKerberosIDRequest.propTypes    = {};

export default LMSKerberosIDRequest;