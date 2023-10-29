/*
This file will re-map the key of image path, that match the names in translation file.
After mapping, the key order of imagePath will keep the same as its original.
*/
import nameMapOriginal from './imagePath.json';

import nameTranslation from './locales/en-US/names.json';

let res = {};
let oriToTransKey = {};

for (let key in nameTranslation) {
  let type = key.split('/')[0];
  let name = key.split('/')[1];
  let oriName = type.toLowerCase() + '/' + name;
  if (type == 'EMPTY') continue;  // empty objs will not have image
  if (type.split('_')[0] == 'SKILL') continue  // currently skills will not have image
  // if (type.split('_')[0] == 'TALENT') {
  //   // for talent, remove charactor name from type
  //   type = 'TALENT';
  //   res[type + '/' + name] = nameMapOriginal['card/' + name];
  //   continue;
  // }

  if (nameMapOriginal[oriName] != undefined) {
    // res[key] = nameMapOriginal[oriName];
    // delete nameMapOriginal[oriName];
    oriToTransKey[oriName] = key;
    continue;
  }
  // not exist, special card
  if (nameMapOriginal['card/' + name]) {
    // res[key] = nameMapOriginal['card/' + name];
    // delete nameMapOriginal['card/' + name];
    oriToTransKey['card/' + name] = key;
    continue;
  }
  throw new Error('not exist: ' + key);
}

for (let key in nameMapOriginal) {
  if (oriToTransKey[key] != undefined) {
    res[oriToTransKey[key]] = nameMapOriginal[key];
    if (key.split('/')[0] == 'charactor') {
      // if is charactor, also add avatar
      let apath = nameMapOriginal[key].replace(/cardface\/Char_(Avatar|Enemy|Monster)_/, 'avatar/');
      let aname = oriToTransKey[key].replace('CHARACTOR', 'AVATAR');
      res[aname] = apath;
    }
    delete nameMapOriginal[key];
    continue;
  }
  let type = key.split('/')[0];
  let name = key.split('/')[1];
  res[type.toUpperCase() + '/' + name] = nameMapOriginal[key];
  delete nameMapOriginal[key];
}

console.log('MAP', res, nameMapOriginal);
export default res;
