import { drawInfoRow, drawSectionHeader } from '@/components/services/common/pdf/PdfUtils';

export const generateReleaseNote = (doc, data, currentY, contentWidth, primaryFont) => {
    const rows = [
        ["CLIENT:", data.client_name, "RELEASE NOTE NO:", data.report_no],
        ["DATE:", data.date, "VENDOR / MANUFACTURER:", data.vendor_name],
        ["PO NUMBER:", data.po_number, "", ""],
        ["ITEM / MATERIAL:", data.item_desc, "QUANTITY RELEASED:", data.quantity],
        ["AUTHORIZED BY:", data.authorized_by, "", ""]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Certificate References
    if (data.cert_refs) {
        currentY = drawSectionHeader(doc, 'CERTIFICATE REFERENCES', currentY, contentWidth, primaryFont);
        const lines = doc.splitTextToSize(data.cert_refs, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 4;
    }

    // Remarks / Conditions
    if (data.remarks) {
        currentY = drawSectionHeader(doc, 'REMARKS / CONDITIONS', currentY, contentWidth, primaryFont);
        const lines = doc.splitTextToSize(data.remarks, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
