import { MARGIN, drawInfoRow } from '@/components/services/common/pdf/PdfUtils';

export const generateGenericTPI = (doc, data, currentY, contentWidth, primaryFont, title) => {
    const tpiInfo = [
        ["INSPECTION STAGE:", data.inspection_stage || title, "PO NUMBER:", data.po_number],
        ["ITEM ORDERED:", data.item_desc, "QUANTITY:", data.quantity]
    ];

    tpiInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 2;

    const vendorInfo = [
        ["VENDOR:", data.vendor_name, "LOCATION:", data.vendor_location]
    ];
    vendorInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    currentY += 5;
    return currentY;
};
