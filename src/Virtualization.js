import React, {useCallback, useEffect, useState} from 'react';
import {loremIpsum} from 'lorem-ipsum';
import 'react-virtualized/styles.css';
import List from 'react-virtualized/dist/commonjs/List';
import './assets/scss/list.css';
const rowCount = 10000;
const listHeight = 600;
const rowHeight = 50;
const rowWidth = 800;

const Virtualization = () => {
  const [list, setList] = useState([])
  useEffect(()=>{
    const data = Array(rowCount).fill().map((val, idx) => {
      return {
        id: idx, 
        name: 'John Doe',
        image: 'http://via.placeholder.com/40',
        text: loremIpsum({
          count: 1, 
          units: 'sentences',
          sentenceLowerBound: 4,
          sentenceUpperBound: 8 
        })
      }
    });
    setList(data)
  }, [])

  const renderRow = useCallback(({ index, key, style })=>{
    return (
      <div key={key} style={style} className="row">
        <div className="image">
          <img src={list[index].image} alt="" />
        </div>
        <div className="content">
          <div>{list[index].name}</div>
          <div>{list[index].text}</div>
        </div>
      </div>
    );
  }, [list])

  return (
      <div className="list">
        <List
          width={rowWidth}
          height={listHeight}
          rowHeight={rowHeight}
          rowRenderer={renderRow}
          rowCount={list.length} />
      </div>
  );
};

export default Virtualization;