import { MARGIN, drawInfoRow, drawCheckboxGroup, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';

export const generateMPT = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    // 1. Report Header (Client, Report No, Date, Vendor, Location)
    currentY = drawReportHeader(doc, data, currentY, contentWidth, primaryFont);

    // 2. Basic Info
    const basicInfo = [
        ["MATERIAL SPEC:", data.material_spec, "PROCEDURE NO:", data.procedure_no],
        ["THICKNESS:", data.thickness, "ACCEPTANCE STANDARD:", data.acceptance_std]
    ];

    basicInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    // Equipment Section
    const eqHeight = 28;
    doc.rect(MARGIN, currentY, contentWidth, eqHeight);

    // Horizontal lines
    doc.line(MARGIN, currentY + 7, MARGIN + contentWidth, currentY + 7);
    doc.line(MARGIN, currentY + 14, MARGIN + contentWidth, currentY + 14);
    doc.line(MARGIN, currentY + 21, MARGIN + contentWidth, currentY + 21);

    // Row 1
    doc.setFont(primaryFont, "bold");
    doc.text("LIGHTING EQUIPMENT:", MARGIN + 2, currentY + 5);
    const lEqWidth = doc.getTextWidth("LIGHTING EQUIPMENT:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.lighting_equip || ''), MARGIN + 2 + lEqWidth + 2, currentY + 5);

    doc.setFont(primaryFont, "bold");
    doc.text("INSTRUMENT MAKE:", MARGIN + (contentWidth / 2) + 2, currentY + 5);
    const iMkWidth = doc.getTextWidth("INSTRUMENT MAKE:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.instrument_make || ''), MARGIN + (contentWidth / 2) + 2 + iMkWidth + 2, currentY + 5);

    // Row 2
    doc.setFont(primaryFont, "bold");
    doc.text("LIGHT INTENSITY:", MARGIN + 2, currentY + 12);
    const lInWidth = doc.getTextWidth("LIGHT INTENSITY:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.light_intensity || ''), MARGIN + 2 + lInWidth + 2, currentY + 12);

    doc.setFont(primaryFont, "bold");
    doc.text("INSTRUMENTS ID:", MARGIN + (contentWidth / 2) + 2, currentY + 12);
    const iIdWidth = doc.getTextWidth("INSTRUMENTS ID:");
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.instrument_id || ''), MARGIN + (contentWidth / 2) + 2 + iIdWidth + 2, currentY + 12);

    // Row 3 - Checkboxes
    drawCheckboxGroup(doc, "TYPE OF INST:", ["YOKE", "PROD"], data.instrument_type, MARGIN + 2, currentY + 19, primaryFont);
    drawCheckboxGroup(doc, "METHOD:", ["WET", "DRY"], data.method, MARGIN + (contentWidth / 2) + 2, currentY + 19, primaryFont);

    // Row 4 - Checkboxes
    drawCheckboxGroup(doc, "TYPE OF CURRENT:", ["AC", "DC"], data.current_type, MARGIN + 2, currentY + 26, primaryFont);
    drawCheckboxGroup(doc, "CONTRAST:", ["YES", "NO"], data.contrast || [], MARGIN + (contentWidth / 2) + 2, currentY + 26, primaryFont);

    currentY += eqHeight + 5;
    return currentY;
};

