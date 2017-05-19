import React from 'react';
 import NavigationBar from '../rh-components/rh-NavigationBar'
import UtilityBar from './rh-UtilityBar';

const Header = ({title, secondaryNav, username, nav}) => {
    return (
      <div className="header-region">
        <div className="page-container">
          <UtilityBar links={secondaryNav} username={username}/>
          <div className="header-title"><h1>{title}</h1></div>
          <NavigationBar nav={nav} search={false} searchPlaceholder='Search'/>
        </div>
      </div>
    );
};

export default Header;