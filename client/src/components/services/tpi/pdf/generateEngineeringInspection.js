// --- Constants ---
const MARGIN = 15;
const BOX_PAD = 2;
const ROW_GAP = 6;

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

const drawSectionHeader = (doc, title, y, contentWidth, fontName = 'helvetica') => {
    const headerH = BOX_PAD + ROW_GAP;
    doc.setFillColor(30, 58, 138); // dark blue
    doc.rect(MARGIN, y, contentWidth, headerH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(fontName, "bold");
    doc.setFontSize(10);
    doc.text(title.toUpperCase(), MARGIN + BOX_PAD, y + BOX_PAD + 4);
    doc.setTextColor(0, 0, 0);
    return y + headerH + BOX_PAD;
};

const drawReportHeader = (doc, data, currentY, contentWidth, primaryFont) => {
    const headerFields = [
        ["CLIENT:", data.client_name || 'N/A', "REPORT NO:", data.report_no || 'Auto-Generated'],
        ["VENDOR:", data.vendor_name || 'N/A', "DATE:", data.date ? new Date(data.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')],
        ["ITEM:", data.item_tested || data.item || data.item_details || 'N/A', null],
        ["LOCATION:", data.location || data.site_location || 'N/A', null]
    ];

    headerFields.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    return currentY + 2;
};

const drawTable = (doc, headers, rows, y, contentWidth, fontName = 'helvetica', checkPageBreak, drawTemplate) => {
    const colCount = headers.length;
    const colWidth = contentWidth / colCount;
    const rowHeight = BOX_PAD + ROW_GAP + 2;
    const startX = MARGIN;
    const cellPad = BOX_PAD;
    const textYOffset = BOX_PAD + 4;

    // Header row
    if (checkPageBreak) y = checkPageBreak(rowHeight);
    doc.setFillColor(219, 234, 254); // light blue
    doc.rect(startX, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.1);
    doc.rect(startX, y, contentWidth, rowHeight);

    doc.setFontSize(8);
    doc.setFont(fontName, 'bold');
    doc.setTextColor(0, 0, 0);

    headers.forEach((header, i) => {
        const cellX = startX + i * colWidth;
        if (i > 0) doc.line(cellX, y, cellX, y + rowHeight);
        const text = doc.splitTextToSize(String(header), colWidth - cellPad * 2);
        doc.text(text, cellX + cellPad, y + textYOffset);
    });

    y += rowHeight;

    // Data rows
    doc.setFont(fontName, 'normal');
    const dataRows = rows && rows.length > 0 ? rows : [headers.map(() => '')];

    dataRows.forEach((row) => {
        let maxLines = 1;
        row.forEach((cell, i) => {
            const lines = doc.splitTextToSize(String(cell || ''), colWidth - cellPad * 2);
            if (lines.length > maxLines) maxLines = lines.length;
        });
        const cellHeight = Math.max(rowHeight, maxLines * 4 + BOX_PAD * 2);

        if (checkPageBreak) {
            const newY = checkPageBreak(cellHeight);
            if (newY < y) {
                y = newY;
                doc.setFillColor(219, 234, 254);
                doc.rect(startX, y, contentWidth, rowHeight, 'F');
                doc.setDrawColor(180, 180, 180);
                doc.rect(startX, y, contentWidth, rowHeight);
                headers.forEach((h, i) => {
                    const cx = startX + i * colWidth;
                    if (i > 0) doc.line(cx, y, cx, y + rowHeight);
                    doc.setFont(fontName, 'bold');
                    doc.text(doc.splitTextToSize(String(h), colWidth - cellPad * 2), cx + cellPad, y + textYOffset);
                });
                y += rowHeight;
                doc.setFont(fontName, 'normal');
            } else {
                y = newY;
            }
        }

        doc.setDrawColor(180, 180, 180);
        doc.rect(startX, y, contentWidth, cellHeight);

        row.forEach((cell, i) => {
            const cellX = startX + i * colWidth;
            if (i > 0) doc.line(cellX, y, cellX, y + cellHeight);
            const text = doc.splitTextToSize(String(cell || ''), colWidth - cellPad * 2);
            doc.text(text, cellX + cellPad, y + textYOffset - 0.5);
        });

        y += cellHeight;
    });

    return y + 2;
};


export const generateEngineeringInspection = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    // 1. Report Header (Client, Report No, Date, Vendor, Location)
    currentY = drawReportHeader(doc, data, currentY, contentWidth, primaryFont);

    // 2. Additional Fields (Drawing Ref, PO Number)
    const extraInfo = [
        ["PO NUMBER:", data.po_number || 'N/A', "DRAWING / SPEC REF:", data.drawing_ref || 'N/A']
    ];

    extraInfo.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    if (data.scope) {
        const lines = doc.splitTextToSize(`Scope: ${data.scope}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }
    currentY += 4;

    // Inspection Findings Table
    currentY = drawSectionHeader(doc, 'INSPECTION FINDINGS', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.findings) ? data.findings : [];
    currentY = drawTable(doc,
        ['Item No', 'Finding Description', 'Code / Std Reference', 'Result', 'Remarks'],
        items.map(i => [i.item_no, i.description, i.reference, i.result, i.remarks]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Conclusion
    currentY = drawSectionHeader(doc, 'CONCLUSION', currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "OVERALL RESULT:", data.overall_result, "", "", currentY, contentWidth, primaryFont);
    if (data.remarks) {
        const lines = doc.splitTextToSize(`Inspector Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
