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
  
  const recordButton = document.getElementById('recordButton');
  const stopButton = document.getElementById('stopButton');
  const audioPlayback = document.getElementById('audioPlayback');
  const downloadLink = document.getElementById('downloadLink');
  const uploadRecordedAudio = document.getElementById('uploadRecordedAudio');
  
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
    });
  
    stopButton.addEventListener('click', () => {
      mediaRecorder.stop();
      recordButton.disabled = false;
      stopButton.disabled = true;
    });
  
    mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;
  
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
  .catch(error => {console.error('Error accessing the chosen device:', error);});