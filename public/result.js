const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 打開 result.html
exec('open http://localhost:4000/result.html');

// 獲取結果元素
const resultElement = document.getElementById('result');

//do the post request for every image in the images folder
const imagesFolder = 'images';
fs.readdir(imagesFolder, (err, files) => {
  if (err) {
    console.error('Error reading images folder:', err);
    resultElement.textContent = 'Error reading images folder: ' + err.message;
    return;
  }

  files.forEach(file => {
    const filePath = path.join(imagesFolder, file);
    const formData = new FormData();
    formData.append('img', fs.createReadStream(filePath));

    fetch('http://localhost:4000/inference', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const result = JSON.stringify(data, null, 2); // 格式化結果
      resultElement.textContent += `Result for ${file}:\n${result}\n\n`;
    })
    .catch(error => {
      console.error('Error sending request:', error);
      resultElement.textContent += `Error sending request for ${file}: ${error.message}\n\n`;
    });
  });
});

document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'index.html';
});