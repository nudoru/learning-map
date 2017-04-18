import React from 'react';
import Lorem from '../../../../shared/utils/Lorem';

import PageModule from '../rh-components/rh-PageModule';
import Breadcrumbs from '../rh-components/rh-Breadcrumbs';
import CardGroup from '../rh-components/rh-CardGroup';
import CardIcon from '../rh-components/rh-CardIcon';
import Card from '../rh-components/rh-Card';
import Table from '../rh-components/rh-DataTable';
import UserSummary from '../rh-components/rh-UserSummary';
import Tabs from '../rh-components/rh-Tabs';
import Pagination from '../rh-components/rh-Pagination';
import ButtonGroup from '../rh-components/rh-ButtonGroup';

class HomeView extends React.Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
  }

  render() {

    let tabledata = {
          headers: [
            {content: 'Col 1', sorted: 0, className: ''},
            {content: 'Col 2', sorted: 0, className: ''}
          ],
          data   : [
            [
              {content: 'Row 1, cell 1', link: '', newWindow: true},
              {content: 'Row 1, cell 2', link: '', newWindow: true}
            ],
            [
              {content: 'Row 2, cell 1', link: '', newWindow: true},
              {content: 'Row 2, cell 2', link: '', newWindow: true}
            ]
          ]
        },
        tableJson = [
          {
            "name"    : "Strickland Zimmerman",
            "balance" : "$1,522.36",
            "age"     : 23,
            "eyeColor": "brown",
            "gender"  : "male",
            "company" : "SECURIA"
          },
          {
            "name"    : "Hughes Obrien",
            "balance" : "$3,967.97",
            "age"     : 22,
            "eyeColor": "blue",
            "gender"  : "male",
            "company" : "GEEKY"
          },
          {
            "name"    : "Ortiz Burris",
            "balance" : "$3,703.80",
            "age"     : 29,
            "eyeColor": "green",
            "gender"  : "male",
            "company" : "PYRAMI"
          },
          {
            "name"    : "Deanna Peterson",
            "balance" : "$1,891.08",
            "age"     : 25,
            "eyeColor": "blue",
            "gender"  : "female",
            "company" : "GEEKETRON"
          },
          {
            "name"    : "Mayra Estrada",
            "balance" : "$1,910.12",
            "age"     : 34,
            "eyeColor": "green",
            "gender"  : "female",
            "company" : "QUILK"
          },
          {
            "name"    : "Villarreal Mooney",
            "balance" : "$2,183.56",
            "age"     : 28,
            "eyeColor": "blue",
            "gender"  : "male",
            "company" : "FIBRODYNE"
          }
        ];


    return (<div>
      <div className="page-container">
        <Breadcrumbs crumbs={[{label: 'Home', route: '/'}, {
          label: 'Subpage',
          route: '/one'
        }, {label: 'This page'}]}/>

        <div className="grid-row">
          <div className="page-container-column-left">
            <h1>The Portal</h1>
            <h2>{Lorem.text(2, 5)}</h2>
            <p>{Lorem.paragraph(5, 10)}</p>
            <ButtonGroup nav={[
              {label:'Button 1', route:'/', active:true},
              {label:'Button 2', route:'/one', active:false},
              {label:'Button 3', route:'/two', active:false}
            ]}/>
            <CardGroup orientation="horizontal-table">
              <Card title="Title" style="sea" cta="Read more" ctaRoute='/one'>
                <p>{Lorem.paragraph(1, 3)}</p>
              </Card>
              <Card title="Title" style="pipes" ctaRoute="/two">
                <p>{Lorem.paragraph(1, 3)}</p>
              </Card>
              <Card title="Title" style="bridge" ctaRoute="/two">
                <p>{Lorem.paragraph(1, 3)}</p>
              </Card>
            </CardGroup>
            <Pagination start={1} end={4} current={2} next={false} prev={false}/>
            <p>{Lorem.paragraph(5, 10)}</p>
            <Tabs nav={[
              {label:'Tab 1', route:'/', active:true},
              {label:'Tab 2', route:'/one', active:false},
              {label:'Tab 3', route:'/two', active:false}
            ]}/>
            <p>{Lorem.paragraph(5, 10)}</p>
            <CardGroup orientation="horizontal">
              <CardIcon title="Title"
                        content="Content! Content! Content! Content! "
                        icon="star" cta="Read more" ctaRoute='/one'/>
              <CardIcon title="Title" style="shaded"
                        icon="star" ctaRoute="/two">
                <p>{Lorem.paragraph(1, 3)}</p>
              </CardIcon>
              <CardIcon title="Title" style="dark" content="Content!"
                        icon="star"
                        ctaRoute="/two"/>
            </CardGroup>
          </div>
          <div className="page-container-column-right">
            <UserSummary
              profileImageURL={require('../../images/sample_headshot.jpg')}
              name='Jane Doe' summary='Content strategist'/>
            <Table data={tabledata}/>
          </div>
        </div>
      </div>
      <PageModule style="grey" title="Title" headline="Headline">
        <p>This is a module</p>
        <Table style='small' jsonData={tableJson} hover={true}/>
      </PageModule>
    </div>);
  }
}

HomeView.propTypes = {};

export default HomeView;