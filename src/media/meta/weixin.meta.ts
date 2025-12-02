/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { platforms } from "~media/platform";
import { getDocument } from "~utils/html";

const Api = {
    HomePage: platforms.article.weixin.homepage,
    MediaInfo: platforms.article.weixin.mediaInfoUrl,
};

const getMatchData = (match) => {
    return match ? match[1] : '';
}

const parserUsrInfo = (script) => {
    const match = script.match(/window\.wx\.commonData\s*=\s*\{([\s\S]*?)\};/);

    console.log('match', match);
    if (!match) {
        throw new Error('获取登录信息失败');
    }

    const tokenMatch = match[1].match(/t:\s*["'](\d+)["']/);
    const aliasMatch = match[1].match(/alias:\s*["']([^"']+)["']/);
    const usernameMatch = match[1].match(/user_name:\s*["']([^"']+)["']/);
    const nickenameMatch = match[1].match(/nick_name:\s*["']([^"']+)["']/);
    const ticketMatch = match[1].match(/ticket:\s*["']([^"']+)["']/);
    const avatarMatch = match[1].match(/head_img:\s*["']([^"']+)["']/);

    if (!tokenMatch) {
        throw new Error('暂无登录信息');
    }

    const userInfo = {
        userId: getMatchData(aliasMatch),
        username: getMatchData(usernameMatch),
        name: getMatchData(nickenameMatch),
        token: getMatchData(tokenMatch),
        ticket: getMatchData(ticketMatch),
        avatarUrl: getMatchData(avatarMatch),
    };
    console.log('userInfo', userInfo);
    return userInfo;
}

export const getWeixinMetaInfo = (html) => {
    const doc = getDocument(html);
    const scripts = doc.querySelectorAll('script');
    const script = scripts[0].text;
    const code = script.substring(script.indexOf('window.wx.commonData'));
    console.debug('code', code);

    const userInfo = parserUsrInfo(code);
    return userInfo;
}

const getMetaInfo = (body) => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length > 0) {
            const activeTab = tabs[0]; // 获取首个（唯一）激活标签页的ID
            console.log("Active Tab:", activeTab);
        // });
        
        // chrome.windows.getCurrent({ populate: true }, function (window) {
        //     if (window.tabs.length > 0) {
        //         const activeTab = window.tabs.find(tab => tab.active);
        //         console.log('activeTab', activeTab);
                if (activeTab) {
                    chrome.tabs.sendMessage(activeTab.id, {
                        type: 'request',
                        action: 'getWeixinMetaInfo',
                        data: {
                            html: body
                        }
                    }, (data) => {
                        console.log('data', data);
                        resolve(data);
                    })
                } else {
                    reject('获取失败')
                }
            } else {
                reject('获取失败');
            }
        });
    });
}

const getMediaInfo = async () => {
    const response = await fetch(Api.MediaInfo, {
        method: 'GET',
    });
    if (response.ok) {
        const body = await response.text();
        console.log('body', body);

        const userInfo = await getMetaInfo(body);
        console.log('userInfo', userInfo);
        return userInfo;
    }
    return null;
}

export const weixinMetaInfo = {
    getMediaInfo,
}