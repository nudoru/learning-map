import React from 'react';
import IconCircleImage from './rh-IconCircleImage.js';

class UserSummary extends React.Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
  }

  render() {
    let style = this.props.style ? 'rh-usersummary-' + this.props.style : 'rh-usersummary',
      userImage;

    if(this.props.profileImageURL) {
      userImage = (<div className="rh-usersummary-profileimage">
        <IconCircleImage url={this.props.profileImageURL}/>
      </div>);
    }

    return (<div className={style}>
      {userImage}
      <div className="rh-usersummary-details">
        <h1>{this.props.name}</h1>
        <h2>{this.props.summary}</h2>
      </div>
    </div>);
  }
}

UserSummary.defaultProps = {
  name   : 'John Doe',
  summary: 'Summary',
  profileImageURL: null
};
UserSummary.propTypes    = {
  profileImageURL: React.PropTypes.string,
  name           : React.PropTypes.string,
  summary        : React.PropTypes.string,
  style          : React.PropTypes.string
};

export default UserSummary;