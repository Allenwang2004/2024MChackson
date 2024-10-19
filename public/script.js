document.getElementById('uploadForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const fileInput = document.getElementById('fileInput');
  if (fileInput.files.length === 0) {
    alert('Please select a file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  //Fetch API
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }

    const result = await response.json();
    document.getElementById('result').textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    document.getElementById('result').textContent = 'Error uploading file: ' + error.message;
  }
});

let mediaRecorder;
let audioChunks = [];
let startTime;
let recordingTimer;

const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const audioPlayback = document.getElementById('audioPlayback');
const downloadLink = document.getElementById('downloadLink');
const uploadRecordedAudio = document.getElementById('uploadRecordedAudio');
const recordingIndicator = document.getElementById('recordingIndicator'); // 錄音指示器
const recordingTime = document.getElementById('recordingTime'); // 錄音時間顯示

// 更新錄音時間顯示的函數
function updateRecordingTime() {
  const currentTime = Date.now();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000); // 計算秒數
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  recordingTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`; // 格式化時間顯示
}

navigator.mediaDevices.getUserMedia({
  audio: true
}).then(stream => {
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.addEventListener('dataavailable', event => {
    audioChunks.push(event.data);
  });

  recordButton.addEventListener('click', () => {
    audioChunks = [];
    mediaRecorder.start();
    recordButton.disabled = true;
    stopButton.disabled = false;
    recordingIndicator.style.display = 'block'; // 顯示錄音指示器

    // 重置時間顯示
    recordingTime.textContent = '0:00';

    // 開始計時
    startTime = Date.now();
    recordingTimer = setInterval(updateRecordingTime, 1000); // 每秒更新一次時間
  });

  stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    recordButton.disabled = false;
    stopButton.disabled = true;
    recordingIndicator.style.display = 'none'; // 停止錄音後隱藏指示器
    clearInterval(recordingTimer); // 停止計時
  });

  mediaRecorder.addEventListener('stop', () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayback.src = audioUrl;

    // 當音頻元數據加載完成後觸發
    audioPlayback.onloadedmetadata = () => {
      // 設置音頻播放器的初始進度為 0 並且顯示總時長
      audioPlayback.currentTime = 0;

      const totalDuration = Math.floor(audioPlayback.duration);
      const totalMinutes = Math.floor(totalDuration / 60);
      const totalSeconds = totalDuration % 60;
      const formattedTotalTime = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    };

    downloadLink.href = audioUrl;
    downloadLink.download = 'audio.wav';
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download';
    uploadRecordedAudio.style.display = 'block';

    uploadRecordedAudio.addEventListener('click', async function () {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');

      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }

        const result = await response.json();
        document.getElementById('result').textContent = JSON.stringify(result, null, 2);
      } catch (error) {
        document.getElementById('result').textContent = 'Error uploading recorded audio: ' + error.message;
      }
    });
  });
})
.catch(error => { console.error('Error accessing the chosen device:', error); });


/*<!-- Button to go back to index.html -->*/
document.getElementById('backButton').addEventListener('click', function() {
  window.location.href = 'index.html';
});