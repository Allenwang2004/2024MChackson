chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "openImageInNewTab",
        title: "開啟圖片",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "analyzePage",
        title: "分析網頁",
        contexts: ["page"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openImageInNewTab" && info.srcUrl) {
        chrome.tabs.create({ url: info.srcUrl });
    }

    if (info.menuItemId === "analyzePage" && tab) {
        const pageUrl = tab.url;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: sendPageUrl,
            args: [pageUrl]
        });
    }
});

function sendPageUrl(pageUrl) {
    fetch('http://localhost:4000/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: 'Scraping Request',
            url: pageUrl,
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Scraping request sent successfully:', data);
        })
        .catch(error => {
            console.error('Error sending request:', error);
        });
}