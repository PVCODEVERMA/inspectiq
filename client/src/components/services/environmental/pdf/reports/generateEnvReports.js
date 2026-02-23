import { MARGIN, drawInfoRow } from '@/components/services/common/pdf/PdfUtils';

const generateGenericEnv = (doc, data, currentY, contentWidth, primaryFont, title) => {
    doc.setFont(primaryFont, "bold");
    doc.text(`${title} REPORT`, MARGIN + 2, currentY + 5);
    currentY += 10;
    const info = [
        ["CLIENT:", data.client_name, "REPORT NO:", data.report_no],
        ["DATE:", data.date, "LOCATION:", data.location],
        ["PARAMETER:", data.parameter, "RESULT:", data.result]
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

export const generateEIA = (doc, data, cy, cw, pf) => generateGenericEnv(doc, data, cy, cw, pf, "EIA REPORT");
export const generateAirQuality = (doc, data, cy, cw, pf) => generateGenericEnv(doc, data, cy, cw, pf, "AIR QUALITY");
export const generateWaterQuality = (doc, data, cy, cw, pf) => generateGenericEnv(doc, data, cy, cw, pf, "WATER QUALITY");
export const generateSoilAnalysis = (doc, data, cy, cw, pf) => generateGenericEnv(doc, data, cy, cw, pf, "SOIL ANALYSIS");
export const generateNoiseLevel = (doc, data, cy, cw, pf) => generateGenericEnv(doc, data, cy, cw, pf, "NOISE LEVEL");
export const generateEnvComp = (doc, data, cy, cw, pf) => generateGenericEnv(doc, data, cy, cw, pf, "COMPLIANCE REPORT");
