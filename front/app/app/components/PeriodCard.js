import React from 'react';
import {
  contentLinkWithId, contentTitleToLink,
  isPeriodComplete
} from '../store/selectors';
import {Tag, TagHGroup} from '../rh-components/rh-Tag';
import {StatusRibbonLeft, StatusRibbonTop} from "./StatusRibbon";
import {XAPILink} from "./xAPILink";
import {XAPIToggle} from "./xAPIToggle";
import {XAPITextArea} from "./xAPITextArea";
import {Col, Grid, Row} from "../rh-components/rh-Grid";

//------------------------------------------------------------------------------
// Card showing the week information, overall completion icon, and courses
//------------------------------------------------------------------------------

export const PeriodCard = periodObj => {
  let {
        config,
        category,
        period,
        summary,
        activities,
        startDateDisplay,
        endDateDisplay,
        children,
        timePeriod
      }               = periodObj,
      periodCls       = ['period'],
      tagRow          = null;


      // Disabled
      //const activitiesLabel = activities === 1 ? 'Activity' : 'Activities';
      //const activitiesEl    = activities ? (<Tag><em>{activities}</em> {activitiesLabel}</Tag>) : null;

      const startEl         = startDateDisplay ? (
        <Tag>Begins <em>{startDateDisplay}</em></Tag>) : null;
      const endEl           = endDateDisplay ? (
        <Tag>Ends <em>{endDateDisplay}</em></Tag>) : null;
      const statusMarker = isPeriodComplete(periodObj) ?
        <StatusRibbonTop type={3}/> : <StatusRibbonTop type={0}/>;
      const summaryEl = summary ? <div className="text-summary margin-top"
                                       dangerouslySetInnerHTML={{__html: summary}}></div> : null;

  // Disabled pending new styles MBP 12/6/17
  // if (timePeriod === -1) {
  //   periodCls.push('period-past');
  // } else if (timePeriod === 0) {
  //   periodCls.push('period-current');
  // } else if (timePeriod === 1) {
  //   periodCls.push('period-future');
  // }

  // Disabled
  // if (config.setup.interface.showDateOnPeriod) {
  //   tagRow = <TagHGroup>{startEl}{endEl}</TagHGroup>;
  // }

  if(isPeriodComplete(periodObj)) {
    periodCls.push('period-complete');
  } else {
    periodCls.push('period-incomplete');
  }

  return (
    <div className="content-region">
      <div className="page-container">
        <section className={periodCls.join(' ')} id={'period' + period}>
          <div className='period-status'>
          {statusMarker}
          </div>
          <header className='period-header'>
            <Row className='period-title'
                 style={{justifyContent: 'flex-start', alignItems: 'center'}}>
              <Col style={{flex: 1}}>
                <h1>{category}</h1>
                {summaryEl}
              </Col>
            </Row>
          </header>
          <div className='period-content'>
            {children}
          </div>
        </section>
      </div>
    </div>);
};

//------------------------------------------------------------------------------
// Topic area on the card
//------------------------------------------------------------------------------

export const PeriodTopicCard = ({title, summary, children}) => {
  const titleEl = title ? <h1>{title}</h1> : null;
  const summaryEl = summary ? <div className="text-summary"
                                   dangerouslySetInnerHTML={{__html: summary}}></div> : null

  return (<div className="period-topic">
    {titleEl}
    {summaryEl}
    <Grid>
      {children}
    </Grid>
  </div>);
};

//------------------------------------------------------------------------------
// Row in the content table
//------------------------------------------------------------------------------

export const ContentRow = props => {
  let rowCls = ['learning-map-row'];

  if(props.status === 3) {
    rowCls.push('learning-map-row-complete')
  } else {
    rowCls.push('learning-map-row-incomplete')
  }

  return <Row className={rowCls.join(' ')}>
    <RibbonCell {...props} />
    <NameCell {...props} />
    <DescriptionCell {...props}/>
    <StatusCell {...props} />
  </Row>;
};

