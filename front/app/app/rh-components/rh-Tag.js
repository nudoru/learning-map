import React from 'react';

export const TagHGroup = ({children, className = ''}) => <div
  className={'rh-tag-hgroup ' + className}>{children}</div>;
export const TagVGroup = ({children, className = ''}) => <div
  className={'rh-tag-vgroup ' + className}>{children}</div>;

export const Tag = ({children}) => <div className="rh-tag">{children}</div>;
