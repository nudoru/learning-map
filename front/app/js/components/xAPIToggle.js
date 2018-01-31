import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';

/**
 * Sends a complete statement when the toggle is clicked
 */

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

  static contextTypes = {
    connection           : PropTypes.object,
    user                 : PropTypes.object,
    sendLinkStatement    : PropTypes.func,
    sendLoggedInStatement: PropTypes.func,
    sendFragment         : PropTypes.func
  };

  state = {toggled: false};

  _handleClick = _ => {
    if (this.state.toggled) {
      // This should never happen because the control is disabled if it's completed
      // console.warn(`Ignoring additional toggle clicks on ${id}`);
      return;
    }

    const {title, id, onClick} = this.props;
    this.setState({toggled: true});
    this.context.sendLinkStatement('completed', title, id);
    if (onClick) {
      onClick({title, id});
    }
  };

  render() {
    const {disabled, complete} = this.props;
    return <label>
      <Toggle
        icons={{unchecked: null}}
        defaultChecked={complete}
        disabled={disabled || complete || this.state.toggled}
        onChange={this._handleClick}/>
      <span
        className="toggle-label">{complete || this.state.toggled ? completedLabel : incompleteLabel}</span>
    </label>;
  }
}