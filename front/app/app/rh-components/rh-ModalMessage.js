import React from 'react';

/**
 * Simple modal message cover
 */

class ModalMessage extends React.Component {

  onClick(e) {
    e.preventDefault();

    if (this.props.dismissible && this.props.dismissFunc) {
      this.props.dismissFunc.call(null);
    }
  }

  render() {
    let content,
        boxClass   = ['rh-modal-box'],
        coverClass = ['rh-modal-cover'],
        button     = this.props.dismissible ? (
          <button className="rh-button" onClick={this.onClick.bind(this)}>
            {this.props.dismissButtonLabel}</button>) : '';

    if (this.props.error) {
      boxClass.push('error');
    }

    if (this.props.dismissible) {
      coverClass.push('dismissible');
    }

    content = this.props.children ? (
        <div>
          <div className={coverClass.join(' ')}
               onClick={this.onClick.bind(this)}>
          </div>
          <div className={boxClass.join(' ')}>
            {this.props.children}
            {button}
          </div>
        </div>
    ) : null;

    return content;
  }
}

ModalMessage.defaultProps = {
  error             : false,
  dismissible       : false,
  dismissFunc       : null,
  dismissButtonLabel: 'Ok'
};

ModalMessage.propTypes = {
  error             : React.PropTypes.bool,
  dismissible       : React.PropTypes.bool,
  dismissFunc       : React.PropTypes.func,
  dismissButtonLabel: React.PropTypes.string
};

export default ModalMessage;