import React from 'react';
import {Grid} from "../rh-components/rh-Grid";

export const TopicCard = ({title, summary, children}) => {
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