const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const path = require('path');

const pdfPath = path.join(__dirname, '..', 'Mini project Title Registration form.pdf');

async function testParse() {
  let parser;
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    console.log('Buffer length:', dataBuffer.length);
    parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    fs.writeFileSync('success.txt', data.text.substring(0, 500));
    console.log('SUCCESS! Text length found:', data.text.length);
  } catch (err) {
    fs.writeFileSync('error_trace.txt', String(err.stack || err.message || err));
    console.error('PARSE FAILED:', err);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

testParse();
