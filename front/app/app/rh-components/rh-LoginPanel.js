import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ModalMessage from './rh-ModalMessage'
import Spinner from './rh-Spinner';
import Status from './rh-Status';
import {
  HForm,
  FormHGroupRow,
  FormHGroup,
  HInputDecorator
} from '../rh-components/rh-Form';

class LoginPanel extends React.Component {

  constructor() {
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

  componentDidMount() {
    this.refs.emailInput.focus();
  }

  onEmailInputChange(e) {
    let userinput = this.refs.emailInput.value;
    this.setState({
      isInputError : this.props.validateFn(userinput),
      usernameInput: userinput
    });
  }

  onContinueClick(e) {
    e.preventDefault();
    let userinput = this.refs.emailInput.value;

    if (this.state.isInputError || userinput.length === 0) {
      console.warn('Invalid id');
      return false;
    }

    this.setState({lastRequest: userinput});

    this.props.processLoginFn(userinput + '@redhat.com',
      this.onProcessLoginFnSuccess.bind(this),
      this.onProcessLoginFnError.bind(this));
  }

  onProcessLoginFnSuccess(msg) {
    this.setState({isPrompting: false, isFetching: true})
  }

  onProcessLoginFnError(err) {
    this.setState({isWSError: true});
  }

  render() {
    let {isPrompting, isFetching, isWSError, isInputError, usernameInput, lastRequest} = this.state, content;

    if (isPrompting) {
      let err, buttonStyles = ['rh-button'];

      if (isWSError) {
        err =
          <Status type="fail">There was problem getting
            the profile for <strong>{lastRequest}</strong>! Please check your
            spelling and try
            again.</Status>;
      } else if (isInputError) {
        err =
          <Status type="warning">That doesn't look like a valid
            ID.</Status>;
      }

      if (isInputError || usernameInput.length === 0) {
        buttonStyles.push('disabled');
      }

      content = (<div className="rh-loginpanel">
        <form className="rh-form">
          <h1>{this.props.title}</h1><p>{this.props.prompt}</p>
          <HForm>
            <FormHGroupRow>
              <FormHGroup>
                <HInputDecorator icon="user"/>
                <input ref="emailInput" type="text" maxLength="30"
                       defaultValue={this.state.usernameInput}
                       onInput={this.onEmailInputChange.bind(this)}/>
                <HInputDecorator>@redhat.com</HInputDecorator>
              </FormHGroup>
            </FormHGroupRow>
          </HForm>

          {err}
          <button
            className={buttonStyles.join(' ')}
            onClick={this.onContinueClick.bind(this)}>{this.props.buttonLabel}
          </button>
        </form>
      </div>);
    } else if (isFetching) {
      content = (<div><h1>Loading your profile ...</h1>
        <div className="text-center">
          <Spinner type="spinner-lg"/>
        </div>
      </div>)
    }

    return (
      <ReactCSSTransitionGroup transitionName="modal"
                               transitionAppear={true}
                               transitionAppearTimeout={1000}
                               transitionEnterTimeout={1000}
                               transitionLeaveTimeout={1000}>
        <ModalMessage
          message={{error: isWSError || isInputError, icon: 'user'}}>
          <div className="rh-login">
            {content}
          </div>
        </ModalMessage>
      </ReactCSSTransitionGroup>);
  }
}

LoginPanel.defaultProps = {};
LoginPanel.propTypes    = {
  title         : React.PropTypes.string,
  prompt        : React.PropTypes.string,
  inputLabel    : React.PropTypes.string,
  buttonLabel   : React.PropTypes.string,
  validateFn    : React.PropTypes.func,
  processLoginFn: React.PropTypes.func
};

export default LoginPanel;