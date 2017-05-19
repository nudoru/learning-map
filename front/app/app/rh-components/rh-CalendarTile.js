import React from 'react';

export const CalendarTile = ({month, day, year}) => {
  return (<ul className="rh-calendarTile">
    <li className="month">{month}</li>
    <li className="day">{day}</li>
    <li className="year">{year}</li>
  </ul>);
};

export default CalendarTile;