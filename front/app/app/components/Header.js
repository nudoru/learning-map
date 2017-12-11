import React from 'react';

import UtilityBar from '../rh-components/rh-UtilityBar';

const Header = ({title, secondaryNav, username}) => {
  return (
    <header className="header-region-minor">
      <div className="page-container">
        <UtilityBar welcome links={secondaryNav} username={username}/>
        <div className="header-title"><h1>{title}</h1></div>
      </div>
    </header>
  );
};

export default Header;