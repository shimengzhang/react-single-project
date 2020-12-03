import React, { useRef, useEffect } from 'react';
import './index.scss';

const Index = (props) => {
  const {
    loading,
    children, onRefresh, noMore, indicatorFinish = '- 已加载全部 -',
  } = props;
  const refreshRef = useRef(null);

  const loadingRef = useRef(loading)

  loadingRef.current = loading

  useEffect(() => {
    const onRefreshHandler = () => {
      if (getOffesetTop(refreshRef.current) && !loadingRef.current) {
        onRefresh();
      }
    };

    window.addEventListener('scroll', onRefreshHandler);
    return () => {
      window.removeEventListener('scroll', onRefreshHandler);
    };
  }, [onRefresh]);

  
  return (
    <>
      {children}
      <div className="list-load-bootom" ref={refreshRef}>
        {!noMore ? (
          <div className="athm-loading">
            <i className="athm-iconpng athm-iconpng-loadingblue"></i>加载中...
          </div>
        ) : indicatorFinish}
      </div>

    </>
  );
};

export default Index;

function getOffesetTop(el) {
  const elRect = el.getBoundingClientRect();
  // console.log(elRect.top, elRect.height, document.documentElement.clientHeight)
  return (elRect.top + elRect.height - document.documentElement.clientHeight) < 100;
}
