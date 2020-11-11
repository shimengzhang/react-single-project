/**
 * 将数据存入 Web Storage
 *
 * @param {string} key 作为 Storage 的 Key
 * @param {Object} value 传入的数据
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(err);
  }
}

/**
 * 从 Web Storage 获取数据
 *
 * @param {string} key 作为 Storage 的 Key
 * @returns {Object} 与 key 对应的数据
 */
export function getStorage(key, defVal) {
  try {
    const value = localStorage.getItem(key);
    if (value === null || value === '') {
      return defVal;
    }
    return JSON.parse(value);
  } catch (err) {
    console.error(err);
    return defVal;
  }
}
