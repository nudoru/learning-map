import React from 'react';
import PropTypes from 'prop-types';
import ModalMessage from '../rh-components/rh-ModalMessage';
import {
  areRequiredActivitiesCompleted,
  getDateRelationship,
  getNumActivitiesForPeriod
} from '../store/selectors';
import {idMatchObjId} from '../utils/AppUtils';
import {ContentRow, PeriodCard, PeriodTopicCard} from './PeriodCard';

class LearningMap extends React.PureComponent {

  static propTypes = {
    userProfile     : PropTypes.object,
    coursesInMap    : PropTypes.array,
    hydratedContent : PropTypes.array,
    config          : PropTypes.object,
    currentStructure: PropTypes.object
  };

  // Content is copied to the state. When a link is clicked/completed this
  // copy is modified w/ an isPending status to change the icon.
  state = {
    contents              : this.props.hydratedContent, // TODO use app state
    allComplete           : areRequiredActivitiesCompleted(this.props.hydratedContent),
    completionNotification: false
  };

  _getStateContentObjById(id) {
    let res = this.state.contents.filter(idMatchObjId(id))[0];
    if (!res) {
      console.error('Content with ID ' + id + ' not found!');
      return {};
    }
    return res;
  }

  _getStateContentObjIndexById(id) {
    return this.state.contents.findIndex(cnt => cnt.id == id); // eslint-disable-line eqeqeq
  }

  // TODO this need to be move to the app state?
  // on link click
  // this._updateStateContentStatus(title, link, cid, true);
  // on completed toggle
  //this._updateStateContentStatus(title, el.target.dataset.contenturl, cid, true, true);
  _updateStateContentStatus(title, link, id, isPending = true, isCompleted = false) {
    let idx      = this._getStateContentObjIndexById(id),
        newState = this.state.contents;

    if (idx < 0) {
      console.warn('Couldn\'t set to pending', title, link);
      return;
    }

    // TODO do this in the app state
    newState[idx].isPending  = true && !newState[idx].isComplete;
    newState[idx].isComplete = isCompleted;

    this.setState({
      contents   : newState,
      allComplete: areRequiredActivitiesCompleted(newState)
    });
  }

  render() {
    const {allComplete} = this.state;
    const {data}        = this.props.currentStructure;

    return <div>
      {allComplete ? this._renderCompletionMessage() : null}
      {data.map(period => this._renderPeriod(period))}
    </div>;
  }

  _renderCompletionMessage() {
    let showNotification = !this.state.completionNotification && this.props.config.setup.completeMessage.length;

    if (showNotification) {
      return <ModalMessage
        message={{
          title        : 'Complete',
          icon         : 'check-circle-o',
          buttonLabel  : 'Continue',
          buttonOnClick: this._dismissCompletionMessage.bind(this)
        }}>
        <div
          dangerouslySetInnerHTML={{__html: this.props.config.setup.completeMessage}}></div>
      </ModalMessage>;
    }
    return null;
  }

  _dismissCompletionMessage() {
    this.setState({completionNotification: true});
  }

  _renderPeriod(period) {
    let periodContentCount = getNumActivitiesForPeriod(period),
        timePeriod         = getDateRelationship(period.startdate, period.enddate),
        startDate          = period.startdate ? period.startdate.format('l') : '', //'dddd, MMMM Do YYYY'
        endDate            = period.enddate ? period.enddate.format('l') : '';

    return (<PeriodCard activities={periodContentCount}
                        startDateDisplay={startDate}
                        endDateDisplay={endDate}
                        timePeriod={timePeriod}
                        config={this.props.config}
                        currentStructure={this.props.currentStructure}
                        {...period}>
      {period.topics.map(topic => this._renderPeriodTopic(topic))}
    </PeriodCard>);
  }

  _renderPeriodTopic(topic) {
    return (<PeriodTopicCard {...topic}>
      {topic.content.map((contentID, index) => this._renderContentRow(contentID))}
    </PeriodTopicCard>);
  }

  _renderContentRow(contentID) {
    const {config}   = this.props,
          contentObj = this._getStateContentObjById(contentID),
          isComplete = contentObj.isComplete;

    let modNote = '',
        status  = 1;

    if (contentObj.lmsDetails) {
      // It's a course tracked on the LMS
      status  = 0; // Default to not-enrolled
      modNote = 'Not enrolled on LMS';
      if (contentObj.lmsStatus) {
        status  = isComplete ? 3 : 1;
        modNote = isComplete ? 'Completed' : 'Enrolled on LMS';
      }
    } else {
      // Else, it's tracked on the LRS
      if (isComplete) {
        status  = 3;
        modNote = 'Viewed';
      }
    }

    // "Pending" is after clicking a link or toggling a button. State on a server /maybe/
    // update, but we're not calling the server to check right now
    if (contentObj.isPending) {
      status = 4;
    }

    return <ContentRow contentObj={contentObj}
                       status={status}
                       modType={config.contentTypes[contentObj.contentType].label}
                       modIcon={config.contentTypes[contentObj.contentType].icon}
                       modNote={modNote}
                       onLinkClick={this._onLinkClickCb}
                       onCompletedClick={this._onCompletedClickCb}
    />;
  }

  // this._updateStateContentStatus(title, link, cid, true);
  _onLinkClickCb = ({title, id}) => console.log('Link clicked',title, id);

  //this._updateStateContentStatus(title, el.target.dataset.contenturl, cid, true, true);
  _onCompletedClickCb = ({title, id}) => console.log('Toggle clicked',title, id);
}

export default LearningMap;