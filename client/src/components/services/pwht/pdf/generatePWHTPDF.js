import { MARGIN, drawInfoRow, drawReportHeader } from './PdfUtils';

export const generatePWHTPDF = (doc, data, currentY, contentWidth, primaryFont) => {
    // 1. Report Header (Client, Report No, Date, Vendor, Location)
    currentY = drawReportHeader(doc, data, currentY, contentWidth, primaryFont);

    // 2. Technical Details
    const basicInfo = [
        ["PROCEDURE NO:", data.procedure_no || '-', "PO NUMBER:", data.po_number || '-'],
        ["MATERIAL:", data.material || '-', "THICKNESS:", data.thickness || '-']
    ];

    basicInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    // PWHT Specifics
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(11);
    doc.text("PWHT CYCLE DETAILS", MARGIN + 2, currentY + 5);
    currentY += 7;

    const cycleInfo = [
        ["HEATING RATE:", data.heating_rate, "HOLDING TEMP:", data.holding_temp],
        ["HOLDING TIME:", data.holding_time, "COOLING RATE:", data.cooling_rate]
    ];

    cycleInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    currentY += 5;

    // Placeholder for Chart/Graph if needed
    // doc.rect(MARGIN, currentY, contentWidth, 50);
    // doc.text("TEMPERATURE CHART PLACEHOLDER", MARGIN + 10, currentY + 25);
    // currentY += 55;

    return currentY;
};
