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
