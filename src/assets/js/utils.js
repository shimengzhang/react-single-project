import { getCookie } from '@auto/js-cookie';

/**
 * 格式化日期
 * 使用示例：formatDate(new Date(), 'yyyy-MM-dd')
 * @param {*} d 
 * @param {*} fmt 
 */
function formatDate(d, fmt){
  var o = { 
    "M+" : d.getMonth()+1,                 //月份 
    "d+" : d.getDate(),                    //日 
    "h+" : d.getHours(),                   //小时 
    "m+" : d.getMinutes(),                 //分 
    "s+" : d.getSeconds(),                 //秒 
    "q+" : Math.floor((d.getMonth()+3)/3), //季度 
    "S"  : d.getMilliseconds()             //毫秒 
  }; 
  if(/(y+)/.test(fmt)) {
    fmt=fmt.replace(RegExp.$1, (d.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  }
  for(var k in o) {
    if(new RegExp("("+ k +")").test(fmt)){
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length===1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    }
  }
  return fmt; 
}

/**
 * 判断是否在 App 内
 */
function getAppInfo() {
  const ua = navigator.userAgent;
  const co = document.cookie;
  const ur = /auto_(iphone|android)(;|%3B|\/)(\d+\.\d+\.\d+)/i;
  const cr = /.*app_key=auto_(iphone|android)(.*)app_ver=(\d+\.\d+\.\d+)/i;
  const match = ua.match(ur) || co.match(cr);

  return {
    isApp: /autohomeapp/.test(ua) || ur.test(ua) || cr.test(co),
    appKey: match && match[1],
    appVer: match && match[3],
  };
}

/**
 * 如果在 App 内，则给 url 添加协议头；如果是 M 端，则不添加
 * @param {*} url 
 * @param {*} auto 
 */
function insidebrowser(url, auto = true) {
  if (!url) { return ''; }

  // App 协议不支持 url 中带有空格
  const newUrl = url.replace(/\s/g, '');
  const scheme = 'autohome://';

  // url 也许是一个 scheme 地址
  if (newUrl.indexOf(scheme) !== -1) {
    return newUrl;
  }

  if (!getAppInfo().appKey) {
    if (!auto) { return url; }
    return newUrl.replace(/https?:/, '');
  }

  return `${scheme}insidebrowserwk?url=${encodeURIComponent(newUrl)}`;
}

/**
 * 跳转 url，如果是 App 内会自动添加协议头
 * @param {*} url 
 */
function jumpUrl(url){
  window.location.href = insidebrowser(url)
  // window.location.href = url
}

/**
 * 获取登录状态 & 用户昵称
 */
function getMUserInfo() {
  // let loggedIn = false; // 是否登录
  let uid = 0; // 用户ID

  const cookieClubUserShow = getCookie('clubUserShow');
  // const autouserid = getCookie('autouserid');
  // const cookieClubUserShow = '52100122|197|2|%e7%9a%b1%e7%9c%89_|0|0|0|/g11/M04/AB/BA/120X120_0_q87_autohomecar__wKjBzFnkZg6ABBS_AAFIXhsHM1c188.jpg|2018-07-31 19:42:33|0'
  
  // if (cookieClubUserShow || autouserid) {
  if (cookieClubUserShow) {
    const clubUserShow = cookieClubUserShow.split('|');
    // loggedIn = true;
    [uid] = clubUserShow;
  }
  return {
    // loggedIn,
    uid,
  };
}

export {
  formatDate,
  getAppInfo,
  insidebrowser,
  jumpUrl,
  getMUserInfo
}