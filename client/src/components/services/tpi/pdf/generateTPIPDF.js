import jsPDF from 'jspdf';
import { format } from 'date-fns';
import qcwsLogo from '@/assets/qcws-logo.png';
import homePageLogo from '@/assets/home_page_logo.png';

// --- Constants ---
const MARGIN = 15;
const BOX_PAD = 2;
const ROW_GAP = 6;
const FONTS = {
    primary: "Carlito",
    title: "Carlito",
    fallback: "helvetica"
};

// --- PDF Utilities ---
const addGoogleFonts = async (doc) => {
    const fonts = [
        { name: "Carlito-Regular.ttf", fontName: "Carlito", style: "normal", url: 'https://github.com/google/fonts/raw/main/ofl/carlito/Carlito-Regular.ttf' },
        { name: "Carlito-Bold.ttf", fontName: "Carlito", style: "bold", url: 'https://github.com/google/fonts/raw/main/ofl/carlito/Carlito-Bold.ttf' }
    ];

    try {
        await Promise.all(fonts.map(async (font) => {
            const response = await fetch(font.url);
            if (!response.ok) throw new Error(`Failed to fetch ${font.fontName}`);
            const blob = await response.blob();
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    doc.addFileToVFS(font.name, base64data);
                    doc.addFont(font.name, font.fontName, font.style);
                    resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }));
        return true;
    } catch (e) {
        console.warn("Error loading Google Fonts, falling back to standard fonts", e);
        return false;
    }
};

const getBase64Image = async (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = () => resolve(null);
    });
};

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

const checkPageBreak = (doc, currentY, pageHeight, requiredSpace, drawTemplateFn) => {
    if (currentY + requiredSpace > pageHeight - 45) {
        doc.addPage();
        drawTemplateFn(doc.internal.getNumberOfPages());
        return 40; // Reset Y position
    }
    return currentY;
};

