import React from 'react';

import UtilityBar from '../rh-components/rh-UtilityBar';

const HeaderMinor = ({title, secondaryNav, username}) => {
    return (
      <div className="header-region-minor">
        <div className="page-container">
          <UtilityBar links={secondaryNav} username={username}/>
          <div className="header-title"><h1>{title}</h1></div>
        </div>
      </div>
    )
};

export default HeaderMinor;