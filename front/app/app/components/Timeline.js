import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-scroll';
import {getDateRelationship, isPeriodComplete} from '../store/selectors';
import {StatusIconTiny} from '../rh-components/rh-StatusIcon';
import IconCircleText from '../rh-components/rh-IconCircleText';
import {getElStyleProp, position, pxToInt} from '../utils/DOMToolbox';
import {ScrollWatch} from "./ScrollWatch";

class Timeline extends React.PureComponent {

  static defaultProps = {};
  static propTypes    = {
    currentStructure: PropTypes.object
  };

  isWaiting              = false;
  initialYPosition       = 0;
  repositionAfterYScroll = 0;
  timelineEl             = null;

  componentDidMount() {
    this.timelineEl = document.querySelector('.rh-timeline-container');
    this.initialYPosition = pxToInt(getElStyleProp(this.timelineEl, 'top'));
    this.repositionAfterYScroll = position(this.timelineEl).top;
  }

  render() {
    const {currentStructure} = this.props;

    return <ScrollWatch render={(x, y) => {

      let newYPosition;

      if (y > this.repositionAfterYScroll) {
        newYPosition = y - this.repositionAfterYScroll + this.initialYPosition;
      } else {
        newYPosition = this.initialYPosition;
      }

      const tlStyle = {top: newYPosition};

      return <div style={tlStyle}
                  className="content-region rh-timeline-container">
        <div className="page-container">
          <div className="rh-timeline">
            <ul>
              {currentStructure.data.map((period, i) => {
                let timePeriod, clsName = [],
                    complete            = isPeriodComplete(period) ?
                      <div className="complete"><StatusIconTiny type="success"/>
                      </div> : null;

                if (period.startdate && period.enddate) {
                  timePeriod = getDateRelationship(period.startdate, period.enddate);
                  if (timePeriod === -1) {
                    clsName.push('past');
                  } else if (timePeriod === 1) {
                    clsName.push('future');
                  } else {
                    clsName.push('current');
                  }
                }

                return <li key={i} className={clsName.join(' ')}>
                  <div className="block"><Link
                    to={'period' + period.period}
                    smooth={true}
                    offset={-150}
                    duration={500}>
                    <span>{period.category}</span>
                    <IconCircleText label={period.period}
                                    style='inverse-small'/>
                  </Link>
                    {complete}
                  </div>
                </li>;
              })}
            </ul>
          </div>

        </div>
      </div>
    }}/>;
  }
}

export default Timeline;