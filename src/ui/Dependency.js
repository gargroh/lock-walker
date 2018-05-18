import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import * as Colors from './styles/colors';
import * as Fonts from './styles/fonts';

const ROOT_CSS = css({
  ...Colors.primaryText,

  display: 'flex',
  flex: 1,

  '& > .arrow': {
    ...Fonts.monospace,

    backgroundColor: 'Transparent',
    border: 0,
    color: 'Red',
    fontSize: 16,
    height: 20,
    outline: 0,
    paddingLeft: '.5em',
    paddingRight: '.5em'
  },

  '& > button.arrow': {
    cursor: 'pointer'
  },

  '& > .name': {
    ...Fonts.monospace,

    alignSelf: 'flex-start',
    display: 'flex',
    flexDirection: 'row-reverse',

    '& > button': {
      backgroundColor: 'Transparent',
      border: 0,
      color: 'inherit',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 16,
      height: 20,
      outline: 0,
      padding: 0,

      '&.version:hover + .name': {
        textDecoration: 'underline'
      },

      '&:hover': {
        textDecoration: 'underline'
      }
    },
  },

  '&.filter-in > .name': {
    backgroundColor: 'Yellow'
  },

  '&.filter-out:not(.match-subtree) > .name': {
    color: '#CCC'
  },

  '&.requires': {
    '> .name > button': {
      fontSize: 12,
      fontStyle: 'italic'
    }
  },

  '& > ul': {
    listStyleType: 'none',
    margin: 0,
    padding: 0
  }
});

function match(dependency, pattern) {
  return !!~dependency.indexOf(pattern);
}

function flatten(dependencies) {
  return Object.keys(dependencies).reduce((flattened, name) => [...flattened, name, flatten(dependencies[name])], []);
}

class Dependency extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = { forceShowOthers: false };
  }

  handleArrowClick = () => {
    this.setState(state => ({ forceShowOthers: !state.forceShowOthers }));
  }

  render() {
    const { props, state } = this;
    const { filter, hideOthers, name, onClick, parent, parentDependencies } = props;
    let { dependencies } = props;
    const packageName = name.split('@').slice(0, -1).join('@');
    const packageVersion = name.split('@').slice(-1)[0];
    const matchSubtree = filter && flatten(dependencies).some(dependency => match(dependency, filter));
    const filterIn = filter && match(name, filter);
    const filterOut = filter && !match(name, filter);
    const requires = dependencies === true;

    if (requires) {
      dependencies = props.parentDependencies.find(parentDependencies => parentDependencies[name] && parentDependencies[name] !== true)[name];
    }

    if (hideOthers && filter && !filterIn && !matchSubtree) {
      return false;
    }

    return (
      <li className={ classNames(
        ROOT_CSS + '',
        filter ? {
          'filter-in': filterIn,
          'filter-out': filterOut,
          'match-subtree': matchSubtree,
        } : {},
        { requires }
      ) }>
        <nobr
          className="name"
          title={ requires ? `${ name } is loaded by an ascendant of ${ parent }` : '' }
        >
          <button
            className="version"
            onClick={ onClick && onClick.bind(null, name) }
            type="button"
          >
            @{ packageVersion }
          </button>
          <button
            className="name"
            onClick={ onClick && onClick.bind(null, packageName) }
            type="button"
          >
            { packageName }
          </button>
        </nobr>
        {
          !!Object.keys(dependencies).length &&
            <React.Fragment>
              {
                (filter && hideOthers) ?
                  <button
                    className="arrow"
                    onClick={ this.handleArrowClick }
                    title="Show hiddens"
                  >
                    <nobr>--&gt;</nobr>
                  </button>
                :
                  <nobr className="arrow">--&gt;</nobr>
              }
              <ul className="dependencies">
                {
                  Object.keys(dependencies).map(dependency => {
                    return (
                      <Dependency
                        dependencies={ dependencies[dependency] }
                        filter={ filter }
                        hideOthers={ !state.forceShowOthers && hideOthers }
                        key={ dependency }
                        name={ dependency }
                        onClick={ onClick }
                        parent={ name }
                        parentDependencies={ [...parentDependencies, dependencies] }
                      />
                    );
                  })
                }
              </ul>
            </React.Fragment>
        }
      </li>
    );
  }
}

export default Dependency;
