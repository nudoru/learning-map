import React from 'react';
import {Link} from 'react-router';
import {LocationSubscriber} from 'react-router/Broadcasts';

/*
Depends on LocationSubscriber in React-router 4 to get the current path and update on changes
 */

class NavigationBar extends React.Component {

  constructor() {
    super();
    this.state = {currentPath: ''};
  }

  render() {
    let searchBox = this.props.search ?
      (<div className="navigationbar-search"><input type="text"
                                                    placeholder={this.props.searchPlaceholder}/>
        <button><i className="fa fa-search"/></button>
      </div>) : <div/>;

    return (
      <div className="navigationbar">
        <LocationSubscriber channel="location">
          {(location) =>(
            <ul>
              {
                this.props.nav.map((item, i) => {
                  return <li key={i}><Link
                    className={location.pathname === item.route ? 'active' : ''}
                    to={item.route}>{item.label}</Link></li>
                })
              }
            </ul>
            )}
        </LocationSubscriber>
        {searchBox}
      </div>
    );
  }
}

NavigationBar.defaultProps = {
  search           : false,
  searchPlaceholder: 'Search'
};

NavigationBar.propTypes = {
  nav              : React.PropTypes.array,
  search           : React.PropTypes.bool,
  searchPlaceholder: React.PropTypes.string
};

export default NavigationBar;