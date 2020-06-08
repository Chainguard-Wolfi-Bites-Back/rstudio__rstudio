/*
 * completion-popup.tsx
 *
 * Copyright (C) 2020 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import { EditorView } from 'prosemirror-view';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

import zenscroll from 'zenscroll';

import { applyStyles } from '../../api/css';
import { CompletionHandler, kCompletionDefaultItemHeight, kCompletionDefaultMaxVisible, kCompletionDefaultWidth } from '../../api/completion';
import { Popup } from '../../api/widgets/popup';

import './completion-popup.css';

const kNoResultsHeight = 22;

export interface CompletionListProps {
  handler: CompletionHandler;
  pos: number;
  completions: any[];
  selectedIndex: number;
  noResults: string;
  onHover: (index: number) => void;
  onClick: (index: number) => void;
}

export function createCompletionPopup() : HTMLElement {
  const popup = window.document.createElement('div');
  popup.style.position = 'absolute';
  popup.style.zIndex = '1000';
  return popup;
}

export function renderCompletionPopup(view: EditorView, props: CompletionListProps, popup: HTMLElement) {

   // position popup
   const size = completionPopupSize(props);
   const positionStyles = completionPopupPositionStyles(view, props.pos, size.width, size.height);
   applyStyles(popup, [], positionStyles);
   
   // render popup
   ReactDOM.render(<CompletionPopup {...props} />, popup);
}

export function destroyCompletionPopup(popup: HTMLElement) {
  ReactDOM.unmountComponentAtNode(popup);
  popup.remove();
}

const CompletionPopup: React.FC<CompletionListProps> = props => {
  return (
    <Popup classes={['pm-completion-popup']}>
      <CompletionList {...props}/> 
    </Popup>
  );
};

const CompletionList: React.FC<CompletionListProps> = props => {

  const size = completionPopupSize(props);
  const itemHeight = props.handler.view.height || kCompletionDefaultItemHeight;

  // keep selected index in view
  const containerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const containerEl = containerRef.current;
    if (containerEl) {
      const rows = containerEl.getElementsByClassName('pm-completion-item-row');
      const scrollToRow = rows.item(props.selectedIndex);
      if (scrollToRow) {
        const scroller = zenscroll.createScroller(containerEl);
        scroller.intoView(scrollToRow as HTMLElement);
      }
    }
  }, [props.selectedIndex]);

  // completion source based on orientation
  const completions = props.handler.view.horizontal ? horizontalCompletions : verticalCompletions;

  return (
    <div ref={containerRef} className={'pm-completion-list'} style={{ width: size.width + 'px', height: size.height + 'px'}}>
      <table>
      {completionsHeader(props.handler)}
      <tbody>
        {completions(props, itemHeight)}
        {props.completions.length === 0 ? completionsNoResults(props) : null}
      </tbody>
      </table>
    </div>
  );
};

function completionsHeader(handler: CompletionHandler) {
  if (handler.view.header) {
    const header =  React.createElement( handler.view.header.component);
    return (
      <thead>
        <th style={ {lineHeight: handler.view.header.height + 'px' }} >
          {header}
        </th>
      </thead>
    );
  } else {
    return null;
  }
}

function verticalCompletions(props: CompletionListProps, itemHeight: number) {

  // row event handler
  const rowEventHandler = (index: number, handler: (index: number) => void) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      handler(index);
    };
  };

  return (<> {props.completions.map((completion, index) => {
    const { key, cell } = completionItemCell(props, completion, index);
    return (
      <tr 
        key={key} 
        style={ {lineHeight: itemHeight + 'px' }} 
        onClick={rowEventHandler(index, props.onClick)}
        onMouseMove={rowEventHandler(index,props.onHover)}
       >
        {cell}
      </tr>
    );
  })}</>);
}

function horizontalCompletions(props: CompletionListProps, itemHeight: number) {
  return (
    <tr style={ {lineHeight: itemHeight + 'px' } }>
       {props.completions.map((completion, index) => {
          const { cell } = completionItemCell(props, completion, index);
          return cell;
       })}
    </tr>
  );
}

function completionItemCell(props: CompletionListProps, completion: any, index: number) {
  // need to provide key for both wrapper and item
  // https://stackoverflow.com/questions/28329382/understanding-unique-keys-for-array-children-in-react-js#answer-28329550
  const key = props.handler.view.key(completion);
  const item = React.createElement( props.handler.view.component, { ...completion, key });
  const className = 'pm-completion-item' + (index === props.selectedIndex ? ' pm-selected-list-item' : '');
  const cell = <td key={key} className={className}>{item}</td>;
  return { key, cell };
}

function completionsNoResults(props: CompletionListProps) {
  return (
    <tr 
      className={'pm-completion-no-results pm-placeholder-text-color'}
      style={ {lineHeight: kNoResultsHeight + 'px' }} 
    >
      <td>
        {props.noResults}
      </td>
    </tr>
  );
}


function completionPopupSize(props: CompletionListProps) {

  // kicker for list margins/border/etc
  const kCompletionsChrome = 8;

  // get view props (apply defaults)
  let { height: itemHeight = kCompletionDefaultItemHeight } = props.handler.view;
  const { maxVisible = kCompletionDefaultMaxVisible, width: width = kCompletionDefaultWidth } = props.handler.view;

  // add 2px for the border to item heights
  const kBorderPad = 2;
  itemHeight += kBorderPad;

  // compute header height
  const headerHeight = props.handler.view.header 
     ? props.handler.view.header.height + kBorderPad 
     : 0;

  // complete based on horizontal vs. vertical
  if (props.handler.view.horizontal) {

    return {
      width: (width+2) * props.completions.length,
      height: headerHeight + itemHeight + kCompletionsChrome
    };

  } else {

    // compute height (subject it to a minimum require to display 'no results')
    const height = headerHeight + kCompletionsChrome +
                   Math.max((itemHeight * Math.min(maxVisible, props.completions.length)), kNoResultsHeight);

    // return 
    return { width, height };
  }

}

function completionPopupPositionStyles(view: EditorView, pos: number, width: number, height: number) {

  // some constants
  const kMinimumPaddingToEdge = 5;
  const kCompletionsVerticalPadding = 8;

  // default position
  const selectionCoords = view.coordsAtPos(pos);
 
  let top = selectionCoords.bottom + kCompletionsVerticalPadding;
  let left = selectionCoords.left;

  // see if we need to be above
  if ((top + height + kMinimumPaddingToEdge) >= window.innerHeight) {
    top = selectionCoords.top - height - kCompletionsVerticalPadding;
  }

  // see if we need to be to the left (use cursor as pos in this case)
  if ((left + width + kMinimumPaddingToEdge) >= window.innerWidth) {
    const cursorCoords = view.coordsAtPos(view.state.selection.head);
    left = cursorCoords.right - width;
  }

  return {
    left: left + 'px',
    top: top + 'px',
  };
}