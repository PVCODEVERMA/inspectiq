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


export const generateCAR = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const rows = [
        ["CLIENT:", data.client_name, "CAR NO:", data.report_no],
        ["DATE ISSUED:", data.date, "ISSUED TO (VENDOR):", data.vendor_name],
        ["NCR REFERENCE:", data.ncr_ref, "PO NUMBER:", data.po_number]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Problem Analysis
    currentY = drawSectionHeader(doc, 'PROBLEM ANALYSIS', currentY, contentWidth, primaryFont);
    const textFields = [
        ['Problem Description', data.problem_description],
        ['Root Cause Analysis', data.root_cause],
        ['Immediate / Containment Action', data.immediate_action]
    ];
    textFields.forEach(([label, value]) => {
        if (value) {
            const lines = doc.splitTextToSize(`${label}: ${value}`, contentWidth - 4);
            doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
            doc.text(lines, 14, currentY); currentY += lines.length * 4 + 3;
        }
    });
    currentY += 2;

    // Corrective Action Plan Table
    currentY = drawSectionHeader(doc, 'CORRECTIVE ACTION PLAN', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.corrective) ? data.corrective : [];
    currentY = drawTable(doc,
        ['Corrective Action', 'Responsible', 'Target Date', 'Status'],
        items.map(i => [i.action, i.responsible, i.target_date, i.status]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Closure
    currentY = drawSectionHeader(doc, 'CLOSURE', currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "VERIFICATION METHOD:", data.verification_method, "CAR STATUS:", data.status, currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "CLOSURE DATE:", data.closure_date, "", "", currentY, contentWidth, primaryFont);
    if (data.remarks) {
        const lines = doc.splitTextToSize(`Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
