import React from 'react';
import NavigationBar from '../rh-components/rh-NavigationBar'
import UtilityBar from '../rh-components/rh-UtilityBar';

const Title = (props) => (
  <div className="header-title"><h1>{props.label}</h1></div>);
Title.propTypes = {
  label: React.PropTypes.string
};


class Header extends React.Component {

  render() {
    return (
      <div className="header-region">
        <div className="page-container">
          <UtilityBar links={[{label: 'Mojo', link: ''}, {
            label: 'LMS',
            link : ''
          }, {label: 'PnT', link: ''}, {
            label: 'Feedback',
            link : ''
          }, {label: 'Help & Support', link: ''}]}/>
          <Title label="Associate Learning Portal"/>
          <NavigationBar nav={[
            {label: 'Home', route: '/'},
            {label: 'Two', route: '/two'},
            {label: 'Three', route: '/three'},
            {label: 'Four', route: '/four'},
            {label: 'Five', route: '/five'}
          ]} search={true} searchPlaceholder='What are you looking for?'/>
        </div>
      </div>
    )
  }
}

export default Header;