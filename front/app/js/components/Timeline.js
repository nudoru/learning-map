import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-scroll';
import {
  getNumActivitiesForPeriod,
  getNumCompletedActivitiesForPeriod,
  isPeriodComplete
} from '../store/selectors';
import {ScrollWatch} from "./ScrollWatch";
import {StatusRibbonTop} from "./StatusRibbon";

class Timeline extends React.PureComponent {

  static defaultProps = {};
  static propTypes    = {
    currentStructure: PropTypes.object
  };

  initialYPosition = 0;
  timelineEl       = null;

  componentDidMount() {
    // Get a reference to the DOM element and it's starting Y position in the
    // document flow
    this.timelineEl       = document.querySelector('.rh-timeline-container');
    this.initialYPosition = this.timelineEl.getBoundingClientRect().top;
  }

  render() {
    const {currentStructure} = this.props;

    return <ScrollWatch render={(scrollx, scrolly) => {

      let cls = ['content-region', 'rh-timeline-container'];

      if (scrolly > this.initialYPosition) {
        cls.push('rh-timeline-floating');
      }

      return <div className={cls.join(' ')}>
        <div className="page-container">
          <nav className="rh-timeline">
            <ul>
              {currentStructure.data.map((period, i) =>
                <TimeLineItem
                period={period}
                key={i}
                activities={getNumActivitiesForPeriod(period)}
                completed={getNumCompletedActivitiesForPeriod(period)}
                />)}
            </ul>
          </nav>
        </div>
      </div>
    }}/>;
  }
}

const TimeLineItem = ({period, key, activities,completed}) => {
  let timePeriod,
      clsName  = ['rh-timeline-item'],
      statusMarker = isPeriodComplete(period) ?
        <StatusRibbonTop type={3}/> : null;

      // Disabled because we're using the ribbon for status indicators
      // complete = isPeriodComplete(period) ?
      //   <div className="complete"><StatusIconTiny type="success"/>
      //   </div> : null;

  // Disabled pending updated styles MBP 12/6/17
  // The app has been rethemed and no new styles have been created for this functionality
  // if (period.startdate && period.enddate) {
  //   timePeriod = getDateRelationship(period.startdate, period.enddate);
  //   if (timePeriod === -1) {
  //     clsName.push('past');
  //   } else if (timePeriod === 1) {
  //     clsName.push('future');
  //   } else {
  //     clsName.push('current');
  //   }
  // }
  //<IconCircleText label={period.period} style='inverse-small'/>

  return <li key={key} className={clsName.join(' ')}>
    <div className='complete'>
    {statusMarker}
    </div>
    <Link
      to={'period' + period.period}
      smooth={true}
      offset={-120}
      duration={500}>
      <span>{period.category}</span>
      <span className='timeline-item-meta'><i className='fa fa-check'/> <em>{completed}</em> of <em>{activities}</em></span>
    </Link>
  </li>;
};

export default Timeline;