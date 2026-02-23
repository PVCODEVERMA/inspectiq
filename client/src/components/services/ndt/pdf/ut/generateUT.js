import { MARGIN, drawInfoRow, drawReportHeader } from '@/components/services/common/pdf/PdfUtils';

export const generateUT = async (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    // 1. Report Header (Client, Report No, Date, Vendor, Location)
    currentY = drawReportHeader(doc, data, currentY, contentWidth, primaryFont);

    // 2. Technical Information
    const techInfo = [
        ["WELDING PROCESS:", data.welding_process, "MATERIAL SPEC:", data.material_spec],
        ["SURFACE CONDITION:", data.surface_condition, "PROCEDURE NO:", data.procedure_no],
        ["SURFACE TEMPERATURE:", data.surface_temp, "ACCEPTANCE STANDARD:", data.acceptance_std]
    ];

    techInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    // Equipment Information
    const equipInfo = [
        ["TEST METHODS:", data.test_methods, "INSTRUMENT MAKE:", data.instrument_make],
        ["TEST TECHNIQUE:", data.test_technique, "INSTRUMENTS ID:", data.instrument_id],
        ["TYPE OF COUPLANT:", data.couplant, "TYPE OF CABLE:", data.cable_type]
    ];

    equipInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    // Calibration & Sketch Box
    const calibHeight = 35;
    doc.rect(MARGIN, currentY, contentWidth, calibHeight);

    // Calibration Blocks
    const blocks = Array.isArray(data.calibration_blocks) ? data.calibration_blocks.join(' / ') : '';
    doc.setFontSize(11);
    doc.setFont(primaryFont, "bold");
    doc.text(`CALIBRATION BLOCKS USED: ${blocks}`, MARGIN + 2, currentY + 5);

    // Probe Table
    const tableY = currentY + 8;
    doc.line(MARGIN, tableY, MARGIN + 105, tableY);

    const cols = ["PROBE ANGLE", "0°", "45°", "60°", "70°"];
    const colWidths = [35, 15, 15, 15, 15];
    let x = MARGIN;
    cols.forEach((c, i) => {
        doc.rect(x, tableY, colWidths[i], 5);
        doc.setFontSize(8);
        doc.text(c, x + 2, tableY + 3.5);
        x += colWidths[i];
    });

    const rows = ["Dimension", "Frequency", "Reference Gain", "Range"];
    let rY = tableY + 5;
    rows.forEach((r) => {
        x = MARGIN;
        doc.rect(x, rY, 35, 5);
        doc.setFont(primaryFont, "bold");
        doc.text(r.toUpperCase() + ":", x + 2, rY + 3.5);
        x += 35;
        ["0°", "45°", "60°", "70°"].forEach((deg) => {
            doc.rect(x, rY, 15, 5);
            doc.setFont(primaryFont, "normal");
            const val = data.probes?.[`${r}_${deg}`] || '';
            doc.text(String(val), x + 2, rY + 3.5);
            x += 15;
        });
        rY += 5;
    });
    doc.setFontSize(9);

    // Sketch Box (Right side of Calibration)
    const sketchX = MARGIN + 105;
    const sketchW = contentWidth - 105;
    doc.text("Scanning Sketch", sketchX + (sketchW / 2), currentY + calibHeight - 2, { align: 'center' });

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
                    sketchX + 5, currentY + 2, sketchW - 10, calibHeight - 8, undefined, 'FAST');
            }
        } catch (e) {
            console.error("Sketch error", e);
        }
    }

    currentY += calibHeight + 5;
    return currentY;
};

