import { drawInfoRow, drawSectionHeader, drawTable } from '@/components/services/common/pdf/PdfUtils';

export const generatePreDispatch = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const rows = [
        ["CLIENT:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "VENDOR / SUPPLIER:", data.vendor_name],
        ["LOCATION:", data.location, "DESTINATION:", data.destination],
        ["ITEM DESCRIPTION:", data.item_desc, "QUANTITY:", data.quantity]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Pre-Dispatch Checklist Table
    currentY = drawSectionHeader(doc, 'PRE-DISPATCH INSPECTION CHECKLIST', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.inspection) ? data.inspection : [];
    currentY = drawTable(doc,
        ['Check Item', 'Requirement', 'Actual Observation', 'Result'],
        items.map(i => [i.check_item, i.required, i.actual, i.result]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Conclusion
    const conclusionRows = [
        ["PACKING CONDITION:", data.packing_condition, "MARKING & LABELING:", data.marking_labeling],
        ["OVERALL RESULT:", data.overall_result, "", ""]
    ];
    conclusionRows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    if (data.remarks) {
        const lines = doc.splitTextToSize(`Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
