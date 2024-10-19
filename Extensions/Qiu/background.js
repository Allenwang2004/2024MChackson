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
        
        if (imageUrl.startsWith("data:image/")) {
            // 圖片是 Base64 格式，直接傳送 Base64 數據
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: sendBase64Image,
                args: [imageUrl]
            });
        } else {
            // 圖片是 HTTP URL，直接傳送 URL
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: sendImageUrl,
                args: [imageUrl]
            });
        }
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

// 傳送 HTTP 圖片 URL 的函數
function sendImageUrl(imageUrl) {
    fetch('http://localhost:4000/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: 'Image Scraping Request',
            url: imageUrl,
            type: 'http'  // 指明是 HTTP URL
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

// 傳送 Base64 圖片數據的函數
function sendBase64Image(base64Image) {
    fetch('http://localhost:4000/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: 'Base64 Image Request',
            data: base64Image,
            type: 'base64'  // 指明是 Base64 編碼
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Base64 image sent successfully:', data);
    })
    .catch(error => {
        console.error('Error sending base64 image:', error);
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