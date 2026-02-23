import { MARGIN, drawInfoRow } from '@/components/services/common/pdf/PdfUtils';

const generateGenericISO = (doc, data, currentY, contentWidth, primaryFont, title) => {
    doc.setFont(primaryFont, "bold");
    doc.text(`${title} REPORT`, MARGIN + 2, currentY + 5);
    currentY += 10;
    const info = [
        ["ORGANIZATION:", data.client_name, "AUDIT NO:", data.report_no],
        ["DATE:", data.date, "LOCATION:", data.location],
        ["STANDARD:", data.iso_standard, "RESULT:", data.result]
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

export const generateInternalAudit = (doc, data, cy, cw, pf) => generateGenericISO(doc, data, cy, cw, pf, "INTERNAL AUDIT");
export const generateExternalAudit = (doc, data, cy, cw, pf) => generateGenericISO(doc, data, cy, cw, pf, "EXTERNAL AUDIT");
export const generateGapAnalysis = (doc, data, cy, cw, pf) => generateGenericISO(doc, data, cy, cw, pf, "GAP ANALYSIS");
export const generateMgmtReview = (doc, data, cy, cw, pf) => generateGenericISO(doc, data, cy, cw, pf, "MANAGEMENT REVIEW");
export const generateCARPlan = (doc, data, cy, cw, pf) => generateGenericISO(doc, data, cy, cw, pf, "CORRECTIVE ACTION PLAN");
export const generateISOCheck = (doc, data, cy, cw, pf) => generateGenericISO(doc, data, cy, cw, pf, "COMPLIANCE CHECK");
export const generateSurvAudit = (doc, data, cy, cw, pf) => generateGenericISO(doc, data, cy, cw, pf, "SURVEILLANCE AUDIT");
export const generateCertRec = (doc, data, cy, cw, pf) => generateGenericISO(doc, data, cy, cw, pf, "CERTIFICATION RECOMMENDATION");
