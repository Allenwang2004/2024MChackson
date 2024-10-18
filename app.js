const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const port = 4000;

// 使用 multer 來處理文件上傳
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 存放上傳的文件
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 確保文件名唯一
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const uploadedFilePath = req.file.path;

  try {
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (['.mp3', '.wav', '.ogg', '.flac'].includes(fileExtension)) {
      const audioBuffer = fs.readFileSync(uploadedFilePath);
      const base64Audio = audioBuffer.toString('base64');
      const requestData = {
        reference_id: `REF${Date.now()}`,
        audio_data: base64Audio,
        model_version: 'v0'
      };

      // 構造發送給 API 的請求數據
      const response = await axios.post('http://localhost:8085/spoof_detector', requestData, {
        headers: {
          'Authorization': 'Bearer 456123',
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      });

      res.json({ message: 'Audio file uploaded and processed', result: response.data });
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
      // 如果是圖片文件，使用 FormData 發送請求到 /inference
      const formData = new FormData();
      formData.append('img', fs.createReadStream(uploadedFilePath));

      const responseç = await axios.post('http://localhost:3000/inference', formData, {
        headers: {
          ...formData.getHeaders(),
        }
      });

      res.json({ message: 'Image file uploaded and processed', result: response.data });
    } else {
      return res.status(400).send('Unsupported file type.');
    }
  } catch (error) {
    console.error('Error in detection:', error);
    res.status(500).send('Error in detection');
  } finally {
    // 刪除臨時文件
    fs.unlink(uploadedFilePath, (err) => {
      if (err) console.error('Failed to delete temporary file:', err);
    });
  }
});

app.use(cors());
app.use(bodyParser.json());

let reports = [];

app.post('/report', (req, res) => {
    const report = req.body;
    reports.push(report);
    console.log('Received report:', report);
  
    // 获取 HTML 内容并保存
    const htmlContent = report.html;
    const htmlFilePath = path.join(__dirname, 'temp.html');
  
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  
    // 打开 HTML 文件
    exec(`open ${htmlFilePath}`, (error) => {
      if (error) {
        console.error(`Could not open file: ${error}`);
        return res.status(500).json({ message: 'Could not open HTML file.' });
      }
      res.json({ message: 'Report received and HTML opened', report });
    });
  });
  
  app.get('/reports', (req, res) => {
    res.json(reports);
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});