const drawStandardTemplate = (doc, pageNumber, totalPages, template, fontsLoaded, drawnPages, data = {}) => {
    if (drawnPages.has(pageNumber)) return;
    drawnPages.add(pageNumber);

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (MARGIN * 2);

    const primaryFont = fontsLoaded ? FONTS.primary : FONTS.fallback;
    const titleFont = fontsLoaded ? FONTS.title : FONTS.fallback;

    // 1. Watermark
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.1 }));

    const watermarkWidth = 120;
    const watermarkHeight = 120;
    const watermarkX = (pageWidth - watermarkWidth) / 2;
    const watermarkY = (pageHeight - watermarkHeight) / 2;

    try {
        doc.addImage(homePageLogo, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight, undefined, 'FAST');
        doc.setFontSize(40);
        doc.setFont(titleFont, "normal");
    } catch (e) {
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(60);
    }

    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0);

    // 2. Header
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);

    doc.rect(MARGIN, 20, contentWidth, 26);
    doc.rect(MARGIN, 20, 45, 26); // Logo Box
    doc.rect(pageWidth - MARGIN - 45, 20, 45, 26); // Ref Box

    try {
        doc.addImage(qcwsLogo, 'PNG', MARGIN + 9.5, 22.5, 26, 21, undefined, 'FAST');
    } catch (e) {
        console.error("Logo add error", e);
    }

    const titleStyle = fontsLoaded ? "normal" : "bold";
    doc.setFontSize(14);
    doc.setFont(titleFont, titleStyle);

    const titleCenterX = pageWidth / 2;

    const isWeldingAudit = template.id === 'welding-assessment-audit' || (template.title && template.title.includes("Welding Assessment"));

    if (isWeldingAudit) {
        doc.setFontSize(16);
        doc.text("Welding Assessment", titleCenterX, 30, { align: 'center' });
        doc.text("Audit Report", titleCenterX, 38, { align: 'center' });
    } else {
        const titleMain = (template.title || "INSPECTION REPORT").toUpperCase().replace(/\s*REPORT$/i, '').trim();
        doc.text(titleMain, titleCenterX, 29.5, { align: 'center' });
        doc.text("REPORT", titleCenterX, 39.5, { align: 'center' });
    }

    const refCenterX = pageWidth - MARGIN - 22.5;
    doc.setFontSize(10);
    doc.setFont(primaryFont, "bold");
    doc.line(pageWidth - MARGIN - 45, 33, pageWidth - MARGIN, 33);
    doc.text(template.subTitle || "QCWS/F-01", refCenterX, 26.5, { align: 'center' });
    doc.text("REV.01", refCenterX, 39.5, { align: 'center' });

    // Footer
    const footerRow1 = BOX_PAD + 4;
    const footerRow2 = footerRow1 + ROW_GAP;
    const footerRow3 = footerRow2 + ROW_GAP;
    const footerBoxH = footerRow3 + ROW_GAP;
    const finalY = pageHeight - 35;
    doc.rect(MARGIN, finalY, contentWidth, footerBoxH);
    doc.line(MARGIN + (contentWidth / 2), finalY, MARGIN + (contentWidth / 2), finalY + footerBoxH);

    const isAudit = template.id === 'Weld-audit' || template.title?.includes("Assessment");
    const testLabel = isAudit ? "AUDITED BY:" : "TESTED BY:";

    doc.setFontSize(10);
    doc.setFont(primaryFont, "bold");
    doc.text("SIGN:", MARGIN + BOX_PAD, finalY + footerRow1);
    doc.text("DATE:", MARGIN + BOX_PAD, finalY + footerRow2);
    doc.text(testLabel, MARGIN + BOX_PAD, finalY + footerRow3);

    doc.text("SIGN:", MARGIN + (contentWidth / 2) + BOX_PAD, finalY + footerRow1);
    doc.text("DATE:", MARGIN + (contentWidth / 2) + BOX_PAD, finalY + footerRow2);
    doc.text("REVIEWED BY:", MARGIN + (contentWidth / 2) + BOX_PAD, finalY + footerRow3);

    doc.setFont(primaryFont, "normal");
    doc.setFontSize(9);
    const testedByName = data.tested_by_name || data.audited_by_name || '';
    const reviewedByName = data.reviewed_by_name || '';

    doc.text(String(testedByName), MARGIN + BOX_PAD + (doc.getTextWidth(testLabel) + BOX_PAD), finalY + footerRow3);
    doc.text(String(reviewedByName), MARGIN + (contentWidth / 2) + BOX_PAD + (doc.getTextWidth("REVIEWED BY:") + BOX_PAD), finalY + footerRow3);

    const boxSize = 8;
    const boxX = pageWidth - MARGIN - boxSize;
    const footerBoxBottom = finalY + footerBoxH;
    const separatorY = footerBoxBottom + BOX_PAD;
    const titleY = separatorY + ROW_GAP;

    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.line(MARGIN, separatorY, pageWidth - MARGIN, separatorY);

    const boxY = titleY - 5.5;
    doc.setFillColor(139, 0, 0);
    doc.rect(boxX, boxY, boxSize, boxSize, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(primaryFont, "bold");
    doc.text(String(pageNumber), boxX + (boxSize / 2), boxY + 5.5, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFont(primaryFont, "normal");
    doc.setFontSize(10);
    const footerTitle = (template.title || "REPORT").toUpperCase();
    const footerId = data.report_no || data.reportNo || '';
    let footerDisplay = footerId ? `${footerTitle} / ${footerId}` : footerTitle;
    doc.text(footerDisplay, MARGIN + BOX_PAD, titleY);
};

import {
    generatePIM,
    generateITPReview,
    generateRawMaterial,
    generateInProcess,
    generateWelding,
    generateNDTWitness,
    generateDimensional,
    generateHydroTest,
    generateFAT,
    generateFinal,
    generatePreDispatch,
    generateReleaseNote,
    generateNCR,
    generateCAR,
    generateEngineeringInspection
} from './index';

const TPI_GENERATORS = {
    'pim': generatePIM,
    'itp-review': generateITPReview,
    'raw-material': generateRawMaterial,
    'in-process': generateInProcess,
    'welding': generateWelding,
    'ndt-witness': generateNDTWitness,
    'dimensional': generateDimensional,
    'hydro-test': generateHydroTest,
    'fat': generateFAT,
    'final': generateFinal,
    'pre-dispatch': generatePreDispatch,
    'release-note': generateReleaseNote,
    'ncr': generateNCR,
    'car': generateCAR,
    // Engineering Inspection — all name variants
    'engineering-inspection': generateEngineeringInspection,
    'Engineering Inspection': generateEngineeringInspection,
    'Engineering Inspection Report': generateEngineeringInspection,
};

export const generateTPIPDF = async (data, template, mode = 'download') => {
    const doc = new jsPDF();

    const fontsLoaded = await addGoogleFonts(doc);
    const primaryFont = fontsLoaded ? FONTS.primary : FONTS.fallback;

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - MARGIN * 2;

    const drawnPages = new Set();

    const drawTemplate = (pageNumber) => {
        doc.setPage(pageNumber);
        drawStandardTemplate(doc, pageNumber, doc.internal.getNumberOfPages(), template, fontsLoaded, drawnPages);
    };

    drawTemplate(1);
    let currentY = 50;

    // Common General Info Header
    const generalInfo = [
        ["CLIENT:", data.client_name, "REPORT NO:", data.report_no],
        ["VENDOR:", data.vendor_name, "DATE:", data.date ? format(new Date(data.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')],
        ["PO NUMBER:", data.po_number, "LOCATION:", data.location]
    ];
    generalInfo.forEach(row => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 5;

    // Route to the specific TPI generator
    const formType = data.formType || template?.id;
    const generator = TPI_GENERATORS[formType];

    if (generator) {
        currentY = await generator(doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image);
    } else {
        // Generic fallback text
        doc.setFontSize(10);
        doc.setFont(primaryFont, 'normal');
        doc.text(`Report Type: ${formType || 'Unknown'}`, MARGIN + 2, currentY + 5);
    }

    // Save / Print
    if (mode === 'print') {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    } else {
        const safeReportNo = data.report_no || 'TPI_Report';
        const filename = `${safeReportNo}_${formType}_${format(new Date(), 'yyyyMMdd')}.pdf`;
        doc.save(filename);
    }
};

export const isTpiFormType = (formType) => !!TPI_GENERATORS[formType];
