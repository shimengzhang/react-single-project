import {useState, useEffect, useCallback} from 'react';
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

const KuaiZX = () => {
  const [resp, setResp] = useState(null)
  const [loading, setLoading] = useState(false);

  // 获取数据
  const fetchData = useCallback(async ()=>{
    let res = []
    try {
      res = await getData()
      // console.log(res.map((item)=>item.t))
    } catch (error) {
      console.log(error)
    }
    setResp((prevResp)=>(!prevResp ? [...res] : [...prevResp, ...res]))
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

  // 延时设置 loading 状态
  useEffect(()=>{
    setTimeout(()=>{
      setLoading(false)
    }, 200)
    // console.log(document.getElementsByClassName('athm-card').length)
  }, [resp])

  // 页面初始加载数据
  useEffect(()=>{
    refresh()
  }, [refresh])

  return (
    <div>
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
                    <div className="athm-card" key={index}>
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
                    <div className="athm-card" key={index}>
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