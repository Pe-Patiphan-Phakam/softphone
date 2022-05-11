"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVideo = getVideo;

function getVideo(id) {
  try {
    return new Promise(function (resolve, reject) {
      var el = document.getElementById(id);

      if (!el) {
        reject('cannot get');
      }

      resolve(el);
    });
  } catch (e) {
    console.log(e);
  }
}