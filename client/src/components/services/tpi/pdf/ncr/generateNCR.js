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

const drawSectionHeader = (doc, title, currentY, contentWidth, primaryFont) => {
    doc.setFillColor(240, 240, 240);
    doc.rect(MARGIN, currentY, contentWidth, 8, 'F');
    doc.rect(MARGIN, currentY, contentWidth, 8);
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(11);
    doc.text(title, MARGIN + BOX_PAD, currentY + 6);
    return currentY + 8;
};


export const generateNCR = (doc, data, currentY, contentWidth, primaryFont) => {
    const rows = [
        ["CLIENT:", data.client_name, "NCR NO:", data.report_no],
        ["DATE RAISED:", data.date, "VENDOR / RESPONSIBLE PARTY:", data.vendor_name],
        ["LOCATION / STAGE:", data.location, "PO NUMBER:", data.po_number],
        ["ITEM / COMPONENT:", data.item_desc, "", ""]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Non-Conformance Details
    currentY = drawSectionHeader(doc, 'NON-CONFORMANCE DETAILS', currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "SEVERITY:", data.severity, "REQUIREMENT REF:", data.requirement_ref, currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "QUANTITY AFFECTED:", data.qty_affected, "", "", currentY, contentWidth, primaryFont);
    if (data.description) {
        const lines = doc.splitTextToSize(`Description: ${data.description}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 4;
    }

    // Disposition
    currentY = drawSectionHeader(doc, 'DISPOSITION & CORRECTIVE ACTION', currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "DISPOSITION:", data.disposition, "NCR STATUS:", data.status, currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "TARGET CLOSURE DATE:", data.closure_date, "", "", currentY, contentWidth, primaryFont);
    if (data.root_cause) {
        const lines = doc.splitTextToSize(`Root Cause: ${data.root_cause}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }
    if (data.corrective_action) {
        const lines = doc.splitTextToSize(`Corrective Action: ${data.corrective_action}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
