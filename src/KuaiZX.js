import {useState, useEffect, useCallback} from 'react';
import LoadRunning from './components/LoadRunning';
import Empty from './components/Empty';
import RefreshModule from './components/RefreshModule';

import { formatDate, jumpUrl, getMUserInfo } from './assets/js/utils'

const uid = getMUserInfo().uid

const params = {uid, sign: 'ex_d5500b6f', c: 'car', n: 10}

async function getData(){
  return await window.kzx.fetchMlist(params)
}

const KuaiZX = () => {
  const [resp, setResp] = useState(null)
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async ()=>{
    console.log('fetchData')
    const res = await getData()
    setResp((prevResp)=>{
      if(!prevResp) 
        return [...res]
      else 
        return [...prevResp, ...res]
    })
  }, [])

  const reload = useCallback(async ()=>{
    try {
      setLoading(true)
      await fetchData()
    } catch (error) {
      console.log('catch loading false')
      setLoading(false)
    }
  }, [fetchData])

  useEffect(()=>{
    setTimeout(()=>{
      setLoading(false)
    }, 200)
    console.log(document.getElementsByClassName('athm-card').length)
  }, [resp])

  useEffect(()=>{
    if(window.kzx && typeof window.kzx.fetchMlist === 'function'){
      fetchData()
    }else{
      setResp([])
    }
  }, [fetchData])

  return (
    <div>
      {
        !resp ? <LoadRunning/> : (
          resp.length === 0 ? <Empty reload={reload}/>:(
            <RefreshModule
            loading={loading}
            onRefresh={reload}
            noMore={false}
            indicatorDeactivate={'加载中…'}>
              {
                resp.map((item, index)=>{
                  const imgs = item.i.split('|')
                  return imgs.length >= 3? (
                    <div className="athm-card" key={index}>
                      <a className="athm-card-album43" onClick={()=>{jumpUrl(item.u)}}>
                        <div className="athm-card-album43__caption">{item.t}</div>
                        <div className="athm-card-album43__album">
                          <div className="athm-card-album43__assist"><img className="lazyload" data-src={imgs[0]} alt="" /></div>
                          <div className="athm-card-album43__assist"><img className="lazyload" data-src={imgs[1]} alt="" /></div>
                          <div className="athm-card-album43__assist"><img className="lazyload" data-src={imgs[2]} alt=""/></div>
                        </div>
                        <div className="athm-card-unit-information">
                        <div className="athm-card-unit-information__item athm-card-unit-information__item--right">{formatDate(new Date(parseInt(item.showtime)), "M-d")}</div>
                          <div className="athm-card-unit-information__assist">
                            <span className="athm-card-unit-information__item">{item.cmt_num}评论</span><i className="athm-card-unit-information__division">/</i><span className="athm-card-unit-information__item">{item.f}</span>
                          </div>
                        </div>
                      </a>
                    </div>
                  ) : (imgs.length >= 1?(
                    <div className="athm-card" key={index}>
                      <a className="athm-card-thumb43 athm-card-thumb43__threerows" onClick={()=>{jumpUrl(item.u)}}>
                        <div className="athm-card-thumb43__assist">
                          <img className="lazyload" data-src={imgs[0]} alt="" />
                        </div>
                        <div className="athm-card-thumb43__caption">{item.t}</div>
                        <div className="athm-card-unit-information">
                          <div className="athm-card-unit-information__item athm-card-unit-information__item--right">{formatDate(new Date(parseInt(item.showtime)), "M-d")}</div>
                          <div className="athm-card-unit-information__assist">
                            <span className="athm-card-unit-information__item">{item.cmt_num}评论</span><i className="athm-card-unit-information__division">/</i><span className="athm-card-unit-information__item">{item.f}</span>
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