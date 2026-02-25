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
