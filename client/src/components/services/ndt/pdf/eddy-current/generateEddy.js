import { MARGIN, drawInfoRow, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';
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

export const generateEddy = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate) =>
    generateGenericNDT(doc, data, currentY, contentWidth, primaryFont, "EDDY CURRENT TESTING", checkPageBreak, drawTemplate);
