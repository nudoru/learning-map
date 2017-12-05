import React from 'react';

class UtilityBar extends React.Component {
  static defaultProps = {
    username: null
  };

  static propTypes = {
    label   : React.PropTypes.string,
    links   : React.PropTypes.array,
    username: React.PropTypes.string,
    welcome : React.PropTypes.bool
  };

  render() {

    return (<div className="rh-utilitybar">
      {this.props.welcome ? (
        <p className="user"><i className="fa fa-user"/> Welcome,&nbsp;
          <strong>{this.props.username}!</strong></p>) : null}
      {this.renderLinks()}
    </div>);
  }

  renderLinks() {
    if (!this.props.links) {
      return (<div/>)
    }

    return (<ul className="links">
      {
        this.props.links.map((item, i) => {
          return (
            <li key={i}><a href={item.link} target='_blank'>{item.label}</a>
            </li>);
        })
      }
    </ul>)
  }

}


export default UtilityBar;