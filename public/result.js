window.addEventListener('DOMContentLoaded', async function () {
  const imagesFolder = 'images'; // 假設圖片資料夾的路徑

  // Fetch API to send each image in the folder
  try {
    // 從後端 API 獲取資料夾中的文件列表
    const response = await fetch(`/list-images?folder=${imagesFolder}`, { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch images list: ' + response.statusText);
    }

    const imageFiles = await response.json(); // 假設後端返回一個文件名列表

    imageFiles.forEach(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      // 對每張圖片發送 POST 請求
      const uploadResponse = await fetch('/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Network response was not ok for image: ' + file);
      }

      const result = await uploadResponse.json();
      document.getElementById('result').textContent += `Image: ${file}\nResult: ${JSON.stringify(result, null, 2)}\n\n`;
    });
  } catch (error) {
    document.getElementById('result').textContent = 'Error fetching or uploading images: ' + error.message;
  }
});

document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'index.html';
});