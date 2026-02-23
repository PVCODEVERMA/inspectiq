import { MARGIN, drawInfoRow } from '@/components/services/common/pdf/PdfUtils';

const generateGenericNDT = (doc, data, currentY, contentWidth, primaryFont, title) => {
    // Generic Header for this type
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

export const generateVT = (doc, data, currentY, contentWidth, primaryFont) => generateGenericNDT(doc, data, currentY, contentWidth, primaryFont, "VISUAL TESTING");
export const generateRT = (doc, data, currentY, contentWidth, primaryFont) => generateGenericNDT(doc, data, currentY, contentWidth, primaryFont, "RADIOGRAPHIC TESTING");
export const generateEddy = (doc, data, currentY, contentWidth, primaryFont) => generateGenericNDT(doc, data, currentY, contentWidth, primaryFont, "EDDY CURRENT TESTING");
export const generateLeak = (doc, data, currentY, contentWidth, primaryFont) => generateGenericNDT(doc, data, currentY, contentWidth, primaryFont, "LEAK TESTING");
export const generateHardness = (doc, data, currentY, contentWidth, primaryFont) => generateGenericNDT(doc, data, currentY, contentWidth, primaryFont, "HARDNESS TESTING");
export const generateCalib = (doc, data, currentY, contentWidth, primaryFont) => generateGenericNDT(doc, data, currentY, contentWidth, primaryFont, "CALIBRATION RECORD");
