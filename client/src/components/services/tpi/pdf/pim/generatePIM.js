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


export const generatePIM = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    // Meeting Details
    const rows = [
        ["CLIENT / COMPANY:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "LOCATION:", data.location],
        ["PROJECT / ITEM:", data.project_name, "", ""]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Attendees Table
    currentY = drawSectionHeader(doc, 'ATTENDEES', currentY, contentWidth, primaryFont);
    const attendees = Array.isArray(data.attendees) ? data.attendees : [];
    currentY = drawTable(doc, ['Name', 'Company', 'Designation', 'Signature'],
        attendees.map(a => [a.name, a.company, a.designation, a.signature || '']),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Agenda Table
    currentY = drawSectionHeader(doc, 'AGENDA & DISCUSSION POINTS', currentY, contentWidth, primaryFont);
    const agenda = Array.isArray(data.agenda) ? data.agenda : [];
    currentY = drawTable(doc, ['#', 'Topic Discussed', 'Remarks / Decision'],
        agenda.map(a => [a.item_no, a.topic, a.remarks]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Action Items Table
    currentY = drawSectionHeader(doc, 'ACTION ITEMS', currentY, contentWidth, primaryFont);
    const actions = Array.isArray(data.actions) ? data.actions : [];
    currentY = drawTable(doc, ['Action Required', 'Responsible', 'Target Date', 'Status'],
        actions.map(a => [a.action, a.responsible, a.target_date, a.status]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);

    // Summary
    if (data.summary_notes) {
        currentY = drawSectionHeader(doc, 'MEETING SUMMARY', currentY, contentWidth, primaryFont);
        doc.setFontSize(8);
        doc.setFont(primaryFont, 'normal');
        const summaryLines = doc.splitTextToSize(data.summary_notes, contentWidth - 4);
        doc.text(summaryLines, 14, currentY);
        currentY += summaryLines.length * 4 + 4;
    }

    return currentY;
};
