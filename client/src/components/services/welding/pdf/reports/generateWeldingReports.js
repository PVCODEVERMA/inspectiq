import { MARGIN, drawInfoRow, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';
import { generateWeldAuditAction } from './generateWeldAuditAction';

const generateGenericWeld = (doc, data, currentY, contentWidth, primaryFont, title) => {
    // 1. Report Header
    currentY = drawReportHeader(doc, data, currentY, contentWidth, primaryFont);

    doc.setFont(primaryFont, "bold");
    doc.text(`${title}`, MARGIN + 2, currentY + 5);
    currentY += 10;
    const info = [
        ["WPS NO:", data.wps_no, "PQR NO:", data.pqr_no],
        ["PROCESS:", data.welding_process, "WELDER ID:", data.welder_id]
    ];
    info.forEach(row => { currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont); });
    currentY += 5;
    return currentY;
};

export const generateWPSReview = (doc, data, cy, cw, pf) => generateGenericWeld(doc, data, cy, cw, pf, "WPS REVIEW");
export const generatePQRApproval = (doc, data, cy, cw, pf) => generateGenericWeld(doc, data, cy, cw, pf, "PQR APPROVAL");
export const generateWQTReport = (doc, data, cy, cw, pf) => generateGenericWeld(doc, data, cy, cw, pf, "WELDER QUALIFICATION TEST");

// Use the detailed action for Welding Audit
export const generateWeldAudit = (doc, data, cy, cw, pf, checkPageBreak, drawTemplate, getBase64Image) =>
    generateWeldAuditAction(doc, data, cy, cw, pf, checkPageBreak, drawTemplate, getBase64Image);

export const generateWeldInsp = (doc, data, cy, cw, pf) => generateGenericWeld(doc, data, cy, cw, pf, "WELDING INSPECTION");
export const generateRepairWeld = (doc, data, cy, cw, pf) => generateGenericWeld(doc, data, cy, cw, pf, "REPAIR WELDING REPORT");
export const generatePWHTMon = (doc, data, cy, cw, pf) => generateGenericWeld(doc, data, cy, cw, pf, "PWHT MONITORING");
export const generateWeldMap = (doc, data, cy, cw, pf) => generateGenericWeld(doc, data, cy, cw, pf, "WELD MAP RECORD");

