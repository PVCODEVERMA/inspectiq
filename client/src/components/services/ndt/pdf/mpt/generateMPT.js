import { MARGIN, drawInfoRow, drawCheckboxGroup, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateMPT = (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const safeFormatDate = (dateStr) => {
        try {
            if (!dateStr) return format(new Date(), 'dd/MM/yyyy');
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? 'N/A' : format(d, 'dd/MM/yyyy');
        } catch (e) {
            return 'N/A';
        }
    };

    // --- BOX 1: GENERAL INFORMATION ---
    const box1H = 28; // 4 rows x 7mm
    const midX = MARGIN + (contentWidth / 2);
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(MARGIN, currentY, contentWidth, box1H);

    // Horizontal lines
    doc.line(MARGIN, currentY + 7, MARGIN + contentWidth, currentY + 7);
    doc.line(MARGIN, currentY + 14, MARGIN + contentWidth, currentY + 14);
    doc.line(MARGIN, currentY + 21, MARGIN + contentWidth, currentY + 21);

    // Vertical line for rows 1 & 2
    doc.line(midX, currentY, midX, currentY + 14);

    doc.setFontSize(9);
    // Row 1
    doc.setFont(primaryFont, "bold");
    doc.text("CLIENT:", MARGIN + 2, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.client_name || 'N/A'), MARGIN + 42, currentY + 5);

    doc.setFont(primaryFont, "bold");
    doc.text("REPORT NO:", midX + 2, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.report_no || 'Auto-Generated'), midX + 35, currentY + 5);

    // Row 2
    doc.setFont(primaryFont, "bold");
    doc.text("VENDOR:", MARGIN + 2, currentY + 12);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.vendor_name || 'N/A'), MARGIN + 42, currentY + 12);

    doc.setFont(primaryFont, "bold");
    doc.text("DATE:", midX + 2, currentY + 12);
    doc.setFont(primaryFont, "normal");
    doc.text(safeFormatDate(data.date), midX + 35, currentY + 12);

    // Row 3 (Full width)
    doc.setFont(primaryFont, "bold");
    doc.text("ITEM DETAILS:", MARGIN + 2, currentY + 19);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.item_tested || data.item || data.item_details || 'N/A'), MARGIN + 42, currentY + 19);

    // Row 4 (Full width)
    doc.setFont(primaryFont, "bold");
    doc.text("LOCATION:", MARGIN + 2, currentY + 26);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.location || data.site_location || 'N/A'), MARGIN + 42, currentY + 26);

    currentY += box1H + 4;

    // --- BOX 2: MATERIAL SPECIFICATIONS ---
    const box2H = 14; // 2 rows x 7mm
    doc.rect(MARGIN, currentY, contentWidth, box2H);
    doc.line(MARGIN, currentY + 7, MARGIN + contentWidth, currentY + 7);
    doc.line(midX, currentY, midX, currentY + box2H);

    // Row 1
    doc.setFont(primaryFont, "bold");
    doc.text("MATERIAL SPECIFICATIONS:", MARGIN + 2, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.material_spec || 'N/A'), MARGIN + 50, currentY + 5);

    doc.setFont(primaryFont, "bold");
    doc.text("PROCEDURE NO:", midX + 2, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.procedure_no || 'N/A'), midX + 40, currentY + 5);

    // Row 2
    doc.setFont(primaryFont, "bold");
    doc.text("THICKNESS:", MARGIN + 2, currentY + 12);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.thickness || 'N/A'), MARGIN + 42, currentY + 12);

    doc.setFont(primaryFont, "bold");
    doc.text("ACCEPTANCE STANDARD:", midX + 2, currentY + 12);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.acceptance_std || 'N/A'), midX + 40, currentY + 12);

    currentY += box2H + 4;

    // --- BOX 3: EQUIPMENT DETAILS ---
    currentY = checkPageBreak(currentY, 35);

    const box3H = 28; // 4 rows x 7mm
    doc.rect(MARGIN, currentY, contentWidth, box3H);

    // Horizontal lines
    doc.line(MARGIN, currentY + 7, MARGIN + contentWidth, currentY + 7);
    doc.line(MARGIN, currentY + 14, MARGIN + contentWidth, currentY + 14);
    doc.line(MARGIN, currentY + 21, MARGIN + contentWidth, currentY + 21);

    // Vertical line in middle
    doc.line(midX, currentY, midX, currentY + box3H);

    // Row 1
    doc.setFont(primaryFont, "bold");
    doc.text("LIGHTING EQUIPMENT:", MARGIN + 2, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.lighting_equip || ''), MARGIN + 42, currentY + 5);

    doc.setFont(primaryFont, "bold");
    doc.text("INSTRUMENT MAKE:", midX + 2, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.instrument_make || ''), midX + 35, currentY + 5);

    // Row 2
    doc.setFont(primaryFont, "bold");
    doc.text("LIGHT INTENSITY:", MARGIN + 2, currentY + 12);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.light_intensity || ''), MARGIN + 42, currentY + 12);

    doc.setFont(primaryFont, "bold");
    doc.text("INSTRUMENTS ID:", midX + 2, currentY + 12);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.instrument_id || ''), midX + 35, currentY + 12);

    // Row 3 - Checkboxes
    drawCheckboxGroup(doc, "TYPE OF INSTRUMENTS:", ["YOKE", "PROD"], data.instrument_type, MARGIN + 2, currentY + 19, primaryFont, 9);
    drawCheckboxGroup(doc, "METHOD:", ["WET", "DRY"], data.method, midX + 2, currentY + 19, primaryFont, 9);

    // Row 4 - Checkboxes
    drawCheckboxGroup(doc, "TYPE OF CURRENT:", ["AC", "DC"], data.current_type, MARGIN + 2, currentY + 26, primaryFont, 9);
    drawCheckboxGroup(doc, "CONTRAST", ["YES", "NO"], data.contrast || [], midX + 2, currentY + 26, primaryFont, 9);

    currentY += box3H + 6;

    // --- BOX 4: TEST RESULTS ---
    currentY = checkPageBreak(currentY, 40);
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(11);
    doc.text("TEST RESULTS", MARGIN, currentY + 5);
    currentY += 8;

    const tableDataRows = (data.results && data.results.length > 0)
        ? data.results.map(row => [row.item_name || '', row.barrage_no || '', row.qty || '', row.observations || '', row.result || ''])
        : Array(5).fill(['', '', '', '', '']);

    // Add conclusion row inside the table
    const conclusionText = "Magnetic Particle testing carried out of Gear box spare parts, no significant indication observed, inspection result found satisfactory.";
    tableDataRows.push([
        { content: conclusionText, colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', fontSize: 9, minCellHeight: 12 } }
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['ITEM NAME', 'NUMBER OF BARRAGE', 'QTY', 'OBSERVATIONS', 'RESULT']],
        body: tableDataRows,
        theme: 'grid',
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [0, 0, 0],
            fillColor: null,
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        margin: { left: MARGIN, right: MARGIN, bottom: 40 },
        didDrawPage: (d) => {
            if (d.pageNumber > 1 && drawTemplate) {
                drawTemplate(d.pageNumber);
                doc.setFont(primaryFont, "normal");
            }
        }
    });

    return (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY) + 5;
};

