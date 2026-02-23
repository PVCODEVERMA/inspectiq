import { drawInfoRow, drawSectionHeader, drawTable } from '@/components/services/common/pdf/PdfUtils';

export const generateDimensional = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const rows = [
        ["CLIENT:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "VENDOR:", data.vendor_name],
        ["LOCATION:", data.location, "DRAWING NO:", data.drawing_no],
        ["COMPONENT / ITEM:", data.component_name, "INSTRUMENT USED:", data.instrument_used]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Measurements Table
    currentY = drawSectionHeader(doc, 'DIMENSIONAL MEASUREMENTS', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.measurements) ? data.measurements : [];
    currentY = drawTable(doc,
        ['Parameter', 'Required (mm)', 'Tolerance (±)', 'Actual (mm)', 'Result'],
        items.map(i => [i.parameter, i.required, i.tolerance, i.actual, i.result]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Conclusion
    currentY = drawInfoRow(doc, "OVERALL RESULT:", data.overall_result, "", "", currentY, contentWidth, primaryFont);
    if (data.remarks) {
        const lines = doc.splitTextToSize(`Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
