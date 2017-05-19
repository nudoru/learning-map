import React from 'react';

export const TabHGroup = ({children}) => {
    return (<div className="rh-tabs-vert">
      <ul>
        {children}
      </ul>
    </div>);
};

export const Tab = ({active, label, onClick = ()=>{}}) => {
  return (<li className={'rh-tab '+ (active === true ? 'active' : '')}>
      <a onClick={onClick}>{label}</a></li>);
};