import React from 'react';
import DangerousAppState from '../store/DangerousAppState';
import {getNumActivitiesForPeriod, useLRS} from '../store/selectors';
import {getTimePeriod, idMatchObjId, contentTitleToLink, contentLinkWithId} from '../utils/AppUtils';
import {PeriodCard, PeriodTopicCard, ContentRow} from './PeriodCard';
import {LRS} from '../utils/learning/lrs/LRS';

class LearningMap extends React.Component {

  constructor() {
    super();
    this.state = {contents: DangerousAppState.dangerousGetState().config.content};
  }

  componentDidMount() {
    this._connectToLRS();

    console.log('Total content items: '+this.state.contents.length);
  }

  _connectToLRS() {
    if (!useLRS()) {
      return;
    }

    let {config} = DangerousAppState.dangerousGetState();


    LRS.setStatementDefaults({
      result : {
        completion: true
      },
      context: {
        platform         : config.webservice.lrs.contextID,
        revision         : config.currentStructure.version,
        contextActivities: {
          grouping: [{id: config.webservice.lrs.contextGroup}],
          parent  : [{
              id        : config.webservice.lrs.contextParent,
              objectType: "Activity"
            }],
          category: [{
              id        : config.webservice.lrs.contextCategory,
              definition: {type: "http://id.tincanapi.com/activitytype/source"}
            }]
        }
      }
    });

    // Send user x loggedin statement, disable for dev and testing to avoid spamming the LRS
    this._sendLoggedInStatement();
  }

  _sendLoggedInStatement() {
    let {config} = DangerousAppState.dangerousGetState();
    this._sendXAPIStatement({
      verbDisplay: 'loggedin',
      objectName : config.setup.title,
      objectType : 'page',
      objectID   : config.webservice.lrs.contextID // URL
    });
  }

  // When a link is clicked
  _sendLinkStatement(name, link) {
    console.log('send link statement', name, link);
    this._sendStatementForLink('clicked', name, link);
  }

  // When the complete button is toggled on
  _sendCompletedStatement(name, link) {
    console.log('send link statement', name, link);
    this._sendStatementForLink('completed', name, link);
  }

  _sendStatementForLink(verb, name, link) {
    // some links may not have URL, just default to the context ID
    link = link || DangerousAppState.dangerousGetState().config.webservice.lrs.contextID;
    this._sendXAPIStatement({
      verbDisplay: verb,
      objectName : name,
      objectType : 'link',
      objectID   : link
    });
  }

  _sendXAPIStatement(partialStatement) {
    return;
    /* Disabled for dev
    if (!useLRS()) {
      return;
    }
    let {fullUserProfile}        = DangerousAppState.dangerousGetState();

    partialStatement.subjectName = fullUserProfile.fullname;
    partialStatement.subjectID   = fullUserProfile.email;
    LRS.sendStatement(LRS.createStatement(partialStatement))
      .fork(e => console.warn('Error sending statement', e), r => console.log('Statement sent!', r));
      */
  }

  // Will be passed the <a> element
  _onLinkClick(el) {
    if (el.target) {
      let title = el.target.dataset.contentname, link = el.target.dataset.contenturl, cid=el.target.dataset.contentid;

      // Make it unique
      link = contentLinkWithId(link, cid);

      this._sendLinkStatement(title, link);
      this._updateStateContentStatus(title, link, cid, true);
    }
  }

  // Will be passed the checkbox element from the react-toggle component
  // Name (innerHTML) and link (url) are added as data-* attributes on the element
  _onCompletedClick(el) {
    if (el.target) {
      let title = el.target.dataset.contentname, link = el.target.dataset.contenturl, cid=el.target.dataset.contentid;
      if(!link) {
        // Use the "linkified" title for the link
        link = contentTitleToLink(title, cid);
      } else {
        // Make it unique
        link = contentLinkWithId(link, cid);
      }
      console.log('Toggled', title, link);
      this._sendCompletedStatement(title, link);
      this._updateStateContentStatus(title, el.target.dataset.contenturl, cid, true);
    }
  }

  _updateStateContentStatus(title, link, id, isPending, isCompleted) {
    let idx      = this._getStateContentObjIndexById(id),
        newState = this.state.contents;

    if (idx < 0) {
      console.warn('Couldn\'t set to pending', title, link);
      return;
    }

    newState[idx].isPending = true && !newState[idx].isComplete;

    this.setState({contents: newState});
  }

  _getStateContentObjById(id) {
    let res = this.state.contents.filter(idMatchObjId(id))[0];
    if (!res) {
      console.error('Content with ID ' + id + ' not found!');
      return {}
    }
    return res;
  }

  //_getStateContentObjIndexByLink(link) {
  //  return this.state.contents.findIndex(cnt => cnt.contentLink === link);
  //}
  //
  //_getStateContentObjIndexByTitle(title) {
  //  return this.state.contents.findIndex(cnt => cnt.title === title);
  //}

  _getStateContentObjIndexById(id) {
    return this.state.contents.findIndex(cnt => cnt.id == id); // eslint-disable-line eqeqeq
  }

  render() {
    let {config} = this.props;
    return (<div>
      {config.currentStructure.data.map(period => this._renderPeriod(period))}
    </div>);
  }

  _renderPeriod(period) {
    let periodContentCount = getNumActivitiesForPeriod(period),
        timePeriod         = getTimePeriod(period.startdate, period.enddate),
        startDate          = period.startdate ? period.startdate.format('l') : '', //'dddd, MMMM Do YYYY'
        endDate            = period.enddate ? period.enddate.format('l') : '';

    return (<PeriodCard activities={periodContentCount}
                        startDateDisplay={startDate}
                        endDateDisplay={endDate}
                        timePeriod={timePeriod}
                        {...period}>
      {period.topics.map(topic => this._renderPeriodTopic(topic))}
    </PeriodCard>);
  }

  _renderPeriodTopic(topic) {
    return (<PeriodTopicCard {...topic}>
      {topic.content.map((contentID, index) => this._renderContentRow(contentID))}
    </PeriodTopicCard>)
  }

  _renderContentRow(contentID) {
    let {config}        = this.props,
        contentObj      = this._getStateContentObjById(contentID),
        isComplete      = contentObj.isComplete,
        modNote         = '',
        status          = 1;

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
                       onLinkClick={this._onLinkClick.bind(this)}
                       onCompletedClick={this._onCompletedClick.bind(this)}
    />;
  }

}

LearningMap.propTypes = {
  fullUserProfile: React.PropTypes.object,
  enrolledCourses: React.PropTypes.array,
  userCalendar   : React.PropTypes.array,
  coursesInMap   : React.PropTypes.array,
  config         : React.PropTypes.object
};

export default LearningMap;