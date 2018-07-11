import React from 'react';
import PropTypes from 'prop-types';
import {
    sendFragment,
    setStatementDefaults
} from '../utils/learningservices/lrs/LRS';
import {getLastPathComponent} from '../utils/Toolbox'
import {areRequiredActivitiesCompleted, useLRS} from "../store/selectors";
import {markCourseCompletion, submitCompletion} from "../store/actions/Actions";
import AppStore from "../store/AppStore";


/**
 * Provides a context to child components to allow for easier access to the LRS
 */

export class XAPIProvider extends React.PureComponent {
    static propTypes = {
        connection: PropTypes.object,
        user: PropTypes.object,
        appTitle: PropTypes.string,
        appVersion: PropTypes.string,
        login: PropTypes.bool
    };

    static defaultProps = {};

    static childContextTypes = {
        connection: PropTypes.object,
        user: PropTypes.object,
        sendLinkStatement: PropTypes.func,
        sendLoggedInStatement: PropTypes.func,
        sendFragment: PropTypes.func,
        sendInteractionStatement: PropTypes.func,
        handleItemCompletion: PropTypes.func

    };

    getChildContext() {
        return {
            connection: this.props.connection,
            user: this.props.user,
            sendLinkStatement: this._sendLinkStatement,
            sendLoggedInStatement: this._sendLoggedInStatement,
            sendFragment: this._sendXAPIStatement,
            sendInteractionStatement: this._sendInteractionStatement,
            handleItemCompletion: this._handleItemCompletion
        };
    }

    state = {error: false};

    // Convenience to apply certain values to every statement sent
    _setAppStatementDefaults = _ => {
        const {connection, user} = this.props;

        setStatementDefaults({
            result: {
                completion: true
            },
            context: {
                platform: connection.contextID,
                revision: this.props.appVersion,
                contextActivities: {
                    grouping: [{id: connection.contextGroup}],
                    parent: [{
                        id: connection.contextParent,
                        objectType: 'Activity'
                    }],
                    category: [{
                        id: connection.contextCategory,
                        definition: {type: 'http://id.tincanapi.com/activitytype/source'}
                    }]
                },
                extensions: {
                    ['http://learning.redhat.com/lmsid']: user.id,
                    ['http://learning.redhat.com/oracleid']: user.idnumber
                }
            }
        });
    };

    _sendLoggedInStatement = _ => {
        this._sendXAPIStatement({
            verbDisplay: 'loggedin',
            objectName: this.props.appTitle,
            objectType: 'page',
            objectID: this.props.connection.contextID // URL
        });
    };


    _sendInteractionStatement = (type = 'fill-in', verb = 'responded', objectID, promptQuestion, userInput) => {
        this._sendXAPIStatement({
            verbDisplay: verb,
            objectName: promptQuestion,
            objectType: 'interaction',
            objectID: objectID,
            interactionType: type,
            actorResponse: userInput

        });
    };

    // sets content item as completed, once all the required items are completed, sets course as completed and sends a course completion statement to lrs
    _handleItemCompletion = itemID => {
        AppStore.dispatch(submitCompletion(itemID));
        const state = AppStore.getState();
        if (!state.requiredItemsCompleted) {
            if (areRequiredActivitiesCompleted(state.hydratedContent)) {
                this._sendCourseCompletionStatement();
                AppStore.dispatch(markCourseCompletion(true));
            }
        }
    };


    _sendCourseCompletionStatement = () => {
        this._sendXAPIStatement({
            verbDisplay: 'earned',
            objectName: 'Certificate of ' + this.props.appTitle + ' course completion',
            objectTypeIRI: 'https://www.opigno.org/en/tincan_registry/activity_type/certificate',
            objectID: 'https://www.redhat.com/certificate/' + getLastPathComponent(this.props.connection.contextID),
            verbID: 'http://id.tincanapi.com/verb/earned'
        });
    };

    _sendLinkStatement = (verb, name, link) => {
        // some links may not have URL, just default to the context ID
        link = link || this.props.connection.contextID;

        this._sendXAPIStatement({
            verbDisplay: verb,
            objectName: name,
            objectType: 'link',
            objectID: link
        });
    };

    _sendXAPIStatement = fragment => {
        if (!useLRS()) {
            return;
        }

        fragment.subjectName = this.props.user.fullname;
        fragment.subjectID = this.props.user.email;

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
        // Need to fix the ability to bubble up connection errors to App
        return <div>{this.props.children}</div>
    }
}