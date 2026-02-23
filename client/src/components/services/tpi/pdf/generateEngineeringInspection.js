import { MARGIN, drawInfoRow, drawSectionHeader, drawTable, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';

export const generateEngineeringInspection = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    // 1. Report Header (Client, Report No, Date, Vendor, Location)
    currentY = drawReportHeader(doc, data, currentY, contentWidth, primaryFont);

    // 2. Additional Fields (Drawing Ref, PO Number)
    const extraInfo = [
        ["PO NUMBER:", data.po_number || 'N/A', "DRAWING / SPEC REF:", data.drawing_ref || 'N/A']
    ];

    extraInfo.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    if (data.scope) {
        const lines = doc.splitTextToSize(`Scope: ${data.scope}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }
    currentY += 4;

    // Inspection Findings Table
    currentY = drawSectionHeader(doc, 'INSPECTION FINDINGS', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.findings) ? data.findings : [];
    currentY = drawTable(doc,
        ['Item No', 'Finding Description', 'Code / Std Reference', 'Result', 'Remarks'],
        items.map(i => [i.item_no, i.description, i.reference, i.result, i.remarks]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Conclusion
    currentY = drawSectionHeader(doc, 'CONCLUSION', currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "OVERALL RESULT:", data.overall_result, "", "", currentY, contentWidth, primaryFont);
    if (data.remarks) {
        const lines = doc.splitTextToSize(`Inspector Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
