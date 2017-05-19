import React from 'react';

import UtilityBar from './rh-UtilityBar';

const HeaderSubPage = ({title, secondaryNav, username}) => {
    return (
      <div className="header-region-subpage">
        <div className="page-container">
          <UtilityBar links={secondaryNav} username={username}/>
          <div className="header-title"><h1>{title}</h1></div>
        </div>
      </div>
    )
};

export default HeaderSubPage;