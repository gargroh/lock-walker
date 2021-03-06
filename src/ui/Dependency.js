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
    padding: 0
  },

  '& > button.arrow': {
    cursor: 'pointer'
  },

  '& > .circular': {
    ...Fonts.monospace,

    fontSize: 16
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
    backgroundColor: 'Yellow',
    paddingLeft: '.3em',
    paddingRight: '.3em'
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

function under(packages, name, predicate, visited = []) {
  if (~visited.indexOf(name)) {
    return false;
  }

  return Object.keys(packages[name].dependencies || {}).some(dep => {
    if (predicate(dep)) {
      return true;
    }

    return under(packages, dep, predicate, [...visited, name]);
  });
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
    const { circular, filter, hideOthers, name, onClick, packages, requires, visited = '' } = props;
    const packageName = name.split('@').slice(0, -1).join('@');
    const packageVersion = name.split('@').slice(-1)[0];
    const filterIn = filter && match(name, filter);
    const filterOut = filter && !match(name, filter);
    const matchSubtree = under(packages, name, dep => match(dep, filter));

    if (hideOthers && filter && !filterIn && !matchSubtree) {
      return false;
    }

    const dependencies = packages[name].dependencies || {};

    return (
      <li
        className={ classNames(
          ROOT_CSS + '',
          filter ? {
            'filter-in': filterIn,
            'filter-out': filterOut,
            'match-subtree': matchSubtree,
          } : {},
          { requires }
        ) }
        title={ requires ? `${ name } is a co-located package` : '' }
      >
        <nobr
          className="name"
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
                    <nobr>&nbsp;--&gt;&nbsp;</nobr>
                  </button>
                :
                  <nobr className="arrow">&nbsp;--&gt;&nbsp;</nobr>
              }
              {
                circular ?
                  <span className="circular" title="Circular dependencies">∞</span>
                : (filter && !matchSubtree && hideOthers && !state.forceShowOthers) ?
                  <span className="ellipsis">&hellip;</span>
                :
                  <ul className="dependencies">
                    {
                      Object.keys(dependencies).map(dependency =>
                        <Dependency
                          filter={ filter }
                          hideOthers={ !state.forceShowOthers && hideOthers }
                          key={ dependency }
                          name={ dependency }
                          circular={ ~visited.split('|').indexOf(dependency) }
                          onClick={ onClick }
                          packages={ packages }
                          requires={ dependencies[dependency].requires }
                          visited={ `${ visited }|${ name }` }
                        />
                      )
                    }
                  </ul>
              }
            </React.Fragment>
        }
      </li>
    );
  }
}

export default Dependency;
