import { drawInfoRow, drawSectionHeader, drawTable } from '@/components/services/common/pdf/PdfUtils';

export const generateFAT = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const rows = [
        ["CLIENT:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "MANUFACTURER:", data.vendor_name],
        ["TEST LOCATION:", data.location, "EQUIPMENT NAME:", data.equipment_name],
        ["EQUIPMENT TAG NO:", data.equipment_tag, "SERIAL NO:", data.serial_no]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // FAT Checklist Table
    currentY = drawSectionHeader(doc, 'FACTORY ACCEPTANCE TEST CHECKLIST', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.checklist) ? data.checklist : [];
    currentY = drawTable(doc,
        ['Test / Check Item', 'Method', 'Acceptance Criteria', 'Result', 'Remarks'],
        items.map(i => [i.test_item, i.method, i.acceptance_criteria, i.result, i.remarks]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Conclusion
    currentY = drawInfoRow(doc, "FAT RESULT:", data.overall_result, "", "", currentY, contentWidth, primaryFont);
    if (data.punch_items) {
        const lines = doc.splitTextToSize(`Punch List Items: ${data.punch_items}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }
    if (data.remarks) {
        const lines = doc.splitTextToSize(`Final Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
