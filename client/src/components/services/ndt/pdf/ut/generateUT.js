import { MARGIN, drawInfoRow, BOX_PAD, drawCheckbox } from '@/components/services/common/pdf/PdfUtils';
import { format } from 'date-fns';
import autoTable from 'jspdf-autotable';

export const generateUT = async (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    // --- Box 1: General Information ---
    currentY = drawInfoRow(doc, "CLIENT:", data.client_name, "REPORT NO:", data.report_no || 'Auto-Generated', currentY, contentWidth, primaryFont, 9);
    currentY = drawInfoRow(doc, "VENDOR:", data.vendor_name, "DATE:", data.date ? format(new Date(data.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy'), currentY, contentWidth, primaryFont, 9);

    // Full width rows for Item and Location
    doc.rect(MARGIN, currentY, contentWidth, 7);
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(9);
    doc.text("ITEM TESTED:", MARGIN + BOX_PAD, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.item_tested || ''), MARGIN + BOX_PAD + doc.getTextWidth("ITEM TESTED:") + BOX_PAD, currentY + 5);
    currentY += 7;

    doc.rect(MARGIN, currentY, contentWidth, 7);
    doc.setFont(primaryFont, "bold");
    doc.text("INSPECTION LOCATION:", MARGIN + BOX_PAD, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.location || ''), MARGIN + BOX_PAD + doc.getTextWidth("INSPECTION LOCATION:") + BOX_PAD, currentY + 5);
    currentY += 9; // Extra gap after Box 1

    // --- Box 2: Technical Information ---
    const techInfo = [
        ["WELDING PROCESS:", data.welding_process, "MATERIAL SPEC:", data.material_spec],
        ["SURFACE CONDITION:", data.surface_condition, "PROCEDURE NO:", data.procedure_no],
        ["SURFACE TEMPERATURE:", data.surface_temp, "ACCEPTANCE STANDARD:", data.acceptance_std]
    ];
    techInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont, 9);
    });
    currentY += 4; // Gap between boxes

    // --- Box 3: Equipment Information ---
    const equipInfo = [
        ["TEST METHODS:", data.test_methods, "INSTRUMENT MAKE:", data.instrument_make],
        ["TEST TECHNIQUE:", data.test_technique, "INSTRUMENTS ID:", data.instrument_id],
        ["TYPE OF COUPLANT:", data.couplant, "TYPE OF CABLE:", data.cable_type]
    ];
    equipInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont, 9);
    });
    currentY += 4; // Gap between boxes

    // --- Box 4: Calibration & Sketch ---
    const calibHeight = 35;
    currentY = checkPageBreak(currentY, calibHeight + 5);
    doc.rect(MARGIN, currentY, contentWidth, calibHeight);

    // Calibration Blocks with Checkboxes
    doc.setFontSize(9);
    doc.setFont(primaryFont, "bold");
    doc.text("CALIBRATION BLOCKS USED:", MARGIN + BOX_PAD, currentY + 5);

    let cbX = MARGIN + BOX_PAD + doc.getTextWidth("CALIBRATION BLOCKS USED:") + 5;
    const blocksArr = Array.isArray(data.calibration_blocks) ? data.calibration_blocks : [];

    drawCheckbox(doc, cbX, currentY + 5, 3, blocksArr.includes('IIW V1'));
    doc.setFont(primaryFont, "normal");
    doc.text("IIW V1", cbX + 5, currentY + 5);
    cbX += 20;

    drawCheckbox(doc, cbX, currentY + 5, 3, blocksArr.includes('V2'));
    doc.text("V2", cbX + 5, currentY + 5);

    // Probe Table
    const tableY = currentY + 8;
    doc.line(MARGIN, tableY, MARGIN + 105, tableY);

    const cols = ["PROBE ANGLE", "0°", "45°", "60°", "70°"];
    const colWidths = [35, 17.5, 17.5, 17.5, 17.5];
    let x = MARGIN;
    doc.setFontSize(8);
    cols.forEach((c, i) => {
        doc.rect(x, tableY, colWidths[i], 5);
        doc.text(c, x + 2, tableY + 3.5);
        x += colWidths[i];
    });

    const rows = ["Dimension", "Frequency", "Reference Gain", "Range"];
    let rY = tableY + 5;
    rows.forEach((r) => {
        x = MARGIN;
        doc.rect(x, rY, 35, 5);
        doc.setFont(primaryFont, "bold");
        doc.setFontSize(8);
        doc.text(r.toUpperCase() + ":", x + 2, rY + 3.5);
        x += 35;
        ["0°", "45°", "60°", "70°"].forEach((deg) => {
            doc.rect(x, rY, 17.5, 5);
            doc.setFont(primaryFont, "normal");
            const val = data.probes?.[`${r}_${deg}`] || '';
            doc.text(String(val), x + 2, rY + 3.5);
            x += 17.5;
        });
        rY += 5;
    });

    // Sketch Box
    const sketchX = MARGIN + 105;
    const sketchW = contentWidth - 105;
    doc.rect(sketchX, currentY, sketchW, calibHeight);
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(9);
    doc.text("Scanning Sketch", sketchX + (sketchW / 2), currentY + 4, { align: 'center' });

    let sketchUrl = data.scanning_sketch;
    if (Array.isArray(sketchUrl) && sketchUrl.length > 0) {
        sketchUrl = typeof sketchUrl[0] === 'object' ? sketchUrl[0].url : sketchUrl[0];
    } else if (typeof sketchUrl === 'object' && sketchUrl !== null) {
        sketchUrl = sketchUrl.url;
    }

    if (sketchUrl && getBase64Image) {
        try {
            const finalImage = await getBase64Image(sketchUrl);
            if (finalImage) {
                const imgProps = doc.getImageProperties(finalImage);
                doc.addImage(finalImage, imgProps.fileType,
                    sketchX + 5, currentY + 6, sketchW - 10, calibHeight - 9, undefined, 'FAST');
            }
        } catch (e) {
            console.error("Sketch error", e);
        }
    }
    currentY += calibHeight + 5;

    // --- Box 5: Summary / Remarks ---
    currentY = checkPageBreak(currentY, 25);
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(10);
    doc.text("REMARKS:", MARGIN, currentY);
    currentY += 5;

    doc.setFont(primaryFont, "normal");
    doc.setFontSize(9);
    const splitText = doc.splitTextToSize(data.summary_text || 'N/A', contentWidth);
    doc.text(splitText, MARGIN, currentY);
    currentY += (splitText.length * 5) + 5;

    // --- Box 6: Results Table ---
    currentY = checkPageBreak(currentY, 30);
    const resultsCols = [
        { header: 'ITEM NAME / NUMBER', dataKey: 'item_name' },
        { header: 'NUMBER OF BARRAGE', dataKey: 'barrage_no' },
        { header: 'TYPE OF SCANNING', dataKey: 'scan_type' },
        { header: 'QTY.', dataKey: 'qty' },
        { header: 'OBSERVATIONS', dataKey: 'observations' },
        { header: 'RESULT', dataKey: 'result' }
    ];

    const tableData = (data.results && data.results.length > 0)
        ? data.results
        : [{}];

    autoTable(doc, {
        startY: currentY,
        columns: resultsCols,
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8, textColor: [0, 0, 0], fillColor: null },
        margin: { left: MARGIN, right: MARGIN, bottom: 40 }, // Safety for footer
        didDrawPage: (d) => {
            if (d.pageNumber > 1 && drawTemplate) {
                drawTemplate(d.pageNumber);
            }
        }
    });

    return doc.lastAutoTable.finalY + 5;
};


