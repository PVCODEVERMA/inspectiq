import { drawInfoRow, drawSectionHeader, drawTable } from '@/components/services/common/pdf/PdfUtils';

export const generateInProcess = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const rows = [
        ["CLIENT:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "VENDOR:", data.vendor_name],
        ["LOCATION:", data.location, "MANUFACTURING STAGE:", data.stage],
        ["DRAWING / SPEC NO:", data.drawing_no, "", ""]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Checklist Table
    currentY = drawSectionHeader(doc, 'IN-PROCESS INSPECTION CHECKLIST', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.inspection) ? data.inspection : [];
    currentY = drawTable(doc,
        ['Parameter', 'Requirement', 'Actual', 'Result', 'Remarks'],
        items.map(i => [i.parameter, i.required, i.actual, i.result, i.remarks]),
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
