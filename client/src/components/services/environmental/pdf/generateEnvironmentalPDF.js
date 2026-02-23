import { MARGIN, drawInfoRow } from './PdfUtils';

export const generateEnvironmentalPDF = (doc, data, currentY, contentWidth, primaryFont) => {
    // Env Info
    const envInfo = [
        ["SURVEY TYPE:", data.survey_type, "WEATHER:", data.weather_condition],
        ["TEMPERATURE:", data.temperature, "HUMIDITY:", data.humidity]
    ];

    envInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    // Monitoring Equipment
    const equipInfo = [
        ["EQUIPMENT USED:", data.equipment_used, "CALIBRATION STATUS:", data.calib_status]
    ];
    equipInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    currentY += 5;
    return currentY;
};
