/**
 * Listener that receives a message with a list of image
 * URL's to display from popup.
 */
chrome.runtime.onMessage
    .addListener((message,sender,sendResponse) => {
        addImagesToContainer(message)
        sendResponse("OK");
    });

/**
 * Function that used to display an UI to display a list
 * of images
 * @param {} urls - Array of image URLs
 */
function addImagesToContainer(urls) {
    if (!urls || !urls.length) {
        return;
    }
    const container = document.querySelector(".container");
    urls.forEach(url => addImageNode(container, url))
}

/**
 * Function dynamically add a DIV with image
 * @param {*} container - DOM node of a container div
 * @param {*} url - URL of image
 */
function addImageNode(container, url) {
    const div = document.createElement("div");
    div.className = "imageDiv";
    const img = document.createElement("img");
    img.src = url;
    div.appendChild(img);
    container.appendChild(div)
}


