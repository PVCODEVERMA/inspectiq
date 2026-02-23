import { drawInfoRow, drawSectionHeader, drawTable } from '@/components/services/common/pdf/PdfUtils';

export const generateNDTWitness = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const rows = [
        ["CLIENT:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "NDT CONTRACTOR:", data.vendor_name],
        ["LOCATION:", data.location, "NDT METHOD:", data.ndt_type],
        ["PROCEDURE REF:", data.procedure_ref, "OPERATOR NAME:", data.operator_name],
        ["OPERATOR CERT LEVEL:", data.operator_cert, "", ""]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Witnessed Items Table
    currentY = drawSectionHeader(doc, 'WITNESSED ITEMS', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.witness) ? data.witness : [];
    currentY = drawTable(doc,
        ['Item / Joint ID', 'Area Tested', 'Technique', 'Result', 'Remarks'],
        items.map(i => [i.item_id, i.area_tested, i.technique, i.result, i.remarks]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Conclusion
    currentY = drawInfoRow(doc, "OVERALL WITNESS RESULT:", data.overall_result, "", "", currentY, contentWidth, primaryFont);
    if (data.remarks) {
        const lines = doc.splitTextToSize(`Inspector Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
