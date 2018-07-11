import React from 'react';
import PropTypes from 'prop-types';


/**
 * Wraps a <a> to send a clicked statement when it's ... clicked
 */

export class XAPILink extends React.PureComponent {
  static propTypes = {
    href   : PropTypes.string,
    onClick: PropTypes.func,
    id: PropTypes.string,
    contentID: PropTypes.number,
    setCompletion: PropTypes.bool
  };

  static defaultProps = {};

  static contextTypes = {
    connection           : PropTypes.object,
    user                 : PropTypes.object,
    sendLinkStatement    : PropTypes.func,
    sendLoggedInStatement: PropTypes.func,
    sendFragment         : PropTypes.func,
    handleItemCompletion : PropTypes.func
  };

    _handleClick = _ => {
        const {children, href, onClick, contentID, setCompletion, id} = this.props;
        this.context.sendLinkStatement('clicked', children, id);
        if (setCompletion) {
            this.context.handleItemCompletion(contentID);
        }
        if (onClick) {
            onClick({title: children, id});
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