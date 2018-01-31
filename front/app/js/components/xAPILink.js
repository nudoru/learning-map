import React from 'react';
import PropTypes from 'prop-types';

export class XAPILink extends React.PureComponent {
  static propTypes = {
    id     : PropTypes.string,
    href   : PropTypes.string,
    onClick: PropTypes.func
  };

  static defaultProps = {};

  static contextTypes = {
    connection           : PropTypes.object,
    user                 : PropTypes.object,
    sendLinkStatement    : PropTypes.func,
    sendLoggedInStatement: PropTypes.func,
    sendFragment         : PropTypes.func
  };

  _handleClick = _ => {
    const {children, id, onClick} = this.props;
    this.context.sendLinkStatement('clicked', children, id);
    if (onClick) {
      onClick({title:children, id});
    }
  };

  render() {
    const {href, children} = this.props;
    return <a href={href}
              target="_blank"
              onClick={this._handleClick}
              dangerouslySetInnerHTML={{__html: children}}/>;
  }
}