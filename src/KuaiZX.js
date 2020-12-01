import {useState, useEffect, useCallback, useRef} from 'react';
import LoadRunning from './components/LoadRunning';
import Empty from './components/Empty';
import RefreshModule from './components/RefreshModule';

import { formatDate, jumpUrl, getMDeviceId } from './assets/js/utils'

const uid = getMDeviceId()

const params = {uid, sign: 'ex_d5500b6f', c: 'othercars', n: 10}

function getData(){
  return new Promise((resolve, reject)=>{
    window.kzx.fetchMlist(params).then((data)=>{
      resolve(data)
    })
    // 3 秒超时
    setTimeout(() => {
      reject(new Error('time is out'))
    }, 3000);
  })
}

function isElView(list) {
  if(!list && list.length){
    return false
  }
  var top = list[0].getBoundingClientRect().top; // 元素顶端到可见区域顶端的距离
  var bottom = list[list.length - 1].getBoundingClientRect().bottom; // 元素底部端到可见区域顶端的距离
  var se = document.documentElement.clientHeight; // 浏览器可见区域高度。
  if (top <= 0 && bottom >= se) {
    return true;
  }
  return false;
}

const KuaiZX = () => {
  const listRef = useRef([])
  const [resp, setResp] = useState(null)
  const [loading, setLoading] = useState(false);
  const indexRef = useRef({
    firstIndex: 0,
    lastIndex: 0,
  })

  // 获取数据
  const fetchData = useCallback(async ()=>{
    let res = []
    try {
      res = await getData()
      // console.log(res.map((item)=>item.t))
    } catch (error) {
      console.log(error)
    }
    if(res)
    listRef.current = [...listRef.current, ...res]

    const listLen = listRef.current.length
    const firstIndex = listLen - 20 > 0 ?listLen - 20 : 0
    const lastIndex = listLen

    handleDom(firstIndex, lastIndex)
  }, [])

  const handleDom = useCallback((firstIndex, lastIndex)=>{
    const container = document.getElementById('container')
    const loadingDom = document.getElementsByClassName('list-load-bootom')[0]
    const listLen = listRef.current.length
    // 设置当前列表首尾索引
    indexRef.current = {
      firstIndex,
      lastIndex,
    }
    // 设置容器 padding-top
    container.style.paddingTop = `${firstIndex * 204}px`
    // 设置加载中 DOM 的 margin-top
    if(loadingDom){
      loadingDom.style.marginTop = `${(listLen - lastIndex) * 204}px`
    }
    // 渲染新 resp
    setResp(listRef.current.slice(firstIndex, lastIndex))
  },[])

  // 加载更多
  const reload = useCallback(async ()=>{
    try {
      setLoading(true)
      await fetchData()
    } catch (error) {
      console.log('catch loading false')
      setLoading(false)
    }
  }, [fetchData])

  // 无数据时，点击刷新
  const refresh = useCallback(()=>{
    setResp(null)
    if(window.kzx && typeof window.kzx.fetchMlist === 'function'){
      fetchData()
    }else{
      setResp([])
    }
  }, [fetchData])

  useEffect(()=>{
    let timer = null
    window.addEventListener('scroll', ()=>{
      if(timer){
        clearTimeout(timer)
        timer = null
      }
      timer = setTimeout(() => {
        const cardList = document.querySelectorAll('.athm-card')
        if(!isElView(cardList)){
          if(cardList[5]){
            document.documentElement.scrollTop = document.body.scrollTop = cardList[5].offsetTop
          }
        }
      }, 200);
    })
  }, [])

  
  // 延时设置 loading 状态
  useEffect(()=>{
    let firstItem = null
    let lastItem = null

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if(entry.isIntersecting){
          const { firstIndex } = indexRef.current
          const listLen = listRef.current.length
          if(entry.target.id === firstItem.id && parseInt(firstItem.id) > 0) {
            // 当第一个元素进入视窗
            const newFirstIndex = firstIndex - 10 > 0 ? firstIndex - 10 : 0;
            const newLastIndex = newFirstIndex + 20 >= listLen ? listLen : newFirstIndex + 20;

            handleDom(newFirstIndex, newLastIndex)
          }else if (entry.target.id === lastItem.id && parseInt(lastItem.id) < listRef.current.length - 1){
            // 当展示的最后一个元素，而非真正的最后一个元素进入视窗
            const newFirstIndex = firstIndex + 10;
            const newLastIndex = newFirstIndex + 20 >= listLen ? listLen : newFirstIndex + 20;
            if(newFirstIndex < newLastIndex){
              handleDom(newFirstIndex, newLastIndex)
            }
          }
        }
      });
    });

    const cardList = document.querySelectorAll('.athm-card');
    if(cardList.length > 0){
      firstItem = cardList[0]
      lastItem = cardList[cardList.length - 1]
      observer.observe(firstItem)
      observer.observe(lastItem)
    }
    setLoading(false)
  }, [resp])

  // 页面初始加载数据
  useEffect(()=>{
    refresh()
  }, [refresh])

  return (
    <div id="container">
      {
        !resp ? <LoadRunning/> : (
          resp.length === 0 ? <Empty reload={refresh}/>:(
            <RefreshModule
            loading={loading}
            onRefresh={reload}
            noMore={false}
            indicatorDeactivate={'加载中…'}>
              {
                resp.map((item, index)=>{
                  const imgs = item.i.split('|')
                  return imgs.length >= 3? (
                    <div className="athm-card" key={indexRef.current.firstIndex + index} id={indexRef.current.firstIndex + index}>
                      <a className="athm-card-album43" onClick={()=>{jumpUrl(item.u)}}>
                        <div className="athm-card-album43__caption">{item.t}</div>
                        <div className="athm-card-album43__album">
                          <div className="athm-card-album43__assist"><img className="lazyload" data-src={imgs[0]} alt="" /></div>
                          <div className="athm-card-album43__assist"><img className="lazyload" data-src={imgs[1]} alt="" /></div>
                          <div className="athm-card-album43__assist"><img className="lazyload" data-src={imgs[2]} alt=""/></div>
                        </div>
                        <div className="athm-card-unit-information">
                        <div className="athm-card-unit-information__item athm-card-unit-information__item--right">{formatDate(new Date(item.showtime*1000), "M-d")}</div>
                          <div className="athm-card-unit-information__assist">
                            {/* <span className="athm-card-unit-information__item">{item.cmt_num}评论</span><i className="athm-card-unit-information__division">/</i> */}
                            <span className="athm-card-unit-information__item">{item.f}</span>
                          </div>
                        </div>
                      </a>
                    </div>
                  ) : (imgs.length >= 1?(
                    <div className="athm-card" key={indexRef.current.firstIndex + index} id={indexRef.current.firstIndex + index}>
                      <a className="athm-card-thumb43 athm-card-thumb43__threerows" onClick={()=>{jumpUrl(item.u)}}>
                        <div className="athm-card-thumb43__assist">
                          <img className="lazyload" data-src={imgs[0]} alt="" />
                        </div>
                        <div className="athm-card-thumb43__caption">{item.t}</div>
                        <div className="athm-card-unit-information">
                          <div className="athm-card-unit-information__item athm-card-unit-information__item--right">{formatDate(new Date(item.showtime*1000), "M-d")}</div>
                          <div className="athm-card-unit-information__assist">
                            {/* <span className="athm-card-unit-information__item">{item.cmt_num}评论</span><i className="athm-card-unit-information__division">/</i> */}
                            <span className="athm-card-unit-information__item">{item.f}</span>
                          </div>
                        </div>
                      </a>
                    </div>
                  ) : null)
                })
              }
            </RefreshModule>
          )
        )
      }
    </div>
  );
};

export default KuaiZX;