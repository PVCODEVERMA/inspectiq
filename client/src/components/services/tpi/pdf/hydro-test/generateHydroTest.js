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

const drawSectionHeader = (doc, title, currentY, contentWidth, primaryFont) => {
    doc.setFillColor(240, 240, 240);
    doc.rect(MARGIN, currentY, contentWidth, 8, 'F');
    doc.rect(MARGIN, currentY, contentWidth, 8);
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(11);
    doc.text(title, MARGIN + BOX_PAD, currentY + 6);
    return currentY + 8;
};


export const generateHydroTest = (doc, data, currentY, contentWidth, primaryFont) => {
    // General Info
    const infoRows = [
        ["CLIENT:", data.client_name, "PO NUMBER:", data.po_number],
        ["DATE:", data.date, "VENDOR:", data.vendor_name],
        ["LOCATION:", data.location, "ITEM / EQUIPMENT:", data.item_desc],
        ["ITEM / TAG NO:", data.item_no, "", ""]
    ];
    infoRows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Test Parameters Section
    currentY = drawSectionHeader(doc, 'TEST PARAMETERS', currentY, contentWidth, primaryFont);
    const paramRows = [
        ["TEST MEDIUM:", data.test_medium, "DESIGN PRESSURE (bar):", data.design_pressure],
        ["TEST PRESSURE (bar):", data.test_pressure, "HOLD DURATION (min):", data.hold_time],
        ["TEST TEMPERATURE (°C):", data.test_temp, "PRESSURIZATION RATE:", data.pressurization_rate],
        ["PRESSURE GAUGE ID:", data.gauge_id, "GAUGE CALIB. DUE:", data.gauge_calib]
    ];
    paramRows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 4;

    // Test Results Section
    currentY = drawSectionHeader(doc, 'TEST RESULTS', currentY, contentWidth, primaryFont);
    const resultRows = [
        ["PRESSURE ACHIEVED (bar):", data.pressure_achieved, "LEAKAGE OBSERVED:", data.leakage_observed || 'No'],
        ["DEFORMATION OBSERVED:", data.deformation_observed || 'No', "OVERALL RESULT:", data.overall_result]
    ];
    resultRows.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    if (data.remarks) {
        currentY += 2;
        const lines = doc.splitTextToSize(`Remarks: ${data.remarks}`, contentWidth - 4);
        doc.setFontSize(8); doc.setFont(primaryFont, 'normal');
        doc.text(lines, 14, currentY); currentY += lines.length * 4 + 2;
    }

    return currentY;
};
