// ==UserScript==
// @name         b站多倍速调节（支持视频）已支持自动变速
// @namespace    lgldlk
// @version      0.9
// @description  b站多倍速调节（支持视频）已支持自动变速🤞🤞🤞~~~
// @author       lgldlk
// @include      *://*.bilibili.com/video/*
// @include      *://*.bilibili.tv/video/*
// @include      *://*.bilibili.com/bangumi/*
// @include      *://*.bilibili.tv/bangumi/*
// @run-at       document-start
// @grant        none
// @license MIT
// ==/UserScript==
let cacheRate = 1,
  cacheFlag = true,
  rateArr = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0.1];

let selector = document.querySelector.bind(document);

function waitForNode(nodeSelector, callback) {
  if (nodeSelector()) {
    callback();
  } else {
    setTimeout(() => {
      waitForNode(nodeSelector, callback);
    }, 300);
  }
}
function debounce(func, wait) {
  let timer;
  return function () {
    let args = arguments;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}
function deleteChild(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

const key = 'lgldl_rate_key';

function setRate(video, rate) {
  video.playbackRate = rate;
  localStorage.setItem(key, rate);
  setRateText(rate);
}

function setRateText(rate) {
  const rateElement = selector('.bpx-player-ctrl-playbackrate-result');
  if (rateElement) {
    rateElement.innerText = `${rate}x`;
  }
}

const initRateBody = function (callBack) {
  waitForNode(
    () => selector('ul.bpx-player-ctrl-playbackrate-menu') && selector('.bili-header .right-entry'),
    () => {
      const menuNode = selector('ul.bpx-player-ctrl-playbackrate-menu');
      const cachedRate = Number(localStorage.getItem(key) || 1);
      const videoElement = selector('video') || selector('bwp-video');
      if (!videoElement) {
        alert('清空缓存后刷新即可使用');
        return;
      }

      deleteChild(menuNode);
      rateArr.forEach((rate) => {
        const rateItem = document.createElement('li');
        rateItem.classList.add('bpx-player-ctrl-playbackrate-menu-item');
        rateItem.innerText = `${rate}x`;
        rateItem.style.height = '30px';
        rateItem.style.fontSize = '16px';
        rateItem.style.lineHeight = '30px';
        rateItem.addEventListener('click', () => {
          setRate(videoElement, rate);
        });
        menuNode.appendChild(rateItem);
      });

      const applyCachedRate = () => {
        if (cachedRate !== videoElement.playbackRate) {
          setRate(videoElement, cachedRate);
        }
      };
      applyCachedRate();
      videoElement.addEventListener('playing', applyCachedRate);

      cacheRate = Number(localStorage.getItem(key) || 1);
      callBack && callBack();
    }
  );
};
document.addEventListener('DOMContentLoaded', () => initRateBody(null));
window.onhashchange = () => initRateBody();
