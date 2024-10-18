chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'download') {
      const url = request.url;
  
      chrome.downloads.download({
        url: url,
        filename: `/Users/coconut/Desktop/${url.split('/').pop()}`, // 將文件保存到桌面
        saveAs: false
      });
    }
  });