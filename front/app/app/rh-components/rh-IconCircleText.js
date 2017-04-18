import React from 'react';

class IconCircleText extends React.Component {
  render() {
    let style = 'rh-icon-circle-text';

    if (this.props.style) {
      style += '-' + this.props.style;
    }

    return (<div className={style}>
      {this.props.label}
    </div>);
  }
}

IconCircleText.defaultProps = {
  label: 'Label',
  style: null
};
IconCircleText.propTypes    = {
  label: React.PropTypes.string,
  style: React.PropTypes.string
};

export default IconCircleText;