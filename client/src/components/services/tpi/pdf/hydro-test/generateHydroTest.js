import { drawInfoRow, drawSectionHeader } from '@/components/services/common/pdf/PdfUtils';

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
