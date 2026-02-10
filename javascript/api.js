const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const ExcelJS = require('exceljs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');
app.use(express.static('public'));
// Serve the HTML UI at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../html/api.html'));
});

// app.post('/scrape', async (req, res) => {
//   const { url } = req.body;

//   if (!url) {
//     return res.status(400).json({ error: 'URL is required' });
//   }

//   try {
//     const response = await axios.get(url, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Legal Scraper Tool)'
//       }
//     });


  // The following lines were outside any function and caused ReferenceError. They are commented out.
  // const $ = cheerio.load(response.data);
  // const results = [];
  // $('style, script').remove();
  // const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  // const phoneRegex = /\b\d{10,13}\b/;

// The following lines were outside any function and caused ReferenceError. They are commented out.
// $('a').each((i, el) => {
//   let text = $(el).text().trim() || '';
//   const link = $(el).attr('href') || '';
//
//   // Filter out text that looks like CSS or is empty
//   if (!text || text.startsWith('.') || text.startsWith('#') || text.includes('{') || text.includes('}')) return;
//
//   const emailMatch =
//     (text && text.match(emailRegex)) ||
//     (link && link.match(emailRegex));
//
//   const phoneMatch = text && text.match(phoneRegex);
//
//   results.push({
//     sn: i + 1,
//     name: text || 'N/A',
//     email: emailMatch ? emailMatch[0] : '',
//     phone: phoneMatch ? phoneMatch[0] : '',
//     link
//   });
// });
//     const filePath = `scraped-data.xlsx`;
//     await workbook.xlsx.writeFile(filePath);

//     res.json({
//       success: true,
//       count: results.length,
//       download: '/download'
//     });

//   } catch (err) {
//     console.error('Scrape error:', err);
//     res.status(500).json({ error: 'Failed to fetch data', details: err.message });
//   }
// });


app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(response.data);
    // Remove style and script tags
    $('style, script').remove();


    // Regex for common fields
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /\b\d{10,13}\b/;
    const priceRegex = /\b(?:Rs\.?|INR|₹)?\s?\d{1,3}(,\d{3})*(\.\d{1,2})?\b/;

    // Fully dynamic: detect all unique fields per item and build Excel columns dynamically
    let items = $('.card, .listing, .result, .product, li');
    if (items.length === 0) items = $('a');

    const results = [];
    let allKeys = new Set();

    items.each((i, el) => {
      const element = $(el);
      const obj = {};

      // Extract all direct text from children with a label (e.g., span.label, div.label, etc.)
      element.find('*').each((j, child) => {
        const $child = $(child);
        let label = $child.attr('class') || $child.attr('itemprop') || $child.attr('aria-label') || $child.prop('tagName');
        label = label ? label.split(' ')[0] : '';
        let value = $child.text().trim();
        if (label && value && value.length < 100) {
          obj[label] = value;
        }
      });

      // Also try to extract common fields by regex
      const text = element.text();
      const email = text.match(emailRegex);
      if (email) obj.email = email[0];
      const phone = text.match(phoneRegex);
      if (phone) obj.phone = phone[0];
      const price = text.match(priceRegex);
      if (price) obj.price = price[0];

      // Add all found keys
      Object.keys(obj).forEach(k => allKeys.add(k));
      if (Object.keys(obj).length > 0) results.push(obj);
    });

    // Build columns dynamically from allKeys
    allKeys = Array.from(allKeys);
    if (allKeys.length === 0) allKeys = ['text'];

    // Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Scraped Data');
    sheet.columns = allKeys.map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      key,
      width: 25
    }));
    // Header formatting
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    // Add rows
    results.forEach(row => {
      const rowData = {};
      allKeys.forEach(k => rowData[k] = row[k] || '');
      sheet.addRow(rowData);
    });
    // Borders for all cells
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Use a temp directory for file writing (important for cloud platforms like Render.com)
    const os = require('os');
    const tempDir = os.tmpdir();
    const filePath = require('path').join(tempDir, 'scraped-data.xlsx');
    await workbook.xlsx.writeFile(filePath);
    // Store the last file path in memory for download endpoint
    app.locals.lastExcelFile = filePath;
    res.json({
      success: true,
      count: results.length,
      download: '/download'
    });
  } catch (err) {
    console.error('Scrape error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to scrape data', details: err.message });
  }
});

app.get('/download', (req, res) => {
  const file = app.locals.lastExcelFile;
  if (!file) return res.status(400).send('No file available for download. Please scrape first.');
  res.download(file, 'scraped-data.xlsx', err => {
    if (err) {
      console.error('Download error:', err.message, err.stack);
      res.status(500).send('Failed to download file');
    }
  });
});

app.listen(3100, () => {
  console.log('Server running on http://localhost:3100');
});
