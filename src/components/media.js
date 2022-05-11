export function getVideo(id) {
  try {
    return new Promise((resolve,reject) => {
          const  el = document.getElementById(id);
          if (!(el)) {
            reject('cannot get')
          }
          resolve(el);
        });
    
  } catch (e) {
    console.log(e)
  }
}