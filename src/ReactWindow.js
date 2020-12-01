import React from 'react';
import { FixedSizeList as List } from 'react-window';
import './assets/scss/react-window-test.css';

const Row = ({ index, style }) => (
  <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
    Row {index}
  </div>
);

const ReactWindow = () => {
  return (
    <List
    className="List"
    height={500}
    itemCount={1000}
    itemSize={60}
    width={'100%'}
  >
    {Row}
  </List>
  );
};

export default ReactWindow;