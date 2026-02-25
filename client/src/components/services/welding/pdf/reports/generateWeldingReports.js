// --- Constants ---
const MARGIN = 15;
const BOX_PAD = 2;

// --- Drawing Helpers ---
const drawInfoRow = (doc, label1, value1, label2, value2, y, contentWidth, fontName = "times") => {
    const rowH = 7;
    doc.rect(MARGIN, y, contentWidth, rowH);
    const mid = MARGIN + (contentWidth / 2);
    const textY = y + 5;

    doc.setFontSize(11);
    doc.setFont(fontName, "bold");
    doc.text(label1, MARGIN + BOX_PAD, textY);

    const label1Width = doc.getTextWidth(label1);
    doc.setFont(fontName, "normal");
    doc.text(String(value1 || ''), MARGIN + BOX_PAD + label1Width + BOX_PAD, textY);

    if (label2) {
        doc.setFont(fontName, "bold");
        doc.text(label2, mid + BOX_PAD, textY);

        const label2Width = doc.getTextWidth(label2);
        doc.setFont(fontName, "normal");
        doc.text(String(value2 || ''), mid + BOX_PAD + label2Width + BOX_PAD, textY);
    }

    return y + rowH;
};

const drawReportHeader = (doc, data, currentY, contentWidth, primaryFont) => {
    const headerFields = [
        ["CLIENT:", data.client_name || 'N/A', "REPORT NO:", data.report_no || 'Auto-Generated'],
        ["VENDOR:", data.vendor_name || 'N/A', "DATE:", data.date ? new Date(data.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')],
        ["ITEM:", data.item_tested || data.item || data.item_details || 'N/A', null],
        ["LOCATION:", data.location || data.site_location || 'N/A', null]
    ];

    headerFields.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    return currentY + 2;
};

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

