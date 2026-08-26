// ==UserScript==
// @name         b站多倍速调节（支持视频）已支持自动变速 + 自定义倍速
// @namespace    lgldlk
// @version      1.2
// @description  b站多倍速调节（支持视频）已支持自动变速，修复切换分P失效，增加自定义倍速
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

function deleteChild(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

const key = 'lgldl_rate_key';

function setRate(video, rate) {
    video.playbackRate = rate;
    cacheRate = rate;
    localStorage.setItem(key, rate);
    setRateText(rate);
}

function setRateText(rate) {
    const rateElement = selector('.bpx-player-ctrl-playbackrate-result');
    if (rateElement) {
        rateElement.innerText = `${rate}x`;
    }
}

// 动态获取当前视频元素
function getVideoElement() {
    return selector('video') || selector('bwp-video');
}

// 初始化倍速菜单
const initRateBody = function (callBack) {
    waitForNode(
        () => selector('ul.bpx-player-ctrl-playbackrate-menu'),
        () => {
            const menuNode = selector('ul.bpx-player-ctrl-playbackrate-menu');
            if (!menuNode) return;

            // 添加标记，用于定时检查菜单是否被重置
            menuNode.setAttribute('data-lgldlk-rate', 'true');

            cacheRate = Number(localStorage.getItem(key) || 1);

            // 清空原有菜单项
            deleteChild(menuNode);

            // 添加预设倍速项
            rateArr.forEach((rate) => {
                const rateItem = document.createElement('li');
                rateItem.classList.add('bpx-player-ctrl-playbackrate-menu-item');
                rateItem.innerText = `${rate}x`;
                rateItem.style.height = '30px';
                rateItem.style.fontSize = '16px';
                rateItem.style.lineHeight = '30px';
                rateItem.addEventListener('click', () => {
                    const video = getVideoElement();
                    if (video) {
                        setRate(video, rate);
                    } else {
                        alert('未找到视频元素，请刷新页面');
                    }
                });
                menuNode.appendChild(rateItem);
            });

            // 添加自定义倍速项
            const customItem = document.createElement('li');
            customItem.classList.add('bpx-player-ctrl-playbackrate-menu-item');
            customItem.innerText = '自定义';
            customItem.style.height = '30px';
            customItem.style.fontSize = '16px';
            customItem.style.lineHeight = '30px';
            customItem.addEventListener('click', () => {
                const video = getVideoElement();
                if (!video) {
                    alert('未找到视频元素，请刷新页面');
                    return;
                }
                const input = prompt('请输入自定义倍速（0.1 ~ 16）：', video.playbackRate);
                if (input !== null) {
                    const rate = parseFloat(input);
                    if (!isNaN(rate) && rate > 0 && rate <= 16) {
                        setRate(video, rate);
                    } else {
                        alert('输入无效，请输入0到16之间的数字');
                    }
                }
            });
            menuNode.appendChild(customItem);

            // 应用缓存倍速到当前视频
            const applyCachedRate = () => {
                const video = getVideoElement();
                if (video && cacheRate !== video.playbackRate) {
                    video.playbackRate = cacheRate;
                    setRateText(cacheRate);
                }
            };
            applyCachedRate();

            callBack && callBack();
        }
    );
};

// 事件委托：捕获所有 playing 事件，自动应用缓存倍速
document.addEventListener('playing', (e) => {
    const target = e.target;
    if (target.tagName === 'VIDEO' || target.tagName === 'BWP-VIDEO') {
        const rate = Number(localStorage.getItem(key) || 1);
        if (target.playbackRate !== rate) {
            target.playbackRate = rate;
            setRateText(rate);
        }
    }
}, true);

// 页面加载及路由变化时重新初始化
document.addEventListener('DOMContentLoaded', () => initRateBody(null));
window.addEventListener('hashchange', () => initRateBody(null));
window.addEventListener('popstate', () => initRateBody(null));

// 定时检查倍速菜单是否被重置，若被重置则重新初始化
setInterval(() => {
    const menuNode = selector('ul.bpx-player-ctrl-playbackrate-menu');
    if (menuNode && !menuNode.hasAttribute('data-lgldlk-rate')) {
        initRateBody(null);
    }
}, 2000);
