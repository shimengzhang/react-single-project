import React, {useEffect} from 'react';
import LongList from './components/LongList';
// 测试 2 使用
import { formatDate, jumpUrl, getMDeviceId } from './assets/js/utils'
import './assets/scss/longlist-demo.css'

/** 测试 1 开始*/
// 列表行内容模板
const Row1 = (item)=>(
  <div className='athm-card' style={{height:204,lineHeight:'104px',textAlign:'center',color:'red', width:'100%',boxSizing:'border-box',border:'solid red 1px'}} >
    {item}
  </div>
)
const dataList = []
// 加载数据
function getData1(){
  return new Promise((resolve, reject)=>{
    setTimeout(() => {
      for(let i=0;i<10;i++){
        dataList.push(dataList.length)
      }
      resolve(dataList.slice(-10))
    }, 200);
  })
}
/** 测试 1 结束*/

/** 测试 2 开始*/
//列表行内容模板
const Row2 = (item)=>{
  const imgs = item.i.split('|')
    return imgs.length >= 3? (
      <div className='athm-card'>
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
      <div className='athm-card'>
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
}

const uid = getMDeviceId()
const params = {uid, sign: 'ex_d5500b6f', c: 'othercars', n: 10}
// 加载数据
const getData2 = ()=>{
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
/** 测试 2 结束*/
const LongListDemo = () => {
  // useEffect(()=>{
  //   const stickyDom = document.getElementById('sticky')
  //   window.addEventListener('scroll', ()=>{
  //     const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  //     if(scrollTop > 200){
  //       stickyDom.classList.add('fixed')
  //     }else{
  //       stickyDom.classList.remove('fixed')
  //     }
  //   })
  // }, [])
  return (
    <div>
      <div className={"header"}>header</div>
      {/* <div id="sticky" className={"sticky"}>sticky</div> */}
      {/* 
        列表最多同时展示 20 条，一次加载 10 条， getData 可一次返回任意条数据 
        height 指 LongList 组件在初始视窗中的占比， 默认 100vh，主要为了控制 Running 组件的位置
      */}
      {/* <LongList Row={Row} getData={getData} height={'100vh'}/> */}
      {/* <LongList Row={Row1} getData={getData1} height={'60vh'}/> */}
      <LongList Row={Row2} getData={getData2} height={'60vh'}/>
    </div>
    
  );
};

export default LongListDemo;