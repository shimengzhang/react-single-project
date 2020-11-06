const fs = require('fs');
const glob = require('glob');

// 替换 index.hmtl 文件中的 /static/ 为 ./static
fs.readFile('./build/index.html', 'utf-8', (error, data)=>{
  if (error) {
    console.log(error);
    return false;
  }
  const regStatic = /\/static\//g;
  const htmlContent = data.toString().replace(regStatic, './static/')

  fs.writeFile('./build/index.html', htmlContent, 'utf-8', (error)=>{
    if (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      return false;
    }
  })
})

// 替换 /static/css 中的 css 文件中的 /static/ 为 ../
glob.sync('./build/static/css/*.css').forEach((filepath)=>{
  fs.readFile(filepath, 'utf-8', (error, data)=>{
    if (error) {
      console.log(error);
      return false;
    }
    const regStatic = /\/static\//g;
    const cssContent = data.toString().replace(regStatic, '../')
  
    fs.writeFile(filepath, cssContent, 'utf-8', (error)=>{
      if (error) {
        console.log(error);
        return false;
      }
    })
  })
})
