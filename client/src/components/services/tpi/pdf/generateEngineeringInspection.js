import { MARGIN, drawInfoRow, drawSectionHeader, drawTable, drawReportHeader, drawCheckboxGroup } from '@/components/services/common/pdf/PdfUtils';
import { format } from 'date-fns';

export const generateEngineeringInspection = async (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const fontName = primaryFont;

    // Helper to draw Box Border
    const drawBox = (y, height, title, labelWidth = 40) => {
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.2);
        doc.rect(MARGIN, y, contentWidth, height);
        if (title) {
            doc.setFont(fontName, 'bold');
            doc.setFontSize(8);
            const titleLines = doc.splitTextToSize(title, labelWidth - 5);
            doc.text(titleLines, MARGIN + 2, y + 6);
            // vertical line for label box
            doc.line(MARGIN + labelWidth, y, MARGIN + labelWidth, y + height);
        }
    };

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- PAGE 1 ---
    currentY = 55; // Start at top since header is removed

    // Sidebar width for indenting rows in lower boxes
    const SIDEBAR_W = 42;

    // Box 1: PROJECT / REPORT# / CLIENT / DATE# / VENDOR / INSPECTION LOCATION
    const box1H = 28;
    drawBox(currentY, box1H);
    const dateStr = data.inspection_date ? format(new Date(data.inspection_date), 'do MMM-yyyy').toUpperCase() : 'N/A';
    currentY = drawInfoRow(doc, "PROJECT:", data.project_name || 'N/A', "REPORT#:", data.report_no || 'N/A', currentY, contentWidth, fontName, 8, 25, 0);
    currentY = drawInfoRow(doc, "CLIENT:", data.client_name || 'N/A', "DATE#:", dateStr, currentY, contentWidth, fontName, 8, 25, 0);
    currentY = drawInfoRow(doc, "VENDOR:", data.vendor_name || 'N/A', "", "", currentY, contentWidth, fontName, 8, 25, 0);
    currentY = drawInfoRow(doc, "INSPECTION LOCATION:", data.location || 'N/A', "", "", currentY, contentWidth, fontName, 8, 35, 0);
    currentY += 2;

    // Box 2: DATE OF INSPECTION / PO# / RFI / ITP/QAP
    const box2H = 14;
    drawBox(currentY, box2H);
    currentY = drawInfoRow(doc, "DATE OF INSPECTION#:", dateStr, "PO#:", data.po_number || 'N/A', currentY, contentWidth, fontName, 8, 35, 0);
    currentY = drawInfoRow(doc, "RFI / NOTIFICATION #:", data.rfi_number || 'N/A', "ITP/QAP#:", data.itp_qap_number || 'N/A', currentY, contentWidth, fontName, 8, 35, 0);
    currentY += 4;

    // Box 3: SCOPE OF INSECTION
    const scopeOptions = ['PIM', 'IN PROCESS', 'FINAL', 'MECHANICAL', 'ELECTRICAL', 'INSTRUMENTATION', 'Visual', 'Dimensions', 'Painting', 'Document review', 'DT Witness', 'NDT Witness', 'TPM', 'FAT'];
    const selectedScope = Array.isArray(data.scope_selection) ? data.scope_selection : [];
    const box3H = 30;
    drawBox(currentY, box3H, "SCOPE OF\nINSECTION", SIDEBAR_W);
    drawCheckboxGroup(doc, "", scopeOptions.slice(0, 1), selectedScope, MARGIN + SIDEBAR_W + 2, currentY + 6, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(1, 2), selectedScope, MARGIN + SIDEBAR_W + 43, currentY + 6, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(2, 3), selectedScope, MARGIN + SIDEBAR_W + 82, currentY + 6, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(3, 4), selectedScope, MARGIN + SIDEBAR_W + 2, currentY + 13, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(4, 5), selectedScope, MARGIN + SIDEBAR_W + 43, currentY + 13, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(5, 6), selectedScope, MARGIN + SIDEBAR_W + 82, currentY + 13, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(6, 7), selectedScope, MARGIN + SIDEBAR_W + 2, currentY + 20, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(7, 8), selectedScope, MARGIN + SIDEBAR_W + 25, currentY + 20, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(8, 9), selectedScope, MARGIN + SIDEBAR_W + 55, currentY + 20, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(9, 10), selectedScope, MARGIN + SIDEBAR_W + 82, currentY + 20, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(10, 11), selectedScope, MARGIN + SIDEBAR_W + 2, currentY + 27, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(11, 12), selectedScope, MARGIN + SIDEBAR_W + 25, currentY + 27, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(12, 13), selectedScope, MARGIN + SIDEBAR_W + 55, currentY + 27, fontName, 8);
    drawCheckboxGroup(doc, "", scopeOptions.slice(13, 14), selectedScope, MARGIN + SIDEBAR_W + 82, currentY + 27, fontName, 8);
    currentY += box3H + 2;

    // Box 4: INSPECTION SUMMARY
    const box4H = 20;
    currentY = checkPageBreak(doc, currentY, pageHeight, box4H + 4, null, 20);
    drawBox(currentY, box4H, "INSPECTION\nSUMMARY", SIDEBAR_W);
    doc.setFont(fontName, 'normal'); doc.setFontSize(8);
    doc.text("Non-Conformity Report Issued During This Visit:", MARGIN + SIDEBAR_W + 2, currentY + 6);
    drawCheckboxGroup(doc, "", ['Yes'], [data.ncr_issued === 'Yes' ? 'Yes' : ''], MARGIN + SIDEBAR_W + 84, currentY + 6, fontName, 8);
    drawCheckboxGroup(doc, "", ['No'], [data.ncr_issued === 'No' ? 'No' : 'No'], MARGIN + SIDEBAR_W + 98, currentY + 6, fontName, 8);
    doc.text("Order Completed:", MARGIN + SIDEBAR_W + 2, currentY + 12);
    drawCheckboxGroup(doc, "", ['Yes'], [data.order_completed === 'Yes' ? 'Yes' : 'Yes'], MARGIN + SIDEBAR_W + 84, currentY + 12, fontName, 8);
    drawCheckboxGroup(doc, "", ['No'], [data.order_completed === 'No' ? 'No' : ''], MARGIN + SIDEBAR_W + 98, currentY + 12, fontName, 8);
    drawCheckboxGroup(doc, "", ['Satisfactory'], [data.overall_result === 'Satisfactory' ? 'Satisfactory' : 'Satisfactory'], MARGIN + SIDEBAR_W + 2, currentY + 18, fontName, 8);
    drawCheckboxGroup(doc, "", ['Not Satisfactory'], [data.overall_result === 'Not Satisfactory' ? 'Not Satisfactory' : ''], MARGIN + SIDEBAR_W + 37, currentY + 18, fontName, 8);
    drawCheckboxGroup(doc, "", ['Conditional'], [data.overall_result === 'Conditional' ? 'Conditional' : ''], MARGIN + SIDEBAR_W + 82, currentY + 18, fontName, 8);
    currentY += box4H + 2;

    // Box 5: OFFERED ITEMS
    const offeredHeader = ['SR. NO.', 'ITEM DESCRIPTION', 'INSPECTED QTY.', 'ACCEPTED QTY.'];
    let offeredRows = (data.offered_items || []).map(i => [i.sr_no || '', i.description || '', i.inspected_qty || '', i.accepted_qty || '']);
    if (offeredRows.length === 0) offeredRows = [['01', '', '', ''], ['02', '', '', ''], ['03', '', '', '']];
    const tableH = (offeredRows.length + 1) * 7.5;
    currentY = checkPageBreak(doc, currentY, pageHeight, tableH + 4, null, 20);
    drawBox(currentY, tableH, "OFFERED ITEMS", SIDEBAR_W);
    currentY = drawTable(doc, offeredHeader, offeredRows, currentY, contentWidth - SIDEBAR_W, fontName, checkPageBreak, null, SIDEBAR_W);
    currentY += 4;

    // Box 6: INSPECTION DETAILS
    const observationText = data.detailed_observation || "Inspection Carried out as per notification & referral docs, inspection result found as below details.\n\u2022 Visual inspection carried out of fire lines, verified layout as per drawing & found in order, no defect or damage observed.\n\u2022 Hydro test witnessed of above items at test pressure (450 Kg/Cm2), no leakage or pressure drop observed during holding time, test result found satisfactory.";
    const detailLines = doc.splitTextToSize(observationText, contentWidth - SIDEBAR_W - 5);
    const detailH = Math.max(30, detailLines.length * 4.5 + 5);
    currentY = checkPageBreak(doc, currentY, pageHeight, detailH + 4, null, 20);
    drawBox(currentY, detailH, "INSPECTION\nDETAILS", SIDEBAR_W);
    doc.setFontSize(8); doc.setFont(fontName, 'normal');
    doc.text(detailLines, MARGIN + SIDEBAR_W + 2, currentY + 7);
    currentY += detailH + 2;

    // Box 7: ATTENDEES
    const attendeesHeader = ['NAME', 'POSITION', 'COMPANY NAME', 'CONTACT NO'];
    let attendeeRows = (data.attendees || []).map(a => [a.name, a.position, a.company, a.contact]);
    if (attendeeRows.length === 0) attendeeRows = [['', '', '', ''], ['', '', '', '']];
    const attH = (attendeeRows.length + 1) * 7.5;
    currentY = checkPageBreak(doc, currentY, pageHeight, attH + 4, null, 20);
    drawBox(currentY, attH, "ATTENDEES", SIDEBAR_W);
    currentY = drawTable(doc, attendeesHeader, attendeeRows, currentY, contentWidth - SIDEBAR_W, fontName, checkPageBreak, null, SIDEBAR_W);

    // --- PAGE 2 ---
    doc.addPage();
    currentY = 20;

    // Box 1: REFERRED DOCUMENTS
    const refDocsHeader = ['SR NO', 'DOCUMENT TITLE', 'DOCUMENT NO', 'REV / EDD'];
    const refDocsRows = (data.referred_documents || []).map(d => [d.sr_no || '', d.title || '', d.doc_no || '', d.rev_edd || '']);
    if (refDocsRows.length === 0) refDocsRows.push(['', '', '', ''], ['', '', '', '']);

    currentY = drawSectionHeader(doc, 'REFERRED DOCUMENTS', currentY, contentWidth, fontName);
    currentY = drawTable(doc, refDocsHeader, refDocsRows, currentY, contentWidth, fontName, checkPageBreak, null);
    currentY += 4;

    // Box 2: TEST INSTRUMENTS USED
    const instHeader = ['SR NO', 'INSTRUMENTS NAME', 'INSTRUMENT ID', 'CALIBRATION DUE DATE'];
    const instRows = (data.test_instruments || []).map(i => [i.sr_no || '', i.name || '', i.id_number || '', i.calibration_due || '']);
    if (instRows.length === 0) instRows.push(['', '', '', ''], ['', '', '', '']);

    currentY = drawSectionHeader(doc, 'TEST INSTRUMENTS USED', currentY, contentWidth, fontName);
    currentY = drawTable(doc, instHeader, instRows, currentY, contentWidth, fontName, checkPageBreak, null);
    currentY += 4;

    // Box 3: DOCUMENT ATTACHED (4 cols)
    const attachHeader = ['SR NO', 'DOCUMENTS TITLE', 'SR NO', 'DOCUMENTS TITLE'];
    const rawAttach = data.documents_attached || [];
    const attachRows = [];
    for (let i = 0; i < Math.max(rawAttach.length, 6); i += 2) {
        attachRows.push([
            rawAttach[i]?.sr_no || (i + 1).toString(), rawAttach[i]?.title || '',
            rawAttach[i + 1]?.sr_no || (rawAttach[i + 1] ? (i + 2).toString() : ''), rawAttach[i + 1]?.title || ''
        ]);
    }
    currentY = drawSectionHeader(doc, 'DOCUMENT ATTACHED', currentY, contentWidth, fontName);
    currentY = drawTable(doc, attachHeader, attachRows, currentY, contentWidth, fontName, checkPageBreak, null);
    currentY += 6;

    // Box 4: SIGNATURES
    currentY = checkPageBreak(doc, currentY, pageHeight, 45, null, 20);
    const sigY = currentY;
    doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.2);
    doc.rect(MARGIN, sigY, contentWidth / 2, 40);
    doc.rect(MARGIN + contentWidth / 2, sigY, contentWidth / 2, 40);
    doc.line(MARGIN, sigY + 8, MARGIN + contentWidth, sigY + 8);
    doc.line(MARGIN, sigY + 28, MARGIN + contentWidth, sigY + 28);

    doc.setFont(fontName, 'bold'); doc.setFontSize(8);
    doc.text("INSPECTED BY:", MARGIN + 2, sigY + 6);
    doc.text("REVIEWED BY (CLIENT):", MARGIN + (contentWidth / 2) + 2, sigY + 6);

    doc.setFont(fontName, 'normal');
    doc.text("SIGNATURE:", MARGIN + 2, sigY + 18);
    doc.text("SIGNATURE:", MARGIN + (contentWidth / 2) + 2, sigY + 18);
    doc.text("DATE:", MARGIN + 2, sigY + 35);
    doc.text("DATE:", MARGIN + (contentWidth / 2) + 2, sigY + 35);

    if (data.inspector_signature_url) {
        const sigImg = await getBase64Image(data.inspector_signature_url);
        if (sigImg) doc.addImage(sigImg, 'PNG', MARGIN + 22, sigY + 10, 30, 15);
    }
    if (data.client_signature_url) {
        const clientSigImg = await getBase64Image(data.client_signature_url);
        if (clientSigImg) doc.addImage(clientSigImg, 'PNG', MARGIN + (contentWidth / 2) + 35, sigY + 10, 30, 15);
    }

    doc.setFontSize(9);
    if (data.inspector_date) doc.text(format(new Date(data.inspector_date), 'dd/MM/yyyy'), MARGIN + 22, sigY + 35);
    if (data.client_date) doc.text(format(new Date(data.client_date), 'dd/MM/yyyy'), MARGIN + (contentWidth / 2) + 35, sigY + 35);

    currentY += 45;

    // --- PAGE 3+: PHOTOS ---
    const photos = data.annotated_photos || [];
    if (photos.length > 0) {
        for (let i = 0; i < photos.length; i += 2) {
            doc.addPage();
            currentY = 20;

            // Photographs Title
            doc.setFont(fontName, 'bold'); doc.setFontSize(10);
            doc.text("PHOTOGRAPHS", pageWidth / 2, currentY + 5, { align: 'center' });
            doc.setFont(fontName, 'normal'); doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            doc.text("(Each photograph shall be re-named for activities)", pageWidth / 2, currentY + 10, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            currentY += 15;

            const boxW = contentWidth / 2;
            const photoH = 130; // Large photo area as seen in image
            const captionH = 8;

            // Outer Boxes and Middle Line
            doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.2);
            doc.rect(MARGIN, currentY, contentWidth, photoH);       // Top Photo row box
            doc.rect(MARGIN, currentY + photoH, contentWidth, captionH); // Bottom Caption row box
            doc.line(MARGIN + boxW, currentY, MARGIN + boxW, currentY + photoH + captionH); // Vertical center line

            for (let j = 0; j < 2; j++) {
                if (!photos[i + j]) break;
                const p = photos[i + j];
                const x = MARGIN + (j * boxW);
                const y = currentY;

                // Image
                const img = await getBase64Image(p.url);
                if (img) {
                    // Calculate aspect-fit for the cell
                    const pad = 2;
                    doc.addImage(img, 'JPEG', x + pad, y + pad, boxW - (pad * 2), photoH - (pad * 2), undefined, 'FAST');
                }

                // Caption
                doc.setFont(fontName, 'normal'); doc.setFontSize(8);
                doc.text(`PIC-${i + j + 1}: ${p.caption || ''}`, x + (boxW / 2), y + photoH + 5, { align: 'center', maxWidth: boxW - 4 });
            }
            currentY += photoH + captionH + 5;
        }
    }

    return currentY;
};
