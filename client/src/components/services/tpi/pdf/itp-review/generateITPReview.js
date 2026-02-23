import { drawInfoRow, drawSectionHeader, drawTable } from '@/components/services/common/pdf/PdfUtils';

export const generateITPReview = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    // Header info
    const rows = [
        ["CLIENT:", data.client_name, "ITP REF NO:", data.itp_ref],
        ["DATE:", data.date, "REVISION NO:", data.revision_no],
        ["VENDOR:", data.vendor_name, "PROJECT / PO:", data.project_name]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    if (data.scope) {
        currentY += 2;
        currentY = drawInfoRow(doc, "SCOPE OF REVIEW:", data.scope, "", "", currentY, contentWidth, primaryFont);
    }
    currentY += 4;

    // ITP Checklist Table
    currentY = drawSectionHeader(doc, 'ITP REVIEW CHECKLIST', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.review_items) ? data.review_items : [];
    currentY = drawTable(doc,
        ['Inspection Activity', 'Doc Ref', 'H/W/R', 'Accepted', 'Comments'],
        items.map(i => [i.activity, i.document_ref, i.hold_witness, i.accepted, i.comments]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Conclusion
    if (data.overall_status || data.comments) {
        currentY = drawSectionHeader(doc, 'CONCLUSION', currentY, contentWidth, primaryFont);
        currentY = drawInfoRow(doc, "OVERALL ITP STATUS:", data.overall_status, "", "", currentY, contentWidth, primaryFont);
        if (data.comments) {
            const lines = doc.splitTextToSize(`Reviewer Comments: ${data.comments}`, contentWidth - 4);
            doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
            doc.text(lines, 14, currentY);
            currentY += lines.length * 4 + 2;
        }
    }

    return currentY;
};
