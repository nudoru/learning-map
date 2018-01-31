import React from 'react';
import { NavLink } from 'react-router-dom';

// TODO fix placeholder isn't showing up
const SearchBar = ({placeholder}) => {
  return <div className="navigationbar-search">
    <input type="text" placeholder={placeholder}/>
    <button><i className="fa fa-search"/></button>
  </div>;
};

const NavItem = ({item, key}) => {
  return <li key={key}>
    <NavLink exact
             activeClassName='active'
             to={item.route}>{item.label}</NavLink>
  </li>;
};

const NavigationBar = ({search, searchPlaceHolder, nav}) => {
  let searchBox = search ? <SearchBar placeholder={searchPlaceHolder}/> : null;

  return (
    <div className="navigationbar">
      <ul>
        {
          nav.map((item, i) => <NavItem item={item} key={i}/>)
        }
      </ul>
      {searchBox}
    </div>
  );
};

export default NavigationBar;