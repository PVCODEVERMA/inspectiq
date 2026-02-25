// --- Constants ---
const MARGIN = 15;
const BOX_PAD = 2;

// --- Drawing Helpers ---
const drawInfoRow = (doc, label1, value1, label2, value2, y, contentWidth, fontName = "times") => {
    const rowH = 7;
    doc.rect(MARGIN, y, contentWidth, rowH);
    const mid = MARGIN + (contentWidth / 2);
    const textY = y + 5;

    doc.setFontSize(11);
    doc.setFont(fontName, "bold");
    doc.text(label1, MARGIN + BOX_PAD, textY);

    const label1Width = doc.getTextWidth(label1);
    doc.setFont(fontName, "normal");
    doc.text(String(value1 || ''), MARGIN + BOX_PAD + label1Width + BOX_PAD, textY);

    if (label2) {
        doc.setFont(fontName, "bold");
        doc.text(label2, mid + BOX_PAD, textY);

        const label2Width = doc.getTextWidth(label2);
        doc.setFont(fontName, "normal");
        doc.text(String(value2 || ''), mid + BOX_PAD + label2Width + BOX_PAD, textY);
    }

    return y + rowH;
};


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
