import { MARGIN, drawInfoRow } from '@/components/services/common/pdf/PdfUtils';

const generateGenericSafety = (doc, data, currentY, contentWidth, primaryFont, title) => {
    doc.setFont(primaryFont, "bold");
    doc.text(`${title} REPORT`, MARGIN + 2, currentY + 5);
    currentY += 10;
    const info = [
        ["PROJECT:", data.project_name, "CLIENT:", data.client_name],
        ["DATE:", data.date, "LOCATION:", data.location],
        ["INSPECTOR:", data.inspector_name, "RESULT:", data.result]
    ];
    info.forEach(row => { currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont); });
    if (data.remarks) {
        currentY += 3;
        const lines = doc.splitTextToSize(`Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, MARGIN + 2, currentY); currentY += lines.length * 4 + 2;
    }
    return currentY;
};

export const generateSafetyAudit = (doc, data, cy, cw, pf) => generateGenericSafety(doc, data, cy, cw, pf, "SAFETY AUDIT");
