import React from 'react';

const IconCircle = ({icon, center, className, size}) => {
  let cls = size === 's' ? ['rh-icon-circle-icon-small'] : ['rh-icon-circle-icon'];
  if (center) {
    cls.push('margin-center');
  }
  if (className) {
    cls.push(className);
  }
  return <div className={cls.join(' ')}><i className={'fa fa-' + icon}></i>
  </div>;
};

export default IconCircle;