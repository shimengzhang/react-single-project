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
    // listRef.current = [...listRef.current, ...res]
    indexRef.current = {
      firstIndex: listRef.current.length - 20 > 0 ?listRef.current.length - 20: 0,
      lastIndex: listRef.current.length
    }
    document.getElementById('container').style.paddingTop = `${indexRef.current.firstIndex * 204}px`
    indexRef.current.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    setResp(listRef.current.slice(indexRef.current.firstIndex, indexRef.current.lastIndex))
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

  // useEffect(()=>{
  //   let timer = null
  //   window.addEventListener('scroll', ()=>{
  //     if(timer){
  //       clearTimeout(timer)
  //       timer = null
  //     }
  //     timer = setTimeout(() => {
  //       if(indexRef.current.scrollTop <= parseInt(document.getElementById('container').style.paddingTop) || indexRef.current.scrollTop >= parseInt(document.getElementById('container').style.paddingTop + 20*204) ){
  //         document.documentElement.scrollTop = document.body.scrollTop = parseInt(document.getElementById('container').style.paddingTop) + 10* 204
  //       }
  //       // else{
  //       //   document.documentElement.scrollTop = document.body.scrollTop = indexRef.current.scrollTop
  //       // }
  //     }, 200);
  //   })
  // },[])

  // 延时设置 loading 状态
  useEffect(()=>{
    let firstItem = null
    let lastItem = null

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if(entry.isIntersecting){
          
          if(entry.target.id === firstItem.id) {
            // 当第一个元素进入视窗
            if(parseInt(firstItem.id) > 0){
              const firstIndex = indexRef.current.firstIndex - 10 > 0 ? indexRef.current.firstIndex - 10 : 0;
              const lastIndex = firstIndex + 20 >= listRef.current.length ? listRef.current.length : firstIndex + 20
              indexRef.current = {
                firstIndex,
                lastIndex,
              }
              document.getElementById('container').style.paddingTop = `${indexRef.current.firstIndex * 204}px`
              // document.getElementById('container').style.paddingBottom = `${(listRef.current.length - indexRef.current.lastIndex) * 204}px`
              document.getElementsByClassName('list-load-bootom')[0].style.marginTop = `${(listRef.current.length - indexRef.current.lastIndex) * 204}px`
              indexRef.current.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
              setResp(listRef.current.slice(indexRef.current.firstIndex, indexRef.current.lastIndex))
            }
          }else if (entry.target.id === lastItem.id){
            if(parseInt(lastItem.id) < listRef.current.length - 1){
              const firstIndex = indexRef.current.firstIndex + 10;
              const lastIndex = firstIndex + 20 >= listRef.current.length ? listRef.current.length : firstIndex + 20
              indexRef.current = {
                firstIndex,
                lastIndex,
              }
              document.getElementById('container').style.paddingTop = `${indexRef.current.firstIndex * 204}px`
              // document.getElementById('container').style.paddingBottom = `${(listRef.current.length - indexRef.current.lastIndex) * 204}px`
              document.getElementsByClassName('list-load-bootom')[0].style.marginTop = `${(listRef.current.length - indexRef.current.lastIndex) * 204}px`
              indexRef.current.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
              setResp(listRef.current.slice(indexRef.current.firstIndex, indexRef.current.lastIndex))
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