import {useState, useEffect, useCallback, useRef} from 'react';
import LoadRunning from './components/LoadRunning';
import Empty from './components/Empty';
import RefreshModule from './components/RefreshModule';

import { formatDate, jumpUrl, getMDeviceId } from './assets/js/utils'

const uid = getMDeviceId()

const params = {uid, sign: 'ex_d5500b6f', c: 'othercars', n: 10}

function getData(){
  return new Promise((resolve, reject)=>{
    setTimeout(() => {
      resolve(1)
    }, 100);
    // window.kzx.fetchMlist(params).then((data)=>{
    //   resolve(data)
    // })
    // 3 秒超时
    // setTimeout(() => {
    //   reject(new Error('time is out'))
    // }, 3000);
  })
}

const KuaiZX = () => {
  const listRef = useRef([])
  const [resp, setResp] = useState(null)
  const [loading, setLoading] = useState(false);
  const indexRef = useRef({
    firstIndex: 0,
    lastIndex: 0,
    scrollTop: 0
  })

  // 获取数据
  const fetchData = useCallback(async ()=>{
    let res = []
    try {
      res = await getData()
    } catch (error) {
      console.log(error)
    }
    for(var i = 0; i < 10; i++){
      listRef.current.push(listRef.current.length) 
    }
    const listLen = listRef.current.length
    const firstIndex = listLen - 20 > 0 ?listLen - 20 : 0
    const lastIndex = listLen

    handleDom(firstIndex, lastIndex)
  }, [])

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

  // 延时设置 loading 状态
  useEffect(()=>{
    let firstItem = null
    let lastItem = null

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if(entry.isIntersecting){
          const {firstIndex, lastIndex} = indexRef.current
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

            handleDom(newFirstIndex, newLastIndex)
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
    setTimeout(()=>{
      setLoading(false)
    }, 200)
    return ()=>{
      observer.disconnect()
    }
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
                  // const imgs = item.i.split('|')
                  return (
                    <div className="athm-card" style={{height:204,lineHeight:'204px',textAlign:'center',color:'red', width:'100%',boxSizing:'border-box',border:'solid red 1px'}} key={item} id={item}>
                      {item}
                    </div>
                  )
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