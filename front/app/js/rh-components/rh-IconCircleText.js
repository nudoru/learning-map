import React from 'react';

const IconCircleText = ({label, style, center, className}) => {
  let cls = 'rh-icon-circle-text';

  if (style) {
    cls += '-' + style;
  }

  if (center) {
    cls += ' margin-center';
  }

  if (className) {
    cls += ' ' + className;
  }

  return (<div className={cls}>
    <span>{label}</span>
  </div>);
};

export default IconCircleText;