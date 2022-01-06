// ==UserScript==
// @name         b站多倍速调节（支持剧集和视频）
// @namespace    lgldlk
// @version      0.6
// @description  b站多倍速调节（支持剧集和视频）🤞🤞🤞~~~
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
    rateArr = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0.1]

function waitForNode(nodeSelector, callback) {
    var node = nodeSelector();
    if (node) {
        callback(node);
    } else {
        setTimeout(function() { waitForNode(nodeSelector, callback); }, 100);
    }
}


function debounce(func, wait) {
    let timer;
    return function() {
        let args = arguments;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args)
        }, wait)
    }
}

function deleteChild(e) {
    var child = e.lastElementChild;
    while (child) {
        e.removeChild(child);
        child = e.lastElementChild;
    }
}

function setRate(video, rate) {
    video.playbackRate=rate;
}

function setRateText(rate) {
    (document.querySelector(".bilibili-player-video-btn-speed-name")||document.querySelector("div.squirtle-select-result.squirtle-speed-select-result")).innerText = `${rate}x`;
}


const initRateBody = function(callBack) {
    waitForNode(() => document.querySelector('div.bilibili-player-video-btn-speed > div > ul')||document.querySelector("ul.squirtle-select-list.squirtle-speed-select-list.squirtle-dialog"),
        (node) => {
             var oV = document.querySelector("video")?document.querySelector("video"):document.querySelector("bwp-video")
            if (oV == undefined) {
                alert("清空缓存后刷新即可使用")
                return;
            }
            deleteChild(node)
            for (let i of rateArr) {

                var tmpLi = document.createElement('li');
                tmpLi.classList = "bilibili-player-video-btn-speed-menu-list squirtle-select-item ";
                tmpLi.innerText = `${ i}x`;
                tmpLi.style.height = "30px"
                tmpLi.style["font-size"] = "16px"
                tmpLi.style["line-height"] = "30px"
                tmpLi.addEventListener("click", function(k) {
                    return function(e) {
                         e.stopPropagation();
                       e.preventDefault();
                        cacheRate = k
                        setRate(oV, k)
                        setRateText(k)
                    }
                }(i));
                node.appendChild(tmpLi);
            }
            oV.addEventListener('DOMNodeRemoved', () => {
                if (cacheFlag == true) {
                    let tmp = debounce(function() {
                        initRateBody(setRate(oV, cacheRate));
                        setRateText(cacheRate)
                        cacheFlag = true;
                    }, 1000)
                    tmp();
                }
                cacheFlag = false
            });
            callBack && callBack();
        });
};
window.onload = initRateBody(null);
window.onhashchange = function() {
    initRateBody(setCacheRate);
}
