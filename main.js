// ==UserScript==
// @name         bilibili多倍速调节（支持剧集和视频）
// @namespace    lgldlk
// @version      0.1
// @description  bilibili多倍速调节（支持剧集和视频）
// @author       lgldlk
// @include      *://*.bilibili.com/video/*
// @include      *://*.bilibili.tv/video/*
// @include      *://*.bilibili.com/bangumi/*
// @include      *://*.bilibili.tv/bangumi/*
// @run-at       document-start
// @grant        none
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
        let context = this;
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

function setCacheRate(video, rate) {
    video.playbackRate = rate;
}

function setRateText(rate) {
    document.querySelector(".bilibili-player-video-btn-speed-name").innerText = `${rate}x`;
}
const initRateBody = function(callBack) {
    waitForNode(() => document.querySelector('div.bilibili-player-video-btn-speed > div > ul'),
        (node) => {
            var oV = document.getElementsByTagName("video")[0];
            deleteChild(node)
            for (let i of rateArr) {

                var tmpLi = document.createElement('li');
                tmpLi.classList = "bilibili-player-video-btn-speed-menu-list";
                tmpLi.innerText = `${ i}x`;

                tmpLi.addEventListener("click", function(k) {
                    return function() {
                        cacheRate = k
                        setCacheRate(oV, k)
                        setRateText(k)
                    }
                }(i));
                node.appendChild(tmpLi);
            }
            oV.addEventListener('DOMNodeRemoved', () => {
                if (cacheFlag == true) {
                    let tmp = debounce(function() {
                        console.log("initRateBody(setCacheRate);cacheFlag=false;}")
                        initRateBody(setCacheRate(oV, cacheRate));
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