import { MARGIN, drawInfoRow, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';

const generateGenericNDT = (doc, data, currentY, contentWidth, primaryFont, title) => {
    // 1. Report Header
    currentY = drawReportHeader(doc, data, currentY, contentWidth, primaryFont);

    doc.setFont(primaryFont, "bold");
    doc.text(`${title} DETAILS`, MARGIN + 2, currentY + 5);
    currentY += 10;

    const info = [
        ["MATERIAL SPEC:", data.material_spec, "PROCEDURE NO:", data.procedure_no],
        ["THICKNESS:", data.thickness, "ACCEPTANCE STANDARD:", data.acceptance_std]
    ];
    info.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 5;
    return currentY;
};

export const generateCalib = (doc, data, currentY, contentWidth, primaryFont) =>
    generateGenericNDT(doc, data, currentY, contentWidth, primaryFont, "CALIBRATION RECORD");
