import React from 'react';
import { connect } from 'react-redux';

import UtilityBar from '../rh-components/rh-UtilityBar';

const Header = ({title, secondaryNav, username}) => {
  return (
    <div className="header-region-minor">
      <div className="page-container">
        <UtilityBar links={secondaryNav} username={username}/>
        <div className="header-title"><h1>{title}</h1></div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    title       : state.config.setup.title,
    secondaryNav: state.config.setup.secondaryNav,
    username    : state.userProfile.fullname
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);

//export default Header;