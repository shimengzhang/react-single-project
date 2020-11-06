import React from 'react';
import './style.scss';

function Empty(props) {
  const { reload } = props;
  return (
    <div className="emptyContainer">
      <p className="pic"></p>
      <p className="notice">暂无数据</p>
      <p className="tips">出门在外，很快就回来…</p>
      <button onClick={reload}>点击刷新</button>
    </div>
  );
}

export default Empty;
