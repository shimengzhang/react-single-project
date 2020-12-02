import {useState, useEffect, useCallback, useRef, cloneElement} from 'react';
import LoadRunning from '../LoadRunning';
import Empty from '../Empty';
import RefreshModule from '../RefreshModule';

/**
 * list 首元素低于 container.offsetTop, 或者尾元素高于可视区底部, 返回 true; 否则返回 false
 * @param {*} list 列表元素集合
 * @param {*} t container.offsetTop
 */
function isElView(list, t) {
  if(!list || !list.length){
    return false
  }
  const top = list[0].getBoundingClientRect().top; // 元素顶端到可见区域顶端的距离
  const bottom = list[list.length - 1].getBoundingClientRect().bottom; // 元素底部端到可见区域顶端的距离
  const se = document.documentElement.clientHeight; // 浏览器可见区域高度。
  // 头尾判断距离各增大 200 ，避免触底加载数据和 scroll 监听事件的 DOM 操作冲突
  // 监听给 body.scrollTop 赋值之后，加载数据导致的 container.paddingTop 发生变化，从而导致元素的 offsetTop 和 body.scrollTop 不一致产生的白屏
  if (top <= t + 200 && bottom >= se-36 -200) {
    return true;
  }
  return false;
}

const rowClassName = 'list-row';

const LongList = (props) => {
  const [noMore, setNoMore] = useState(false)
  const {Row, getData, height='100vh'} = props
  const listRef = useRef([])
  const [resp, setResp] = useState(null)
  const [loading, setLoading] = useState(false);
  const indexRef = useRef({
    firstIndex: 0,
    lastIndex: 0,
  })
  const domRef = useRef({
    container: null,
    containerOffsetTop: 0,
    loadingDom: null,
    rowHeight: 0
  })

  // 获取数据
  const fetchData = useCallback(async ()=>{
    let res = []
    try {
      res = await getData()
    } catch (error) {
      console.log(error)
    }
    if(Array.isArray(res)){
      // 返回数据为空，则设置已加载全部
      if(res.length <= 0){
        setNoMore(true)
      }
      listRef.current = [...listRef.current, ...res]
    }

    const listLen = listRef.current.length
    const firstIndex = listLen - 20 > 0 ?listLen - 20 : 0
    const lastIndex = listLen

    updateList(firstIndex, lastIndex)
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

  // 更新渲染列表内容
  const updateList = useCallback((firstIndex, lastIndex)=>{
    if(!domRef.current.container){
      domRef.current.container = document.getElementById('container')
      domRef.current.containerOffsetTop = domRef.current.container.offsetTop
    }
    if(!domRef.current.loadingDom){
      domRef.current.loadingDom = document.getElementsByClassName('list-load-bootom')[0]
    }
    if(!domRef.current.rowHeight){
      domRef.current.rowHeight = document.querySelectorAll(`.${rowClassName}`)[0]?.offsetHeight || 0
    }
    const {container, loadingDom, rowHeight} = domRef.current
    const listLen = listRef.current.length
    // 设置当前列表首尾索引
    indexRef.current = {
      firstIndex,
      lastIndex,
    }
    // 设置容器 padding-top
    container.style.paddingTop = `${firstIndex * rowHeight}px`
    // 设置加载中 DOM 的 margin-top
    if(loadingDom){
      loadingDom.style.marginTop = `${(listLen - lastIndex) * rowHeight}px`
    }
    // 渲染新 resp
    setResp(listRef.current.slice(firstIndex, lastIndex))
  },[])

  // 防止滚动太快，内容区域脱离可视区，没有机会触发 updateList 
  useEffect(()=>{
    let timer = null
    window.addEventListener('scroll', ()=>{
      if(timer ){
        clearTimeout(timer)
        timer = null
      }
      timer = setTimeout(() => {
        const cardList = document.querySelectorAll(`.${rowClassName}`)
        // 如果可视区至少一部分为空白，则将卡片定位到第 5 个
        if(!isElView(cardList, domRef.current.containerOffsetTop)){
          if(cardList[5]){
            console.log('offsetTop', document.getElementsByClassName('list-row')[5].offsetTop)
            console.log('paddingTop', document.getElementById('container').style.paddingTop)
            document.documentElement.scrollTop = document.body.scrollTop = cardList[5].offsetTop
            console.log('scrollTop', document.body.scrollTop)
          }
        }
      }, 200);
    })
  }, [])

  // 延时设置 loading 状态
  useEffect(()=>{
    let firstItem = null
    let lastItem = null

    // 创建监听对象
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // 如果元素进入可视区
        if(entry.isIntersecting){
          const { firstIndex } = indexRef.current
          const listLen = listRef.current.length

          if(entry.target.id === firstItem.id && parseInt(firstItem.id) > 0) {
            // 当第一个元素进入视窗
            const newFirstIndex = firstIndex - 10 > 0 ? firstIndex - 10 : 0;
            const newLastIndex = newFirstIndex + 20 >= listLen ? listLen : newFirstIndex + 20;
            updateList(newFirstIndex, newLastIndex)
          }else if (entry.target.id === lastItem.id && parseInt(lastItem.id) < listRef.current.length - 1){
            // 当展示的最后一个元素，而非真正的最后一个元素进入视窗
            const newFirstIndex = firstIndex + 10;
            const newLastIndex = newFirstIndex + 20 >= listLen ? listLen : newFirstIndex + 20;
            if(newFirstIndex < newLastIndex){
              updateList(newFirstIndex, newLastIndex)
            }
          }
        }
      });
    });

    // 每当渲染列表发生改变，重新将首尾元素添加进观察列表
    const cardList = document.querySelectorAll(`.${rowClassName}`);
    if(cardList.length > 0){
      firstItem = cardList[0]
      lastItem = cardList[cardList.length - 1]
      observer.observe(firstItem)
      observer.observe(lastItem)
    }

    // 本次渲染完毕，设置 loading 为 false, 即允许重新触发加载
    setLoading(false)

    // 本次渲染卸载前，断开观察
    return ()=>{
      observer.disconnect()
    }
  }, [resp])

  // 页面初始加载数据
  useEffect(()=>{
    refresh()
  }, [refresh])

  return (
    <div id="container" style={{position:'relative', height: height}}>
      {
        !resp ? <LoadRunning/> : (
          resp.length === 0 ? <Empty reload={refresh}/>:(
            <RefreshModule
            loading={loading}
            onRefresh={reload}
            noMore={noMore}
            indicatorDeactivate={'加载中…'}>
              {
                resp.map((item, index)=>{
                  const key = indexRef.current.firstIndex + index
                  const id = key
                  return (
                    cloneElement(Row(item), {
                      className: rowClassName,
                      key,
                      id
                    })
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

export default LongList;