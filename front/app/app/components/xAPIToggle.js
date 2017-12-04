import React from 'react';
import PropTypes from 'prop-types';
import {curry} from 'ramda';
import Toggle from 'react-toggle';
import {sendCompletedStatement} from "./LRSProvider";

const completedLabel  = 'Completed';
const incompleteLabel = 'Mark complete';

export class XAPIToggle extends React.PureComponent {
  static propTypes = {
    id      : PropTypes.string,
    onClick : PropTypes.func,
    title   : PropTypes.string,
    disabled: PropTypes.bool,
    complete: PropTypes.bool
  };

  static defaultProps = {};

  state = {toggled: false};

  // Remove the curry and params, we can get this from props now
  _handleClick = curry((title, id, onClick, evt) => {
    if (this.state.toggled) {
      // Shouldn't read this point
      console.warn(`Ignoring additional toggle clicks on ${id}`);
      return;
    }

    this.setState({toggled: true});

    sendCompletedStatement(title, id);

    if (onClick) {
      onClick({title, id});
    }
  });

  render() {
    const {id, onClick, title, disabled, complete} = this.props;

    return <label>
      <Toggle
        defaultChecked={complete}
        disabled={disabled || complete || this.state.toggled}
        onChange={this._handleClick(title, id, onClick)}/>
      <span
        className="toggle-label">{complete || this.state.toggled ? completedLabel : incompleteLabel}</span>
    </label>;
  }
}