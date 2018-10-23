import React from 'react';

export const SystemAlert = ({children}) => {
  return (children ? <div className='system-alert' dangerouslySetInnerHTML={{__html: children}}/> : null);
};