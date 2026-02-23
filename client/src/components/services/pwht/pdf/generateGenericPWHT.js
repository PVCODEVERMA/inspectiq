import { MARGIN, drawInfoRow } from '@/components/services/common/pdf/PdfUtils';

export const generateGenericPWHT = (doc, data, currentY, contentWidth, primaryFont, title) => {
    // Basic Info
    const basicInfo = [
        ["PROCEDURE NO:", data.procedure_no || '-', "REPORT NO:", data.report_no],
        ["MATERIAL:", data.material || '-', "THICKNESS:", data.thickness || '-']
    ];

    basicInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    // PWHT Specifics
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(11);
    doc.text(`${title} DETAILS`, MARGIN + 2, currentY + 5);
    currentY += 7;

    const cycleInfo = [
        ["HEATING RATE:", data.heating_rate, "HOLDING TEMP:", data.holding_temp],
        ["HOLDING TIME:", data.holding_time, "COOLING RATE:", data.cooling_rate]
    ];

    cycleInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    currentY += 5;
    return currentY;
};
