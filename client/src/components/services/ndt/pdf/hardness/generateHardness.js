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

import autoTable from 'jspdf-autotable';

const generateGenericNDT = (doc, data, currentY, contentWidth, primaryFont, title, checkPageBreak, drawTemplate) => {
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

    // --- TEST RESULTS Section ---
    currentY = checkPageBreak(currentY, 30);
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(11);
    doc.text("TEST RESULTS", MARGIN, currentY + 5);
    currentY += 8;

    const resultsCols = [
        { header: 'ITEM NAME', dataKey: 'item_name' },
        { header: 'NUMBER OF BARRAGE', dataKey: 'barrage_no' },
        { header: 'QTY', dataKey: 'qty' },
        { header: 'OBSERVATIONS', dataKey: 'observations' },
        { header: 'RESULT', dataKey: 'result' }
    ];

    const tableData = (data.results && data.results.length > 0)
        ? data.results
        : Array(5).fill({});

    autoTable(doc, {
        startY: currentY,
        columns: resultsCols,
        body: tableData,
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
        didDrawPage: (d) => {
            if (d.pageNumber > 1 && drawTemplate) {
                drawTemplate(d.pageNumber);
                doc.setFont(primaryFont, "normal");
            }
        }
    });

    return doc.lastAutoTable.finalY + 5;
};

export const generateHardness = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate) =>
    generateGenericNDT(doc, data, currentY, contentWidth, primaryFont, "HARDNESS TESTING", checkPageBreak, drawTemplate);
