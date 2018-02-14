import React from 'react';
import PropTypes from 'prop-types';
import {curry} from 'ramda';
import {Col, Grid, Row} from "../rh-components/rh-Grid";
import {Button, SecondaryButton} from "../rh-components/rh-Button";
import {TextArea} from "../rh-components/rh-Form";

export class XAPITextArea extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        onSave: PropTypes.func,
        prompt: PropTypes.string,
        disabled: PropTypes.bool,
        previousResponse: PropTypes.string
    };

    static defaultProps = {};

    static contextTypes = {
        connection: PropTypes.object,
        user: PropTypes.object,
        sendLinkStatement: PropTypes.func,
        sendLoggedInStatement: PropTypes.func,
        sendFragment: PropTypes.func,
        sendInteractionStatement: PropTypes.func
    };

    state = {
        isPrompting: true,
        isConfirming: false,
        hasResponded: false,
        hasEnteredText: false,
        responseText: ''
    };

    _handleSaveClick = e => {
        this.setState({isPrompting: false, isConfirming: true})
    };

    _handleCancelClick = e => {
        this.setState({isPrompting: true, isConfirming: false})
    };

    _handleSubmitClick = e => {
        this.setState({
            isPrompting: false,
            isConfirming: false,
            hasResponded: true
        });

        this.context.sendInteractionStatement('fill-in', 'responded', this.props.id, this.props.prompt, this.state.responseText);
        if (this.props.onSave) {
            this.props.onSave({id: this.props.id, response: this.state.responseText})
        }
    };

    _handleInputChange = e => {
        const input = e.target.value;
        if (input.length > 1) {
            this.setState({hasEnteredText: true, responseText: input});
        } else {
            this.setState({hasEnteredText: false});
        }
    };

    render() {
        return <Grid className='xapitextarea-group'>
            {this.state.isPrompting ? this._renderInputForm() : (this.state.isConfirming ? this._renderConfirmResponse() : this._renderFinalResponse())}
        </Grid>;
    }

    _renderInputForm() {
        const {prompt} = this.props;
        return <div>
            <Row>
                <Col>
                    <p className='xapitextarea-prompt'>{prompt}</p>
                    <TextArea className='xapitextarea-text-area'
                              defaultValue={this.state.responseText}
                              onChange={this._handleInputChange}/>
                </Col>
            </Row>
            <Row className='xapitextarea-buttonrow'>
                <Col className='text-center'>
                    <Button hollow onClick={this._handleSaveClick}
                            disabled={!this.state.hasEnteredText}>Save</Button>
                </Col>
            </Row>
        </div>
    }

    _renderConfirmResponse() {
        const {prompt} = this.props;

        return <div>
            <Row>
                <Col>
                    <p className='xapitextarea-confirmation'>You cannot change your response once it's saved. Are you
                        sure?</p>
                </Col>
            </Row>
            <Row className='margin-top margin-bottom'>
                <Col>
                    <p className='xapitextarea-prompt'>{prompt}</p>
                    <blockquote className='xapitextarea-saved-text'>{this.state.responseText}</blockquote>
                </Col>
            </Row>
            <Row className='xapitextarea-buttonrow'>
                <Col className='text-center'>
                    <Button onClick={this._handleCancelClick}
                            className='rh-button-text margin-right'>Edit</Button>
                    <Button onClick={this._handleSubmitClick}>Save</Button>
                </Col>
            </Row>
        </div>;
    }

    _renderFinalResponse() {
        return <div>
            <Row>
                <Col>
                    <p className='xapitextarea-prompt'>{this.props.prompt}</p>
                    <blockquote className='xapitextarea-saved-text'>{this.state.responseText}</blockquote>
                </Col>
            </Row>
        </div>;
    }

}

