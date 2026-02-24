import { MARGIN, drawInfoRow, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';
import autoTable from 'jspdf-autotable';

export const generateNDTSummary = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    // 1. Report Header (Client, Report No, Date, Vendor, Location)
    currentY = drawReportHeader(doc, data, currentY, contentWidth, primaryFont);

    // 2. Basic Info
    const basicInfo = [
        ["MATERIAL SPEC:", data.material_spec, "PROCEDURE NO:", data.procedure_no],
        ["THICKNESS:", data.thickness, "ACCEPTANCE STANDARD:", data.acceptance_std]
    ];

    basicInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    const eqHeight = 28;
    doc.rect(MARGIN, currentY, contentWidth, eqHeight);
    doc.line(MARGIN, currentY + 7, MARGIN + contentWidth, currentY + 7);
    doc.line(MARGIN, currentY + 14, MARGIN + contentWidth, currentY + 14);
    doc.line(MARGIN, currentY + 21, MARGIN + contentWidth, currentY + 21);

    doc.setFont(primaryFont, "bold");
    doc.text("INSTRUMENT MAKE:", MARGIN + 2, currentY + 5);
    const imkW = doc.getTextWidth("INSTRUMENT MAKE:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.instrument_make || ''), MARGIN + 2 + imkW + 2, currentY + 5);

    doc.setFont(primaryFont, "bold");
    doc.text("INSTRUMENTS ID:", MARGIN + (contentWidth / 2) + 2, currentY + 5);
    const iidW = doc.getTextWidth("INSTRUMENTS ID:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.instrument_id || ''), MARGIN + (contentWidth / 2) + 2 + iidW + 2, currentY + 5);

    currentY += eqHeight + 5;

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
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], fillColor: null },
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
