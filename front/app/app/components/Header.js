import React from 'react';

import UtilityBar from '../rh-components/rh-UtilityBar';

const Header = ({title, secondaryNav, username}) => {
  return (
    <header className="header-region-minor">
      <div className='utilitybar-container'>
        <div className="page-container ">
          <UtilityBar welcome links={secondaryNav} username={username}/>
        </div>
      </div>
      <div className="page-container">
        <div className="header-title"><h1>{title}</h1></div>
      </div>
    </header>
  );
};

export default Header;