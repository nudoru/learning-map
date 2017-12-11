import React from 'react';
import PropTypes from 'prop-types';
import {curry} from 'ramda';
import {Col, Grid, Row} from "../rh-components/rh-Grid";
import {Button, SecondaryButton} from "../rh-components/rh-Button";
import {TextArea} from "../rh-components/rh-Form";

export class XAPITextArea extends React.PureComponent {
  static propTypes = {
    id              : PropTypes.string,
    onSave          : PropTypes.func,
    prompt          : PropTypes.string,
    disabled        : PropTypes.bool,
    previousResponse: PropTypes.string
  };

  static defaultProps = {};

  state = {
    isPrompting   : true,
    isConfirming  : false,
    hasResponded  : false,
    hasEnteredText: false,
    responseText  : ''
  };

  _handleSaveClick = e => {
    this.setState({isPrompting: false, isConfirming: true})
  };

  _handleCancelClick = e => {
    this.setState({isPrompting: true, isConfirming: false})
  };

  _handleSubmitClick = e => {
    this.setState({
      isPrompting : false,
      isConfirming: false,
      hasResponded: true
    });
    // TODO send to the LRS
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
    return <Grid className='reflection-group'>
      {this.state.isPrompting ? this._renderInputForm() : (this.state.isConfirming ? this._renderConfirmResponse() : this._renderFinalResponse())}
    </Grid>;
  }

  _renderInputForm() {
    const {prompt} = this.props;
    return <div>
      <Row>
        <Col>
          <p className='reflection-prompt'>{prompt}</p>
          <TextArea className='reflection-text-area'
                    defaultValue={this.state.responseText}
                    onChange={this._handleInputChange}/>
        </Col>
      </Row>
      <Row>
        <Col className='text-right padding-top'>
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
          <h1>You cannot change your response once it's saved. Are you
            sure?</h1>
        </Col>
      </Row>
      <Row className='margin-top margin-bottom'>
        <Col>
          <p className='reflection-prompt'>{prompt}</p>
          <blockquote className='reflection-saved-text'>{this.state.responseText}</blockquote>
        </Col>
      </Row>
      <Row>
        <Col className='text-right padding-top'>
          <SecondaryButton onClick={this._handleCancelClick}
                           className='margin-right'>Go back</SecondaryButton>
          <Button onClick={this._handleSubmitClick}>I'm sure</Button>
        </Col>
      </Row>
    </div>;
  }

  _renderFinalResponse() {
    return <div>
      <Row>
        <Col>
          <p className='reflection-prompt'>{this.props.prompt}</p>
          <blockquote className='reflection-saved-text'>{this.state.responseText}</blockquote>
        </Col>
      </Row>
    </div>;
  }

}

