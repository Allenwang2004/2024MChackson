const urlToScrape = 'https://tw.news.yahoo.com/';

fetch('http://localhost:4000/report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    title: 'Scraping Request',
    url: urlToScrape,
  }),
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  console.log('Scraping request sent successfully:', data);
})
.catch(error => {
  console.error('Error sending request:', error);
});