import React from 'react';
import CardGroup from '../rh-components/rh-CardGroup';
import Card from '../rh-components/rh-Card';
import Table from '../rh-components/rh-DataTable';
import UserSummary from '../rh-components/rh-UserSummary';
import Pagination from '../rh-components/rh-Pagination';

class UserColumn extends React.Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    console.log(this.props.userProfile)
  }

  render() {
    return (<CardGroup orientation='vertical'>
      <Card style='shaded'>
        <UserSummary style="stacked"
                     profileImageURL={this.props.userProfile.profileimageurl}
                     name={this.props.userProfile.fullname}
                     summary={this.props.userProfile.customfields.learnerjobtitle}/>
        {this.renderTodos(this.props.enrolledCourses)}
        {this.renderMyEvents(this.props.userCalendar)}

        {/*<h1 className="padded-topbottom">My Additional*/}
        {/*Resources</h1>*/}
        {/*<ul className="block-links">*/}
        {/*<li><a*/}
        {/*href="https://learning.redhat.com/totara/plan/record/evidence/index.php">My*/}
        {/*learning<em>on the LMS</em></a></li>*/}
        {/*<li><a*/}
        {/*href="https://mojo.redhat.com/community/hr/compass">My*/}
        {/*development<em>Compass tool</em></a></li>*/}
        {/*</ul>*/}
      </Card>
    </CardGroup>);
  }

  renderTodos(data) {
    if (data) {
      return (<div>
          <h1 className="padded-topbottom">My To-do's</h1>
        <Card >
          <Table style='small' jsonData={data} hover={true}/>
          </Card>
          {/*<Pagination start={1} end={2} current={1} next={false} prev={false}/>*/}
        </div>
      );
    }
  }

  renderMyEvents(data) {
    if (data.length) {
      return (<div>
        <h1 className="padded-topbottom">My Events</h1>
        {data.map(cls => this.renderEventCard(cls))}
      </div>);
    }
  }

  // Expects format January 1, 2017
  splitDate(datestr) {
    let parts = datestr.split(' ');
    return {
      month: parts[0],
      day  : parts[1].substring(0, parts[1].length - 1),
      year : parts[2]
    };
  }

  renderEventCard(data) {
    let date = this.splitDate(data.classes[0].classDetails.schedule.start.date);
    return (<Card >
      <div className="interior">
        <div className="left">
          <ul className="rh-event">
            <li className="month">{date.month}</li>
            <li className="day">{date.day}</li>
            <li className="year">{date.year}</li>
          </ul>
        </div>
        <div className="right">
          <ul className="rh-event-details">
            <li className="class">{data.name}</li>
            <li
              className="city">{data.classes[0].classDetails.city + ', ' + data.classes[0].classDetails.country}</li>
            <li className="room">{data.classes[0].classDetails.room.room}</li>
          </ul>
        </div>
      </div>
    </Card>);
  }

}

UserColumn.defaultProps = {};
UserColumn.propTypes    = {
  userProfile    : React.PropTypes.object,
  enrolledCourses: React.PropTypes.array,
  userCalendar   : React.PropTypes.array
};

export default UserColumn;