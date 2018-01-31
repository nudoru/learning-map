import React from 'react';
import {isPeriodComplete} from '../store/selectors';
import {StatusRibbonTop} from "./StatusRibbon";
import {Col, Row} from "../rh-components/rh-Grid";

/**
 * Card showing the week information, overall completion icon, and courses
 *
 * Hierarchy: Period card -> Topic Card(s) -> Content Row(s)
 */

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
      }         = periodObj,
      periodCls = ['period'];

  // tagRow          = null;

  const statusMarker = isPeriodComplete(periodObj) ?
    <StatusRibbonTop type={3}/> : <StatusRibbonTop type={0}/>;
  const summaryEl    = summary ? <div className="text-summary margin-top"
                                      dangerouslySetInnerHTML={{__html: summary}}></div> : null;

  // Disabled since there is no requirement to display
  // const startEl         = startDateDisplay ? (<Tag>Begins <em>{startDateDisplay}</em></Tag>) : null;
  // const endEl           = endDateDisplay ? (<Tag>Ends <em>{endDateDisplay}</em></Tag>) : null;
  // if (config.setup.interface.showDateOnPeriod) {
  //   tagRow = <TagHGroup>{startEl}{endEl}</TagHGroup>;
  // }

  // Disabled pending new styles MBP 12/6/17
  // if (timePeriod === -1) {
  //   periodCls.push('period-past');
  // } else if (timePeriod === 0) {
  //   periodCls.push('period-current');
  // } else if (timePeriod === 1) {
  //   periodCls.push('period-future');
  // }

  if (isPeriodComplete(periodObj)) {
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

