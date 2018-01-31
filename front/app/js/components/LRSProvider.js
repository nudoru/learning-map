import React from 'react';
import PropTypes from 'prop-types';
import {
  sendFragment,
  setStatementDefaults
} from '../utils/learningservices/lrs/LRS';
import {useLRS} from "../store/selectors";

export class XAPIProvider extends React.PureComponent {
  static propTypes = {
    connection: PropTypes.object,
    user      : PropTypes.object,
    appTitle  : PropTypes.string,
    appVersion: PropTypes.string,
    login     : PropTypes.bool
  };

  static defaultProps = {};

  static childContextTypes = {
    connection           : PropTypes.object,
    user                 : PropTypes.object,
    sendLinkStatement    : PropTypes.func,
    sendLoggedInStatement: PropTypes.func,
    sendFragment         : PropTypes.func
  };

  getChildContext() {
    return {
      connection           : this.props.connection,
      user                 : this.props.user,
      sendLinkStatement    : this._sendLinkStatement,
      sendLoggedInStatement: this._sendLoggedInStatement,
      sendFragment         : this._sendXAPIStatement
    };
  }

  state = {error: false};

  _setAppStatementDefaults = _ => {
    const {connection, user} = this.props;

    setStatementDefaults({
      result : {
        completion: true
      },
      context: {
        platform         : connection.contextID,
        revision         : this.props.appVersion,
        contextActivities: {
          grouping: [{id: connection.contextGroup}],
          parent  : [{
            id        : connection.contextParent,
            objectType: 'Activity'
          }],
          category: [{
            id        : connection.contextCategory,
            definition: {type: 'http://id.tincanapi.com/activitytype/source'}
          }]
        },
        extensions       : {
          ['http://learning.redhat.com/lmsid']   : user.id,
          ['http://learning.redhat.com/oracleid']: user.idnumber
        }
      }
    });
  };

  _sendLoggedInStatement = _ => {
    this._sendXAPIStatement({
      verbDisplay: 'loggedin',
      objectName : this.props.appTitle,
      objectType : 'page',
      objectID   : this.props.connection.contextID // URL
    });
  };

  _sendLinkStatement = (verb, name, link) => {
    // some links may not have URL, just default to the context ID
    link = link || this.props.connection.contextID;

    this._sendXAPIStatement({
      verbDisplay: verb,
      objectName : name,
      objectType : 'link',
      objectID   : link
    });
  };

  _sendXAPIStatement = fragment => {
    if (!useLRS()) {
      return;
    }

    fragment.subjectName = this.props.user.fullname;
    fragment.subjectID   = this.props.user.email;

    sendFragment(this.props.connection, fragment)
      .fork(e => {
          console.error('Error sending statement: ', e);
          this.setState({error: true});
        },
        r => {
          console.log('Statement sent!', r);
        });
  };

  componentWillMount() {
    this._setAppStatementDefaults();
    if (this.props.login) {
      this._sendLoggedInStatement();
    }
  }

  render() {
    // TODO error view from this.state.error
    return <div>{this.props.children}</div>
  }
}