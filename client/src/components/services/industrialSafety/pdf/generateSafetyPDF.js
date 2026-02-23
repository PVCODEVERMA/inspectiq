import { MARGIN, drawInfoRow, drawCheckboxGroup } from './PdfUtils';

export const generateSafetyPDF = (doc, data, currentY, contentWidth, primaryFont) => {
    // Key Safety Info
    const safetyInfo = [
        ["AUDIT TYPE:", data.audit_type, "AUDITOR:", data.auditor_name],
        ["LOCATION:", data.location, "DATE:", data.inspection_date]
    ];

    safetyInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 5;

    // Compliance Checklist Section (Example)
    const checklistY = currentY;
    doc.rect(MARGIN, checklistY, contentWidth, 30);

    doc.setFont(primaryFont, "bold");
    doc.text("COMPLIANCE SUMMARY", MARGIN + 2, checklistY + 5);

    // Checkboxes for compliance
    drawCheckboxGroup(doc, "PPE Compliance:", ["Pass", "Fail"], data.ppe_compliance, MARGIN + 2, checklistY + 12, primaryFont);
    drawCheckboxGroup(doc, "Fire Safety:", ["Pass", "Fail"], data.fire_safety, MARGIN + 2, checklistY + 20, primaryFont);
    drawCheckboxGroup(doc, "Work Permits:", ["Pass", "Fail"], data.work_permits, MARGIN + (contentWidth / 2), checklistY + 12, primaryFont);

    currentY += 35;
    return currentY;
};
