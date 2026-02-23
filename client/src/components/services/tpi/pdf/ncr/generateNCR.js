import { drawInfoRow, drawSectionHeader } from '@/components/services/common/pdf/PdfUtils';

export const generateNCR = (doc, data, currentY, contentWidth, primaryFont) => {
    const rows = [
        ["CLIENT:", data.client_name, "NCR NO:", data.report_no],
        ["DATE RAISED:", data.date, "VENDOR / RESPONSIBLE PARTY:", data.vendor_name],
        ["LOCATION / STAGE:", data.location, "PO NUMBER:", data.po_number],
        ["ITEM / COMPONENT:", data.item_desc, "", ""]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Non-Conformance Details
    currentY = drawSectionHeader(doc, 'NON-CONFORMANCE DETAILS', currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "SEVERITY:", data.severity, "REQUIREMENT REF:", data.requirement_ref, currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "QUANTITY AFFECTED:", data.qty_affected, "", "", currentY, contentWidth, primaryFont);
    if (data.description) {
        const lines = doc.splitTextToSize(`Description: ${data.description}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 4;
    }

    // Disposition
    currentY = drawSectionHeader(doc, 'DISPOSITION & CORRECTIVE ACTION', currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "DISPOSITION:", data.disposition, "NCR STATUS:", data.status, currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "TARGET CLOSURE DATE:", data.closure_date, "", "", currentY, contentWidth, primaryFont);
    if (data.root_cause) {
        const lines = doc.splitTextToSize(`Root Cause: ${data.root_cause}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }
    if (data.corrective_action) {
        const lines = doc.splitTextToSize(`Corrective Action: ${data.corrective_action}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
