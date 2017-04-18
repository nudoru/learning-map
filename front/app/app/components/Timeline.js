import React from 'react';
import {Link} from 'react-scroll';
import {getTimePeriod} from '../utils/AppUtils';
import {isPeriodComplete} from '../store/selectors';
import {StatusIconTiny} from '../rh-components/rh-StatusIcon';
import IconCircleText from '../rh-components/rh-IconCircleText';
import {position, addClass, removeClass, getElStyleProp, pxToInt} from '../utils/DOMToolbox';

/*
 This scroll behavior completely violates the React methodology, but it works
 */

class Timeline extends React.Component {

  constructor() {
    super();
    this.state = {};

    this.lastScrollYPosition    = 0;
    this.isWaiting              = false;
    this.initialYPosition       = 0;
    this.repositionAfterYScroll = 0;
    this.timelineEl             = null;
  }

  componentDidMount() {
    this.timelineEl = document.querySelector('.rh-timeline-container');

    this.initialYPosition = pxToInt(getElStyleProp(this.timelineEl, 'top'));

    // Get top offset position (location on screen)
    this.repositionAfterYScroll = position(this.timelineEl).top;

    window.addEventListener('scroll', this._onWindowScroll.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this._onWindowScroll.bind(this));
  }

  _onWindowScroll(e) {
    this.lastScrollYPosition = window.scrollY;
    if (!this.isWaiting) {
      window.requestAnimationFrame(() => {
        this._reposition(this.lastScrollYPosition);
        this.isWaiting = false;
      });
    }
    this.isWaiting = true;
  }

  _reposition(yPosition) {
    if (yPosition > this.repositionAfterYScroll) {
      this._setTimelineElTopPosition(yPosition - this.repositionAfterYScroll + this.initialYPosition);
      addClass(this.timelineEl, 'rh-timeline-floating');
    } else {
      removeClass(this.timelineEl, 'rh-timeline-floating');
      this._setTimelineElTopPosition(this.initialYPosition);
    }
  }

  _setTimelineElTopPosition(top) {
    this.timelineEl.style.top = top + 'px';
  }

  render() {
    let {currentStructure} = this.props;

    return (
      <div className="content-region rh-timeline-container">
        <div className="page-container">

          <div className="rh-timeline">
            <ul>
              {currentStructure.data.map((period, i) => {
                let timePeriod, clsName = [],
                    complete = isPeriodComplete(period) ? <div className="complete"><StatusIconTiny status={3}/></div> : null;

                if (period.startdate && period.enddate) {
                  timePeriod = getTimePeriod(period.startdate, period.enddate);
                  if (timePeriod === -1) {
                    clsName.push('past');
                  } else if (timePeriod === 1) {
                    clsName.push('future');
                  } else {
                    clsName.push('current');
                  }
                }

                // Removed the labels
                //<div className="block-label" dangerouslySetInnerHTML={{__html: period.startdate}}></div>
                return <li key={i} className={clsName.join(' ')}>
                  <div className="block"><Link
                    to={'period' + period.period} smooth={true} offset={-150}
                    duration={500}>
                    <span>{period.category}</span>
                    <IconCircleText label={period.period} style='inverse-small'/>
                    </Link>
                    {complete}

                  </div>
                </li>
              })}
            </ul>
          </div>

        </div>
      </div>
    );
  }
}

Timeline.defaultProps = {};
Timeline.propTypes    = {};

export default Timeline;