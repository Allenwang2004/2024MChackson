const htmlContent = '<html><body><h1>This is a test HTML</h1></body></html>';

fetch('http://localhost:4000/report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    title: 'Spoof Detection Report',
    html: htmlContent,
  }),
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  console.log('Report sent successfully:', data);
})
.catch(error => {
  console.error('Error sending report:', error);
});