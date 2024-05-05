const express = require('express')

const router = express.Router()

router.get('/generate-pdf/:userName/:courseName', (req, res) => {
    const { userName, courseName } = req.params;
  
    // Create a new PDF document
    const doc = new PDFDocument();
  
    // Set the response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${userName}_${courseName}_certificate.pdf`);
  
    // Pipe the PDF to the response
    doc.pipe(res);
  
    // Add content to the PDF
    doc.fontSize(20).text(`Certificate of Completion\n\n`);
    doc.fontSize(16).text(`This certificate is awarded to ${userName} for completing the course ${courseName}.\n\n`);
    doc.fontSize(12).text(`Date: ${new Date().toDateString()}\n\n`);
  
    // Finalize the PDF
    doc.end();
});

module.exports = router