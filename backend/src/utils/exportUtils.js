import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

/**
 * Generates a PDF document from analytics data
 * @param {Object} data - Analytics data object
 * @param {string} title - Report title
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateAnalyticsPDF = async (data, title = 'Analytics Report') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Overview section
      if (data.overview) {
        doc.fontSize(16).font('Helvetica-Bold').text('Overview');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        
        Object.entries(data.overview).forEach(([key, value]) => {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc.text(`${formattedKey}: ${value}`);
        });
        doc.moveDown();
      }

      // Revenue section
      if (data.revenue) {
        doc.fontSize(16).font('Helvetica-Bold').text('Revenue');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        
        if (Array.isArray(data.revenue)) {
          data.revenue.forEach(item => {
            doc.text(`${item.period || item.date}: $${item.amount || item.value}`);
          });
        } else {
          doc.text(`Total Revenue: $${data.revenue.total || data.revenue}`);
        }
        doc.moveDown();
      }

      // Users section
      if (data.users) {
        doc.fontSize(16).font('Helvetica-Bold').text('User Statistics');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        
        if (typeof data.users === 'object') {
          Object.entries(data.users).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            doc.text(`${formattedKey}: ${value}`);
          });
        }
        doc.moveDown();
      }

      // Courses section
      if (data.courses && Array.isArray(data.courses)) {
        doc.fontSize(16).font('Helvetica-Bold').text('Course Analytics');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        
        data.courses.slice(0, 10).forEach(course => {
          doc.text(`• ${course.title}: ${course.enrollments || 0} enrollments, $${course.revenue || 0}`);
        });
        if (data.courses.length > 10) {
          doc.text(`... and ${data.courses.length - 10} more courses`);
        }
        doc.moveDown();
      }

      // Enrollments section
      if (data.enrollments) {
        doc.fontSize(16).font('Helvetica-Bold').text('Enrollment Statistics');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        
        if (typeof data.enrollments === 'object' && !Array.isArray(data.enrollments)) {
          Object.entries(data.enrollments).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            doc.text(`${formattedKey}: ${value}`);
          });
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generates a CSV from analytics data
 * @param {Object|Array} data - Analytics data 
 * @param {Array} fields - Optional field names for CSV columns
 * @returns {string} CSV string
 */
export const generateAnalyticsCSV = (data, fields = null) => {
  try {
    // If data is an object with nested properties, flatten it
    let csvData = data;
    
    if (!Array.isArray(data)) {
      csvData = flattenDataForCSV(data);
    }

    if (csvData.length === 0) {
      return 'category,metric,value\nNo data available,,';
    }

    const parserOptions = fields ? { fields } : {};
    const parser = new Parser(parserOptions);
    return parser.parse(csvData);
  } catch (error) {
    console.error('CSV generation error:', error);
    throw new Error('Failed to generate CSV: ' + error.message);
  }
};

/**
 * Flattens nested analytics data for CSV export
 * @param {Object} data - Nested data object
 * @returns {Array} Flattened array of records
 */
function flattenDataForCSV(data) {
  const records = [];

  const processSection = (section, sectionName) => {
    if (Array.isArray(section)) {
      section.forEach(item => {
        records.push({ category: sectionName, ...item });
      });
    } else if (typeof section === 'object' && section !== null) {
      Object.entries(section).forEach(([key, value]) => {
        if (typeof value !== 'object') {
          records.push({
            category: sectionName,
            metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: value
          });
        }
      });
    } else {
      records.push({ category: sectionName, metric: sectionName, value: section });
    }
  };

  if (data.overview) processSection(data.overview, 'Overview');
  if (data.revenue) processSection(data.revenue, 'Revenue');
  if (data.users) processSection(data.users, 'Users');
  if (data.enrollments) processSection(data.enrollments, 'Enrollments');
  if (data.courses) processSection(data.courses, 'Courses');

  // If no specific sections, try to process as flat data
  if (records.length === 0) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value !== 'object') {
        records.push({
          metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          value: value
        });
      }
    });
  }

  return records;
}

export default { generateAnalyticsPDF, generateAnalyticsCSV };
