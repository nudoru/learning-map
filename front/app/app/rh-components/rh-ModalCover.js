import React from 'react';

class ModalCover extends React.Component {

  onClick(e) {
    e.preventDefault();

    if (this.props.dismissible && this.props.dismissFunc) {
      this.props.dismissFunc.call(null);
    }
  }

  render() {
    let coverClass = ['rh-modal-cover'];

    if (this.props.dismissible) {
      coverClass.push('dismissible');
    }

    if(!this.props.visible) {
      coverClass.push('hidden')
    }

    return <div className={coverClass.join(' ')}
                onClick={this.props.dismissFunc}>
    </div>;
  }
}

ModalCover.defaultProps = {
  dismissible: false,
  dismissFunc: () => {
  },
  visible    : true
};

ModalCover.propTypes = {
  dismissible: React.PropTypes.bool,
  dismissFunc: React.PropTypes.func,
  visible    : React.PropTypes.bool
};

export default ModalCover;