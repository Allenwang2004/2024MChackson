window.addEventListener('DOMContentLoaded', async function () {
  const imagesFolder = 'images'; // 假設圖片資料夾的路徑

  try {
    // 從後端 API 獲取資料夾中的文件列表
    const response = await fetch(`/list-images?folder=${imagesFolder}`, { method: 'GET' });
    if (!response.ok) {
      //throw new Error('Failed to fetch images list: ' + response.statusText);
    }

    const imageFiles = await response.json(); // 假設後端返回一個文件名列表

    for (const file of imageFiles) {
      try {
        // 確保圖片路徑是正確的
        const imageUrl = `/images/${file}`;

        // 下載圖片內容
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          //throw new Error(`Failed to fetch image content for ${file}: ${imageResponse.statusText}`);
        }

        // 將圖片轉換為 Blob 格式
        const blob = await imageResponse.blob();

        const formData = new FormData();
        formData.append('file', blob, file); // 將圖片 Blob 和文件名附加到 FormData

        // 將圖片發送到後端處理
        const uploadResponse = await fetch('/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          //throw new Error('Network response was not ok for image: ' + file);
        }

        const result = await uploadResponse.json();

        // 在 DOM 中顯示圖片和 output
        const resultContainer = document.getElementById('result');
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl; // 設定圖片來源
        imgElement.alt = file; // 設定圖片 alt 文字
        imgElement.style.width = '200px'; // 設定圖片寬度或其他樣式

        const output = result.result[0].output[0]; // 獲取 output 值

        // 將圖片和 output 添加到結果容器
        resultContainer.appendChild(imgElement);
        const outputElement = document.createElement('p');
        outputElement.textContent = `Output: ${output}`;
        resultContainer.appendChild(outputElement);
      } catch (error) {
        //console.error('Error processing image:', file, error.message);
        // 在這裡你可以選擇是否要顯示錯誤訊息
        const errorElement = document.createElement('p');
        //errorElement.textContent = `Error processing image ${file}: ${error.message}`;
        document.getElementById('result').appendChild(errorElement);
      }
    }
  } catch (error) {
    document.getElementById('result').textContent = 'Error fetching images list: ' + error.message;
  }
});