import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const generateCertificatePDF = async (data) => {
  const {
    certificateId,
    studentName,
    courseTitle,
    instructorName,
    completionDate,
  } = data;

  // Generate QR code as data URL (for verification link)
  const verificationUrl = `${process.env.FRONTEND_URL || 'https://mentora.com'}/certificates/${certificateId}/verify`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 0,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  return new Promise((resolve, reject) => {
    try {
      // Create PDF document (landscape A4) - single page
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
        autoFirstPage: true,
        bufferPages: true,
      });

      // Register Arabic font
      const fontPath = path.join(__dirname, '../assets/fonts/Cairo-Regular.ttf');
      try {
        doc.registerFont('Cairo', fontPath);
      } catch (fontError) {
        console.warn('Cairo font not found, using Helvetica:', fontError.message);
      }

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // White background
      doc.rect(0, 0, pageWidth, pageHeight).fill("#ffffff");

      // Corner decorations (blue/purple curved corners)
      const cornerSize = 70;
      const cornerColor = "#4F46E5";

      // Top-left corner
      doc.save();
      doc.moveTo(0, cornerSize);
      doc.lineTo(0, 15);
      doc.quadraticCurveTo(0, 0, 15, 0);
      doc.lineTo(cornerSize, 0);
      doc.lineWidth(4);
      doc.strokeColor(cornerColor);
      doc.stroke();
      doc.restore();

      // Top-right corner
      doc.save();
      doc.moveTo(pageWidth - cornerSize, 0);
      doc.lineTo(pageWidth - 15, 0);
      doc.quadraticCurveTo(pageWidth, 0, pageWidth, 15);
      doc.lineTo(pageWidth, cornerSize);
      doc.lineWidth(4);
      doc.strokeColor(cornerColor);
      doc.stroke();
      doc.restore();

      // Bottom-left corner
      doc.save();
      doc.moveTo(0, pageHeight - cornerSize);
      doc.lineTo(0, pageHeight - 15);
      doc.quadraticCurveTo(0, pageHeight, 15, pageHeight);
      doc.lineTo(cornerSize, pageHeight);
      doc.lineWidth(4);
      doc.strokeColor(cornerColor);
      doc.stroke();
      doc.restore();

      // Bottom-right corner
      doc.save();
      doc.moveTo(pageWidth - cornerSize, pageHeight);
      doc.lineTo(pageWidth - 15, pageHeight);
      doc.quadraticCurveTo(pageWidth, pageHeight, pageWidth, pageHeight - 15);
      doc.lineTo(pageWidth, pageHeight - cornerSize);
      doc.lineWidth(4);
      doc.strokeColor(cornerColor);
      doc.stroke();
      doc.restore();

      // "CERTIFICATE OF COMPLETION" badge
      const badgeWidth = 200;
      const badgeHeight = 26;
      const badgeX = (pageWidth - badgeWidth) / 2;
      const badgeY = 45;
      const badgeColor = "#0D9488";

      doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 13);
      doc.fill(badgeColor);

      doc
        .fillColor("#ffffff")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("CERTIFICATE OF COMPLETION", badgeX, badgeY + 7, {
          width: badgeWidth,
          align: "center",
        });

      // "This certificate is proudly presented to"
      doc
        .fillColor("#64748b")
        .fontSize(12)
        .font("Helvetica")
        .text("This certificate is proudly presented to", 0, 90, {
          align: "center",
          width: pageWidth,
        });

      // Student name - use Cairo font for Arabic support
      const fontToUse = doc._registeredFonts['Cairo'] ? 'Cairo' : 'Helvetica-Bold';
      
      // Calculate font size based on name length
      let nameFontSize = 32;
      if (studentName.length > 20) nameFontSize = 26;
      if (studentName.length > 30) nameFontSize = 22;

      doc
        .fillColor("#1e293b")
        .fontSize(nameFontSize)
        .font(fontToUse)
        .text(studentName, 50, 115, {
          align: "center",
          width: pageWidth - 100,
          lineGap: 0,
          features: ['rtla'], // Enable Right-to-Left Alternates for Arabic
        });

      // "for successfully completing the Mentora course"
      // Moved down significantly to avoid overlap with large Arabic text
      doc
        .fillColor("#64748b")
        .fontSize(11)
        .font("Helvetica-Oblique")
        .text("for successfully completing the Mentora course", 0, 175, {
          align: "center",
          width: pageWidth,
        });

      // Course title (teal color) - use Cairo font for Arabic support
      doc
        .fillColor("#0D9488")
        .fontSize(20) // Slightly smaller
        .font(fontToUse)
        .text(courseTitle, 50, 190, {
          align: "center",
          width: pageWidth - 100,
          lineGap: 0,
          features: ['rtla'],
        });

      // Footer section - positioned higher to fit on one page
      const footerY = pageHeight - 120; // Moved up

      // Left side - Instructor
      const leftX = 80;
      
      // Instructor signature line
      doc
        .moveTo(leftX, footerY + 25)
        .lineTo(leftX + 140, footerY + 25)
        .lineWidth(1)
        .strokeColor("#cbd5e1")
        .stroke();

      // Instructor name
      doc
        .fillColor("#1e293b")
        .fontSize(14)
        .font("Helvetica-Oblique")
        .text(instructorName, leftX, footerY + 5, {
          width: 140,
          align: "center",
        });

      doc
        .fillColor("#64748b")
        .fontSize(9)
        .font("Helvetica")
        .text("Lead Instructor, Mentora", leftX, footerY + 35, {
          width: 140,
          align: "center",
        });

      // Center - QR Code (Moved up)
      const qrSize = 80;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = footerY - 25; // Moved up relative to footer line

      const qrImageData = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(qrImageData, 'base64');
      
      doc.image(qrBuffer, qrX, qrY, {
        width: qrSize,
        height: qrSize,
      });

      // Certificate ID - Directly under QR code
      const idY = qrY + qrSize + 5;
      
      doc
        .fillColor("#94a3b8")
        .fontSize(7)
        .font("Helvetica")
        .text("CERTIFICATE ID", 0, idY, {
          align: "center",
          width: pageWidth,
        });

      const formattedCertId = certificateId.toUpperCase();
      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(formattedCertId, 0, idY + 10, {
          align: "center",
          width: pageWidth,
        });

      // Right side - Date
      const rightX = pageWidth - 220;
      
      // Format completion date
      const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc
        .fillColor("#0D9488")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(formattedDate, rightX, footerY + 10, {
          width: 140,
          align: "center",
        });

      doc
        .fillColor("#64748b")
        .fontSize(9)
        .font("Helvetica")
        .text("Date of Completion", rightX, footerY + 35, {
          width: 140,
          align: "center",
        });

      // Finalize PDF - ensure single page
      doc.flushPages();
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default { generateCertificatePDF };
