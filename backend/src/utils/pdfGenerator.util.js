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
      
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
        autoFirstPage: true,
        bufferPages: true,
      });

      
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

      
      doc.rect(0, 0, pageWidth, pageHeight).fill("#ffffff");

      
      const cornerSize = 70;
      const cornerColor = "#4F46E5";

      
      doc.save();
      doc.moveTo(0, cornerSize);
      doc.lineTo(0, 15);
      doc.quadraticCurveTo(0, 0, 15, 0);
      doc.lineTo(cornerSize, 0);
      doc.lineWidth(4);
      doc.strokeColor(cornerColor);
      doc.stroke();
      doc.restore();

      
      doc.save();
      doc.moveTo(pageWidth - cornerSize, 0);
      doc.lineTo(pageWidth - 15, 0);
      doc.quadraticCurveTo(pageWidth, 0, pageWidth, 15);
      doc.lineTo(pageWidth, cornerSize);
      doc.lineWidth(4);
      doc.strokeColor(cornerColor);
      doc.stroke();
      doc.restore();

      
      doc.save();
      doc.moveTo(0, pageHeight - cornerSize);
      doc.lineTo(0, pageHeight - 15);
      doc.quadraticCurveTo(0, pageHeight, 15, pageHeight);
      doc.lineTo(cornerSize, pageHeight);
      doc.lineWidth(4);
      doc.strokeColor(cornerColor);
      doc.stroke();
      doc.restore();

      
      doc.save();
      doc.moveTo(pageWidth - cornerSize, pageHeight);
      doc.lineTo(pageWidth - 15, pageHeight);
      doc.quadraticCurveTo(pageWidth, pageHeight, pageWidth, pageHeight - 15);
      doc.lineTo(pageWidth, pageHeight - cornerSize);
      doc.lineWidth(4);
      doc.strokeColor(cornerColor);
      doc.stroke();
      doc.restore();

      
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

      
      doc
        .fillColor("#64748b")
        .fontSize(12)
        .font("Helvetica")
        .text("This certificate is proudly presented to", 0, 90, {
          align: "center",
          width: pageWidth,
        });

      
      const fontToUse = doc._registeredFonts['Cairo'] ? 'Cairo' : 'Helvetica-Bold';
      
      
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
          features: ['rtla'], 
        });

      
      
      doc
        .fillColor("#64748b")
        .fontSize(11)
        .font("Helvetica-Oblique")
        .text("for successfully completing the Mentora course", 0, 175, {
          align: "center",
          width: pageWidth,
        });

      
      doc
        .fillColor("#0D9488")
        .fontSize(20) 
        .font(fontToUse)
        .text(courseTitle, 50, 190, {
          align: "center",
          width: pageWidth - 100,
          lineGap: 0,
          features: ['rtla'],
        });

      
      const footerY = pageHeight - 120; 

      
      const leftX = 80;
      
      
      doc
        .moveTo(leftX, footerY + 25)
        .lineTo(leftX + 140, footerY + 25)
        .lineWidth(1)
        .strokeColor("#cbd5e1")
        .stroke();

      
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

      
      const qrSize = 80;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = footerY - 25; 

      const qrImageData = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(qrImageData, 'base64');
      
      doc.image(qrBuffer, qrX, qrY, {
        width: qrSize,
        height: qrSize,
      });

      
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

      
      const rightX = pageWidth - 220;
      
      
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

      
      doc.flushPages();
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default { generateCertificatePDF };
