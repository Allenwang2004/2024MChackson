chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "openImageInNewTab",
        title: "傳送圖片 URL",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "analyzePage",
        title: "分析網頁",
        contexts: ["page"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // 傳送圖片 URL
    if (info.menuItemId === "openImageInNewTab" && info.srcUrl) {
        const imageUrl = info.srcUrl;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: sendImageUrl,
            args: [imageUrl]
        });
    }

    // 傳送網頁 URL 進行分析
    if (info.menuItemId === "analyzePage" && tab) {
        const pageUrl = tab.url;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: sendPageUrl,
            args: [pageUrl]
        });
    }
});

// 傳送圖片 URL 的函數
function sendImageUrl(imageUrl) {
    fetch('http://localhost:4000/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: 'Image Scraping Request',
            url: imageUrl,
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Image URL sent successfully:', data);
        })
        .catch(error => {
            console.error('Error sending image URL:', error);
        });
}

// 傳送網頁 URL 的函數
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