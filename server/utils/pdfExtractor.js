const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extracts raw text from an uploaded PDF file path or buffer.
 * @param {string|Buffer} source File path or buffer
 * @returns {Promise<{text: string, numpages: number, info: object}>}
 */
async function extractTextFromPDF(source) {
  try {
    let dataBuffer;
    if (typeof source === 'string') {
      dataBuffer = fs.readFileSync(source);
    } else {
      dataBuffer = source;
    }

    let text = '';
    let numpages = 1;
    try {
      const data = await pdf(dataBuffer);
      text = data.text;
      numpages = data.numpages || 1;
    } catch (parseErr) {
      console.warn('⚠️ pdf-parse warning: File structure is non-standard. Extracting raw text content fallback...');
      text = dataBuffer.toString('utf-8');
    }

    // Clean up excessive whitespace and special unicode spaces
    const cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim();

    return {
      text: cleanedText,
      numpages: numpages,
      info: {}
    };
  } catch (error) {
    console.error('Error parsing PDF file:', error);
    throw new Error('Failed to parse PDF resume file. Ensure it is a valid, unencrypted PDF.');
  }
}

module.exports = { extractTextFromPDF };
