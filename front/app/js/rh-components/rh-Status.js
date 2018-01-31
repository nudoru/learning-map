import React from 'react';

export const Status = ({type, icon, children}) => {
  let cls = 'rh-status', sIcon;

  if (type) {
    cls += '-' + type;
  }

  if(icon) {
    sIcon = icon;
  } else {
    switch (type) {
      case 'info':
        sIcon = 'info';
        break;
      case 'success':
        sIcon = 'check';
        break;
      case 'warning':
        sIcon = 'exclamation-triangle';
        break;
      case 'danger':
        sIcon = 'times';
        break;
      default:
        sIcon = 'circle-o';
    }
  }

  return (<div className={cls}>
    <div className="icon">
      <i className={"fa fa-" + sIcon} />
    </div>
    <div className="message">{children}</div>
  </div>);
};

export const StatusLabel = ({type, icon, children}) => {
  let cls = 'rh-status-label', sIcon;

  if (type) {
    cls += '-' + type;
  }

  if(icon) {
    sIcon = icon;
  } else {
    switch (type) {
      case 'info':
        sIcon = 'info';
        break;
      case 'success':
        sIcon = 'check';
        break;
      case 'warning':
        sIcon = 'exclamation-triangle';
        break;
      case 'danger':
        sIcon = 'times';
        break;
      default:
        sIcon = 'circle-o';
    }
  }

  return (<div className={cls}>
    <div className="icon">
      <i className={"fa fa-" + sIcon} />
    </div>
    <div className="message">{children}</div>
  </div>);
};