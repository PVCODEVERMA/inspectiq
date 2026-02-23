import { MARGIN, drawInfoRow, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';

const generateGenericPWHT = (doc, data, currentY, contentWidth, primaryFont, title) => {
    // 1. Report Header (Client, Report No, Date, Vendor, Location)
    currentY = drawReportHeader(doc, data, currentY, contentWidth, primaryFont);

    doc.setFont(primaryFont, "bold");
    doc.text(`${title} DETAILS`, MARGIN + 2, currentY + 5);
    currentY += 10;

    const info = [
        ["HEATING RATE:", data.heating_rate || 'N/A', "SOAK TEMP (°C):", data.soak_temp || 'N/A'],
        ["SOAK TIME (min):", data.soak_time || 'N/A', "COOLING RATE:", data.cooling_rate || 'N/A']
    ];
    info.forEach(row => { currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont); });
    if (data.remarks) {
        currentY += 3;
        const lines = doc.splitTextToSize(`Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, MARGIN + 2, currentY); currentY += lines.length * 4 + 2;
    }
    return currentY;
};

export const generatePWHTSetup = (doc, data, cy, cw, pf) => generateGenericPWHT(doc, data, cy, cw, pf, "PWHT SETUP");
export const generateTempChart = (doc, data, cy, cw, pf) => generateGenericPWHT(doc, data, cy, cw, pf, "TEMPERATURE CHART");
export const generateHeatingLog = (doc, data, cy, cw, pf) => generateGenericPWHT(doc, data, cy, cw, pf, "HEATING LOG");
export const generateTCPlacement = (doc, data, cy, cw, pf) => generateGenericPWHT(doc, data, cy, cw, pf, "THERMOCOUPLE PLACEMENT");
export const generatePWHTCert = (doc, data, cy, cw, pf) => generateGenericPWHT(doc, data, cy, cw, pf, "COMPLETION CERTIFICATE");
