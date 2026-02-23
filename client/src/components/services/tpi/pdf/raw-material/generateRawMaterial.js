import { drawInfoRow, drawSectionHeader, drawTable } from '@/components/services/common/pdf/PdfUtils';

export const generateRawMaterial = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const rows = [
        ["CLIENT:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "VENDOR / SUPPLIER:", data.vendor_name],
        ["LOCATION:", data.location, "MATERIAL TYPE:", data.material_type],
        ["HEAT / BATCH NO:", data.heat_no, "CERT NO:", data.cert_no],
        ["QUANTITY INSPECTED:", data.quantity, "", ""]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Inspection Results Table
    currentY = drawSectionHeader(doc, 'INSPECTION RESULTS', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.inspection) ? data.inspection : [];
    currentY = drawTable(doc,
        ['Parameter Checked', 'Required Value', 'Actual Value', 'Result'],
        items.map(i => [i.parameter, i.required, i.actual, i.result]),
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
