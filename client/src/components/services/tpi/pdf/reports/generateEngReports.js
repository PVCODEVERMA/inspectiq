import { MARGIN, drawInfoRow } from '@/components/services/common/pdf/PdfUtils';

const generateGenericEng = (doc, data, currentY, contentWidth, primaryFont, title) => {
    doc.setFont(primaryFont, "bold");
    doc.text(`${title} REPORT`, MARGIN + 2, currentY + 5);
    currentY += 10;
    const info = [
        ["PROJECT:", data.project_name, "CLIENT:", data.client_name],
        ["DATE:", data.date, "LOCATION:", data.location]
    ];
    info.forEach(row => { currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont); });
    currentY += 5;
    return currentY;
};

export const generateMechInsp = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "MECHANICAL INSPECTION");
export const generateStructInsp = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "STRUCTURAL INSPECTION");
export const generateEquipInst = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "EQUIPMENT INSTALLATION");
export const generateAlignment = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "ALIGNMENT");
export const generateLoadTest = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "LOAD TEST");
export const generateCommissioning = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "COMMISSIONING");
export const generateSiteInsp = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "SITE INSPECTION");
export const generateTechDev = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "TECHNICAL DEVIATION");

// Pre-Shipment
export const generatePacking = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "PACKING INSPECTION");
export const generateMarking = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "MARKING INSPECTION");
export const generateQtyVerif = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "QUANTITY VERIFICATION");
export const generateVisual = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "VISUAL INSPECTION");
export const generateContainer = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "CONTAINER LOADING");
export const generateReleaseCert = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "RELEASE CERTIFICATE");

// Expediting
export const generateProdProg = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "PRODUCTION PROGRESS");
export const generateVendorFollow = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "VENDOR FOLLOW-UP");
export const generateDelayAnalysis = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "DELAY ANALYSIS");
export const generateExpVisit = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "EXPEDITING VISIT");
export const generateWeeklySum = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "WEEKLY SUMMARY");

// Vendor Audit
export const generateEvalCheck = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "EVALUATION CHECKLIST");
export const generateQualityAudit = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "QUALITY AUDIT");
export const generateMfgCap = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "MANUFACTURING CAPACITY");
export const generateHSEComp = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "HSE COMPLIANCE");
export const generateFinReview = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "FINANCIAL REVIEW");
export const generateVendorRating = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "VENDOR RATING");
export const generateAuditNCR = (doc, data, cy, cw, pf) => generateGenericEng(doc, data, cy, cw, pf, "AUDIT NCR");
