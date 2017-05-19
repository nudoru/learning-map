import React from 'react';
import { Card } from './rh-Card';
import { Row, Col } from './rh-Grid';
import { CalendarTile } from './rh-CalendarTile';

// Expects format January 1, 2017
const splitDate = (datestr) => {
  let parts = datestr.split(' ');
  return {
    month: parts[0],
    day  : parts[1].substring(0, parts[1].length - 1),
    year : parts[2]
  };
};

const EventCard = ({startDate, endDate = '', name, link, city, country, room = ''}) => {
  let date = splitDate(startDate), nameLink;

  nameLink = link ? <a href={link} target="_blank">{name}</a> : <span>{name}</span>;

  return (<Card className="rh-card-narrow">
    <Row>
      <Col width="4">
        <CalendarTile month={date.month} day={date.day} year={date.year}/>
      </Col>
      <Col width="8">
        <ul className="rh-event-details">
          <li className="class">{nameLink}</li>
          <li className="city"><i className="fa fa-map-marker padding-right"/>{city + ', ' + country}</li>
          <li className="room"><i className="fa fa-building padding-right"/>{room}</li>
        </ul>
      </Col>
    </Row>
  </Card>);
};

export default EventCard;