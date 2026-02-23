import { MARGIN, drawInfoRow } from './PdfUtils';

export const generateISOPDF = (doc, data, currentY, contentWidth, primaryFont) => {
    // Audit Details
    const auditInfo = [
        ["STANDARD:", data.iso_standard, "AUDIT TYPE:", data.audit_type],
        ["LEAD AUDITOR:", data.lead_auditor, "AUDIT DATES:", data.audit_dates]
    ];

    auditInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    // Scope
    const scopeHeight = 20;
    doc.rect(MARGIN, currentY, contentWidth, scopeHeight);
    doc.setFont(primaryFont, "bold");
    doc.text("AUDIT SCOPE:", MARGIN + 2, currentY + 5);
    doc.setFont(primaryFont, "normal");

    if (data.audit_scope) {
        const splitScope = doc.splitTextToSize(data.audit_scope, contentWidth - 4);
        doc.text(splitScope, MARGIN + 2, currentY + 12);
    }

    currentY += scopeHeight + 5;
    return currentY;
};
