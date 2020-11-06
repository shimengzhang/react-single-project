import {useEffect} from 'react';
import 'lazysizes';
import KuaiZX from './KuaiZX.js';
import './assets/scss/athm.scss';

function handleLazybeforeunveil(e) {
  // 过滤 http(s)
  const el = e.target;
  const imgSrc = el.dataset.src && el.dataset.src.replace(/^https?:/, '');
  el.dataset.src = imgSrc;
}

function App(){
  useEffect(() => {
    document.addEventListener('lazybeforeunveil', handleLazybeforeunveil);
    return () => {
      document.removeEventListener('lazybeforeunveil', handleLazybeforeunveil);
    };
  }, []);

  return (
    <KuaiZX />
  )
}

export default App;
