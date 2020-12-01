import React from 'react';

const styleObj = {
  width: 200,
  height: 200,
  border: 'solid 1px red',
  display: 'none'
}

const TestDom = () => {
  return (
    <div style={{paddingTop:'300px'}}>
      <div id="div1" style={styleObj}>测试页面</div>
    </div>
  );
};

export default TestDom;