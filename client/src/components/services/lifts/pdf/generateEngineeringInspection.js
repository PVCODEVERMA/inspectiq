import autoTable from 'jspdf-autotable';

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

const drawTable = (doc, headers, rows, startY, contentWidth, primaryFont, checkPageBreak, drawTemplate) => {
    autoTable(doc, {
        startY: startY,
        head: [headers],
        body: rows,
        theme: 'grid',
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [0, 0, 0],
            fillColor: null,
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        margin: { left: MARGIN, right: MARGIN, bottom: 40 },
        didDrawPage: (data) => {
            if (data.pageNumber > 1 && drawTemplate) {
                drawTemplate(data.pageNumber);
                doc.setFont(primaryFont, "normal");
            }
        }
    });
    return doc.lastAutoTable.finalY;
};


export const generateEngineeringInspection = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const rows = [
        ["CLIENT:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "VENDOR / MANUFACTURER:", data.vendor_name],
        ["INSPECTION LOCATION:", data.location, "DRAWING / SPEC REF:", data.drawing_ref]
    ];
    rows.forEach(row => {
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
