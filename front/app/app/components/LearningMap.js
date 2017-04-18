import React from 'react';
import AppState from '../store/AppState';
import {getNumActivitiesForPeriod} from '../store/selectors';
import {useLRS} from '../services/fetchLRS';
import {getTimePeriod, idMatchObjId, contentTitleToLink, contentLinkWithId} from '../utils/AppUtils';
import {PeriodCard, PeriodTopicCard, ContentRow} from './PeriodCard';
import {LRS} from '../utils/learning/lrs/LRS';

class LearningMap extends React.Component {

  constructor() {
    super();
    // I'm not worried about immutability here since truth is on the servers
    // And this just lasts until a refresh
    this.state = {contents: AppState.getState().config.content};
  }

  componentDidMount() {
    this._connectToLRS();

    console.log('Total content items: '+this.state.contents.length);
  }

  // It's configured in AppState as it loads previous statements
  _connectToLRS() {
    if (!useLRS()) {
      return;
    }

    let {config} = AppState.getState();


    // TODO
    // set subject.account w/ LMS user ID?
    // set subject here?
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
    let {config} = AppState.getState();
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
    link = link || AppState.getState().config.webservice.lrs.contextID;
    this._sendXAPIStatement({
      verbDisplay: verb,
      objectName : name,
      objectType : 'link',
      objectID   : link
    });
  }

  _sendXAPIStatement(partialStatement) {
    return;
    /*
    if (!useLRS()) {
      return;
    }
    let {fullUserProfile}        = AppState.getState();

    partialStatement.subjectName = fullUserProfile.fullname;
    partialStatement.subjectID   = fullUserProfile.email;
    LRS.sendStatement(LRS.createStatement(partialStatement))
      .fork(e => console.warn('Error sending statement', e), r => console.log('Statement sent!', r));
      */
  }

  // Will be passed the <a> element
  _onLinkClick(el) {
    if (el.target) {
      // let title = el.target.innerHTML, link = el.target.href;
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
    // let idx      = link ? this._getStateContentObjIndexByLink(link) : this._getStateContentObjIndexByTitle(title),
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

  _getStateContentObjIndexByLink(link) {
    return this.state.contents.findIndex(cnt => cnt.contentLink === link);
  }

  _getStateContentObjIndexByTitle(title) {
    return this.state.contents.findIndex(cnt => cnt.title === title);
  }

  _getStateContentObjIndexById(id) {
    return this.state.contents.findIndex(cnt => cnt.id == id); // eslint-disable-line eqeqeq
  }

  render() {
    let {config} = this.props;
    return (<div>
      {config.currentStructure.data.map(period => this._renderPeriod(period))}
    </div>);
  }

  //
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