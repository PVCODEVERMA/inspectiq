import { drawInfoRow, drawSectionHeader, drawTable } from '@/components/services/common/pdf/PdfUtils';

export const generatePIM = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    // Meeting Details
    const rows = [
        ["CLIENT / COMPANY:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "LOCATION:", data.location],
        ["PROJECT / ITEM:", data.project_name, "", ""]
    ];
    rows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Attendees Table
    currentY = drawSectionHeader(doc, 'ATTENDEES', currentY, contentWidth, primaryFont);
    const attendees = Array.isArray(data.attendees) ? data.attendees : [];
    currentY = drawTable(doc, ['Name', 'Company', 'Designation', 'Signature'],
        attendees.map(a => [a.name, a.company, a.designation, a.signature || '']),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Agenda Table
    currentY = drawSectionHeader(doc, 'AGENDA & DISCUSSION POINTS', currentY, contentWidth, primaryFont);
    const agenda = Array.isArray(data.agenda) ? data.agenda : [];
    currentY = drawTable(doc, ['#', 'Topic Discussed', 'Remarks / Decision'],
        agenda.map(a => [a.item_no, a.topic, a.remarks]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);
    currentY += 4;

    // Action Items Table
    currentY = drawSectionHeader(doc, 'ACTION ITEMS', currentY, contentWidth, primaryFont);
    const actions = Array.isArray(data.actions) ? data.actions : [];
    currentY = drawTable(doc, ['Action Required', 'Responsible', 'Target Date', 'Status'],
        actions.map(a => [a.action, a.responsible, a.target_date, a.status]),
        currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate);

    // Summary
    if (data.summary_notes) {
        currentY = drawSectionHeader(doc, 'MEETING SUMMARY', currentY, contentWidth, primaryFont);
        doc.setFontSize(8);
        doc.setFont(primaryFont, 'normal');
        const summaryLines = doc.splitTextToSize(data.summary_notes, contentWidth - 4);
        doc.text(summaryLines, 14, currentY);
        currentY += summaryLines.length * 4 + 4;
    }

    return currentY;
};
