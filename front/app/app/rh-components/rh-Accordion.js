import React from 'react';
import AnimateHeight from 'react-animate-height';
import { is } from 'ramda';

const isString = (str) => is(String, str);

/**
 * The title prop can either be a string or another components (single line of text)
 */
class Accordion extends React.Component {
  Ø;

  constructor (props) {
    super(props);
    this.state = {active: props.active};
  }

  componentDidMount () {}

  _onTitleClick () {
    console.log('Title!');
    this.setState({active: !this.state.active});
  }

  render () {
    let contentHeight = this.state.active ? 'auto' : 0,
        icon          = this.state.active ? 'chevron-down' : 'chevron-right',
        title         = isString(this.props.title) ?
          <h1>{this.props.title}</h1> : this.props.title,
        clsName       = 'rh-accordion ' + this.props.className;

    return (<section className={clsName}>
      <div className="rh-panel-header"
           onClick={this._onTitleClick.bind(this)}>
        <div className="rh-panel-header-icon"><i className={'fa fa-' + icon}/></div>
        <div className="rh-panel-header-label">
          {title}
        </div>
      </div>
      <AnimateHeight
        duration={250}
        height={contentHeight}
        contentClassName={'rh-panel-content'}>
        {this.props.children}
      </AnimateHeight>

    </section>);
  }
}

Accordion.defaultProps = {
  title    : 'Accordion Title',
  active   : false,
  className: ''
};
Accordion.propTypes    = {
  title    : React.PropTypes.object,
  active   : React.PropTypes.boolean,
  className: React.PropTypes.string
};

export default Accordion;

export const AccordionVGroup = ({children}) => <div
  className="rh-accordion-vgroup">{children}</div>;