import { MARGIN, BOX_PAD, ROW_GAP, drawInfoRow, drawCheckbox, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';
import { format } from 'date-fns';

export const generateLPT = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {

    // ── 1. Report Header (Client / Report No / Vendor / Date / Item / Location) ──
    // drawReportHeader uses: CLIENT, VENDOR, ITEM, LOCATION rows
    const pageWidth = doc.internal.pageSize.width;
    const rowH = 7;

    // Manual header rows to match reference exactly
    const headerRows = [
        ["Client:", data.client_name || '', "Report No:", data.report_no || ''],
        ["Vendor:", data.vendor_name || '', "Date:", data.date ? format(new Date(data.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')],
        ["Item :", data.item || data.item_details || '', null, null],
        ["Inspection Location:", data.location || data.site_location || '', null, null],
    ];

    headerRows.forEach(([l1, v1, l2, v2]) => {
        currentY = drawInfoRow(doc, l1, v1, l2, v2, currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // ── 2. Process Info (Procedure No / Type of Penetrant / Acceptance Standard / Developer Form) ──
    currentY = checkPageBreak(currentY, 20);
    const procRows = [
        ["Procedure No:", data.procedure_no || '', "Type Of Penetrant:", data.penetrant_type || ''],
        ["Acceptance Standard:", data.acceptance_std || '', "Developer Form:", data.developer_form || ''],
    ];
    procRows.forEach(([l1, v1, l2, v2]) => {
        currentY = drawInfoRow(doc, l1, v1, l2, v2, currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // ── 3. Consumables Grid (Penetrant | Developer) ──
    currentY = checkPageBreak(currentY, 26);
    const gridH = 21;
    const col1X = MARGIN;
    const col2X = MARGIN + contentWidth / 2;

    // Outer border
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(MARGIN, currentY, contentWidth, gridH);

    // Horizontal lines inside grid
    doc.line(MARGIN, currentY + 7, MARGIN + contentWidth, currentY + 7);  // after header
    doc.line(MARGIN, currentY + 14, MARGIN + contentWidth, currentY + 14); // after make/batch

    // Vertical divider
    doc.line(col2X, currentY, col2X, currentY + gridH);

    // Row 1: "PENETRANT" / "DEVELOPER" column titles
    doc.setFontSize(10);
    doc.setFont(primaryFont, "bold");
    doc.text("Penetrant", col1X + (contentWidth / 4), currentY + 5, { align: 'center' });
    doc.text("Developer", col2X + (contentWidth / 4), currentY + 5, { align: 'center' });

    // Row 2: Make / Batch
    doc.setFontSize(9);
    doc.setFont(primaryFont, "bold");
    doc.text("Make:", col1X + BOX_PAD, currentY + 12);
    const mk1W = doc.getTextWidth("Make:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.penetrant_make || ''), col1X + BOX_PAD + mk1W + BOX_PAD, currentY + 12);

    doc.setFont(primaryFont, "bold");
    doc.text("Batch:", col1X + 46, currentY + 12);
    const bt1W = doc.getTextWidth("Batch:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.penetrant_batch || ''), col1X + 46 + bt1W + BOX_PAD, currentY + 12);

    doc.setFont(primaryFont, "bold");
    doc.text("Make:", col2X + BOX_PAD, currentY + 12);
    const mk2W = doc.getTextWidth("Make:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.developer_make || ''), col2X + BOX_PAD + mk2W + BOX_PAD, currentY + 12);

    doc.setFont(primaryFont, "bold");
    doc.text("Batch:", col2X + 46, currentY + 12);
    const bt2W = doc.getTextWidth("Batch:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.developer_batch || ''), col2X + 46 + bt2W + BOX_PAD, currentY + 12);

    // Row 3: Type / Form checkboxes
    doc.setFontSize(9);
    doc.setFont(primaryFont, "bold");
    doc.text("Type:", col1X + BOX_PAD, currentY + 19);
    const tW = doc.getTextWidth("Type:");

    doc.text("Form:", col2X + BOX_PAD, currentY + 19);
    const fW = doc.getTextWidth("Form:");
    doc.setFont(primaryFont, "normal");

    // Penetrant Type Checkboxes (Florescent / Non Florescent)
    const pType = Array.isArray(data.penetrant_type_check) ? data.penetrant_type_check : [];
    let pX = col1X + BOX_PAD + tW + 3;
    drawCheckbox(doc, pX, currentY + 19, 3, pType.includes("Florescent"));
    doc.text("Florescent", pX + 5, currentY + 19);
    pX += 28;
    drawCheckbox(doc, pX, currentY + 19, 3, pType.includes("Non Florescent"));
    doc.text("Non Florescent", pX + 5, currentY + 19);

    // Developer Form Checkboxes (Wet / Dry)
    const dForm = Array.isArray(data.developer_form_check) ? data.developer_form_check : [];
    let dX = col2X + BOX_PAD + fW + 3;
    drawCheckbox(doc, dX, currentY + 19, 3, dForm.includes("Wet"));
    doc.text("Wet", dX + 5, currentY + 19);
    dX += 18;
    drawCheckbox(doc, dX, currentY + 19, 3, dForm.includes("Dry"));
    doc.text("Dry", dX + 5, currentY + 19);

    currentY += gridH + 4;

    // ── 4. Test Parameters (Surface Temp / Dwell Time / Light Intensity / Developing Time) ──
    currentY = checkPageBreak(currentY, 18);
    const paramRows = [
        ["Surface Temp:", data.surface_temp || '', "Dwell Time:", data.dwell_time || ''],
        ["Light Intensity:", data.light_intensity || '', "Developing Time:", data.developing_time || ''],
    ];
    paramRows.forEach(([l1, v1, l2, v2]) => {
        currentY = drawInfoRow(doc, l1, v1, l2, v2, currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // ── 5. TEST RESULT Section ──
    currentY = checkPageBreak(currentY, 12);

    // "TEST RESULT" label (bold, above table - same as reference)
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(11);
    doc.text("TEST RESULT", MARGIN, currentY + 5);
    currentY += 8;

    // Table setup
    const colWidths = [
        contentWidth * 0.3,  // Item Name / Number
        contentWidth * 0.5,  // Observations
        contentWidth * 0.2,  // Result
    ];
    const headers = ["Item Name / Number", "Observations", "Result"];
    const tableRowH = 8;

    // Header row (light blue background)
    currentY = checkPageBreak(currentY, tableRowH + 2);
    doc.setFillColor(219, 234, 254);
    doc.rect(MARGIN, currentY, contentWidth, tableRowH, 'FD');
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.1);

    // Column dividers in header
    let headerX = MARGIN;
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    headers.forEach((h, i) => {
        if (i > 0) {
            doc.line(headerX, currentY, headerX, currentY + tableRowH);
        }
        const textX = headerX + colWidths[i] / 2;
        doc.text(h, textX, currentY + 5.5, { align: 'center' });
        headerX += colWidths[i];
    });
    currentY += tableRowH;

    // Data Rows — minimum 10 empty rows like in the reference, or populate with actual data
    const resultRows = (data.results && data.results.length > 0) ? data.results : [];
    const MIN_ROWS = 10;
    const totalRows = Math.max(resultRows.length, MIN_ROWS);

    doc.setFont(primaryFont, "normal");
    doc.setFontSize(9);

    for (let i = 0; i < totalRows; i++) {
        currentY = checkPageBreak(currentY, tableRowH);
        const row = resultRows[i] || { item_name: '', observations: '', result: '' };

        doc.setDrawColor(180, 180, 180);
        doc.rect(MARGIN, currentY, contentWidth, tableRowH);

        let cellX = MARGIN;
        const cellValues = [
            String(row.item_name || ''),
            String(row.observations || ''),
            String(row.result || '')
        ];
        cellValues.forEach((val, ci) => {
            if (ci > 0) doc.line(cellX, currentY, cellX, currentY + tableRowH);
            if (val) {
                doc.text(val, cellX + BOX_PAD, currentY + 5.5);
            }
            cellX += colWidths[ci];
        });
        currentY += tableRowH;
    }

    currentY += 2;

    // ── 6. Findings If Any ──
    currentY = checkPageBreak(currentY, 30);
    const findingsH = 30;
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(MARGIN, currentY, contentWidth, findingsH);

    doc.setFont(primaryFont, "bold");
    doc.setFontSize(9);
    doc.text("Findings If Any:", MARGIN + BOX_PAD, currentY + 5);

    doc.setFont(primaryFont, "normal");
    if (data.findings_any) {
        const findLines = doc.splitTextToSize(String(data.findings_any), contentWidth - BOX_PAD * 2);
        doc.text(findLines, MARGIN + BOX_PAD, currentY + 11);
    }
    currentY += findingsH + 4;

    return currentY;
};
