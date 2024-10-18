chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapeImages
    });
  });
  
  function scrapeImages() {
    const images = document.querySelectorAll('img');
    const imageUrls = Array.from(images).map(img => img.src);
  
    imageUrls.forEach(url => {
      chrome.runtime.sendMessage({ action: 'download', url: url });
    });
  }