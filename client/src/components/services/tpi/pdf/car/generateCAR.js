import { drawInfoRow, drawSectionHeader, drawTable } from '@/components/services/common/pdf/PdfUtils';

export const generateCAR = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const rows = [
        ["CLIENT:", data.client_name, "CAR NO:", data.report_no],
        ["DATE ISSUED:", data.date, "ISSUED TO (VENDOR):", data.vendor_name],
        ["NCR REFERENCE:", data.ncr_ref, "PO NUMBER:", data.po_number]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Problem Analysis
    currentY = drawSectionHeader(doc, 'PROBLEM ANALYSIS', currentY, contentWidth, primaryFont);
    const textFields = [
        ['Problem Description', data.problem_description],
        ['Root Cause Analysis', data.root_cause],
        ['Immediate / Containment Action', data.immediate_action]
    ];
    textFields.forEach(([label, value]) => {
        if (value) {
            const lines = doc.splitTextToSize(`${label}: ${value}`, contentWidth - 4);
            doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
            doc.text(lines, 14, currentY); currentY += lines.length * 4 + 3;
        }
    });
    currentY += 2;

    // Corrective Action Plan Table
    currentY = drawSectionHeader(doc, 'CORRECTIVE ACTION PLAN', currentY, contentWidth, primaryFont);
    const items = Array.isArray(data.corrective) ? data.corrective : [];
    currentY = drawTable(doc,
        ['Corrective Action', 'Responsible', 'Target Date', 'Status'],
        items.map(i => [i.action, i.responsible, i.target_date, i.status]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Closure
    currentY = drawSectionHeader(doc, 'CLOSURE', currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "VERIFICATION METHOD:", data.verification_method, "CAR STATUS:", data.status, currentY, contentWidth, primaryFont);
    currentY = drawInfoRow(doc, "CLOSURE DATE:", data.closure_date, "", "", currentY, contentWidth, primaryFont);
    if (data.remarks) {
        const lines = doc.splitTextToSize(`Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
