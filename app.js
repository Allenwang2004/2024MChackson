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

// 處理圖片或音頻上傳
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    console.log('Received file:', req.file.originalname); // 新增此行來確認是否收到文件
  
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
  
        const response = await axios.post('http://localhost:8085/spoof_detector', requestData, {
          headers: {
            'Authorization': 'Bearer 456123',
            'Content-Type': 'application/json',
            'accept': 'application/json'
          }
        });
  
        res.json({ message: 'Audio file uploaded and processed', result: response.data });
      } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
        const formData = new FormData();
        formData.append('img', fs.createReadStream(uploadedFilePath));
  
        const response = await axios.post('http://localhost:3000/inference', formData, {
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
      fs.unlink(uploadedFilePath, (err) => {
        if (err) console.error('Failed to delete temporary file:', err);
      });
    }
  });

app.use(cors());
app.use(bodyParser.json());

let reports = [];
// 清空資料夾的函數
function clearFolder(folderPath) {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error(`Unable to read folder: ${folderPath}`, err);
        return;
      }
  
      // 刪除資料夾中的每個文件
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Failed to delete file: ${filePath}`, err);
          } else {
            console.log(`Deleted file: ${filePath}`);
          }
        });
      }
    });
  }

// 處理報告請求
app.post('/report', (req, res) => {
  const report = req.body;
  const urlToScrape = report.url;

  // 將報告添加到緩存
  reports.push(report);
  console.log('Received scraping request for URL:', urlToScrape);

  // 清空 images 資料夾
  clearFolder(path.join(__dirname, 'images'));

  const pythonScript = path.join(__dirname, 'scraping.py');

  exec(`python3 ${pythonScript} ${urlToScrape}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running scraping.py: ${error}`);
      return res.status(500).json({ message: 'Scraping failed.', error: stderr });
    }
    const imagePaths = stdout.trim().split('\n');
    console.log(`Scraping output: ${imagePaths}`);

    exec('open http://localhost:4000/result.html');
    res.json({ message: 'Scraping started successfully', images: imagePaths });
  });
});

// 提供報告資料的端點
app.get('/reports', (req, res) => {
  res.json(reports);
});

// 列出指定資料夾的圖片
app.get('/list-images', (req, res) => {
  const folder = req.query.folder || 'images'; // 從查詢參數中獲取資料夾名稱
  const folderPath = path.join(__dirname, folder); // 資料夾路徑

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read folder' });
    }

    // 篩選出圖片檔案 (.jpg, .jpeg, .png, .gif)
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

    res.json(imageFiles); // 回傳圖片檔案名稱列表
  });
});

// 提供靜態圖片文件
app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

