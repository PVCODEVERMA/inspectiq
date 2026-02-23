import { MARGIN, drawInfoRow } from '@/components/services/common/pdf/PdfUtils';

export const generateGenericPMI = (doc, data, currentY, contentWidth, primaryFont, title) => {
    // PMI Details
    const pmiInfo = [
        ["ANALYZER MAKE:", data.analyzer_make, "MODEL:", data.analyzer_model],
        ["SERIAL NO:", data.serial_no, "MODE:", data.pmi_mode]
    ];

    pmiInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    // Calibration Info
    const calibInfo = [
        ["CALIBRATION DATE:", data.last_calib_date, "DUE DATE:", data.calib_due_date]
    ];
    calibInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    currentY += 5;
    return currentY;
};