const RibbonCell = ({status}) => <Col className="learning-map-col details-ribbon">
  <StatusRibbonLeft className='details-ribbon-left' type={status}/>
  <StatusRibbonTop className='details-ribbon-top' type={status}/>
</Col>;

const NameCell = ({modType, modIcon, onLinkClick, contentObj}) => {
  let nameElement;

  const requiredMark = contentObj.isRequired ?  <i className="details-course-name-required fa fa-asterisk"/> : null;

  const tagModType  = modType ?
    <Tag><i className={'fa fa-' + modIcon}/>{modType}</Tag> : null;
  const tagDuration = contentObj.duration ?
    <Tag><i className='fa fa-clock-o'/>{contentObj.duration}</Tag> : null;

  const newOrUpdated = <span
    className="details-course-name-newOrUpdated">{contentObj.isNew ? ' (New) ' : (contentObj.isUpdated ? ' (Updated) ' : null)}</span>;

  if (contentObj.contentLink) {
    // The content id is appended to the link to generate the id so that it's unique.
    // The same link could be used for more than one content item
    nameElement = <XAPILink
      href={contentObj.contentLink}
      id={contentLinkWithId(contentObj.contentLink, contentObj.id)}
      onClick={onLinkClick}>
      {contentObj.title}
    </XAPILink>
  } else {
    nameElement = <span
      dangerouslySetInnerHTML={{__html: contentObj.title}}></span>;
  }

  return <Col className="learning-map-col details-course-name">
    <Row>
      <Col className='details-course-name-mark'>{requiredMark}</Col>
      <Col className='details-course-name-label'>{nameElement}{newOrUpdated}</Col>
    </Row>
    <Row>
      <Col>
        <TagHGroup>{tagModType}{tagDuration}</TagHGroup>
      </Col>
    </Row>
  </Col>;
};

const StatusCell = ({onCompletedClick, contentObj, status}) => {
  let statusMarker, toggleId;

  if (status === 3) {
    statusMarker = <div className='status-group'><span className='status-label'>Completed</span></div>;
  } else {
    if (contentObj.requireConfirm) {
      if (!contentObj.contentLink) {
        // Use the "slugified" title for the link
        toggleId = contentTitleToLink(contentObj.title, contentObj.id);
      } else {
        // Make it unique
        toggleId = contentLinkWithId(contentObj.contentLink, contentObj.id);
      }
      statusMarker = (<div>
        <XAPIToggle
          id={toggleId}
          title={contentObj.title}
          disabled={contentObj.isComplete}
          complete={contentObj.isComplete}
          onClick={onCompletedClick}
        />
      </div>);
    } else if (contentObj.lmsID) {
      if(status === 1) {
        statusMarker = <div className='status-group'><span className='status-label'>In progress</span></div>;
      } else {
        statusMarker = <div className='status-group'><span className='status-label'>Not enrolled</span></div>;
      }
    } else if (contentObj.hasOwnProperty('allegoID')) {
      statusMarker = <div className='status-group'><span className='status-label'>Complete activity on Allego</span></div>;
    }
  }

  return <Col className="learning-map-col details-completion">
    <div className='details-completion-marker'>
    {statusMarker}
    </div>
  </Col>;
};

const DescriptionCell = ({contentObj}) => {
  let xapiInteraction = null;

  if (contentObj.reflection) {
    let refId;
    if (!contentObj.contentLink) {
      // Use the "slugified" title for the link
      refId = contentTitleToLink(contentObj.title, contentObj.id);
    } else {
      // Make it unique
      refId = contentLinkWithId(contentObj.contentLink, contentObj.id);
    }

    //previousResponse={}
    xapiInteraction =
      <XAPITextArea prompt={contentObj.reflectionPrompt} disabled={false}
                    id={refId} onSave={onXapiInteractionComplete}/>;
  }

  //
  return <Col className="learning-map-col details-course-description">
    <p dangerouslySetInnerHTML={{__html: contentObj.summary}}></p>
    {xapiInteraction}
  </Col>;
};

const onXapiInteractionComplete = ({id, response}) => console.log('xAPI interaction completed', id, response);
