import React from 'react';

const Well = ({children, className, ...other}) => <div className={"rh-well "+className} {...other}>{children}</div>;

export default Well;