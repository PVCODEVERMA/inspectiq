import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    } catch (e) {
        console.warn("Watermark error", e);
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

    // 3. Footer
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
    const footerDisplay = footerId ? `${footerTitle} / ${footerId}` : footerTitle;
    doc.text(footerDisplay, MARGIN + BOX_PAD, titleY);
};


// Import Service Generators
import * as NDT from '../../ndt/pdf';
import * as TPI from '../../tpi/pdf';
import * as PWHT from '../../pwht/pdf';
import * as Safety from '../../industrialSafety/pdf';
import * as PMI from '../../pmi/pdf';
import * as Env from '../../environmental/pdf';
import * as ISO from '../../iso/pdf';
import * as Eng from '../../tpi/pdf';
import * as PSI from '../../tpi/pdf';
import * as Exp from '../../tpi/pdf';
import * as Vendor from '../../tpi/pdf';
import * as Weld from '../../welding/pdf';
import * as Train from '../../training/pdf';

// Map Form Types to Generator Functions
const GENERATOR_MAP = {
    // NDT
    'ultrasonic-test': NDT.generateUT,
    'magnetic-particle': NDT.generateMPT,
    'liquid-penetrant': NDT.generateLPT,
    'ndt-summary-report': NDT.generateNDTSummary,
    'vt': NDT.generateVT,
    'rt': NDT.generateRT,
    'eddy-current': NDT.generateEddy,
    'leak-test': NDT.generateLeak,
    'hardness-test': NDT.generateHardness,
    'ndt-calib': NDT.generateCalib,

    // PWHT
    'pwht-setup': PWHT.generatePWHTSetup,
    'temp-chart': PWHT.generateTempChart,
    'heating-log': PWHT.generateHeatingLog,
    'tc-place': PWHT.generateTCPlacement,
    'pwht-cert': PWHT.generatePWHTCert,

    // Safety
    'safety-audit': Safety.generateSafetyAudit,
    'risk-assess': Safety.generateRiskAssess,
    'ppe-insp': Safety.generatePPEInsp,
    'fire-safety': Safety.generateFireSafety,
    'lifting-insp': Safety.generateLifting,
    'permit-audit': Safety.generatePermitAudit,
    'accident-inv': Safety.generateAccidentInv,
    'toolbox-talk': Safety.generateToolboxTalk,

    // PMI
    'pmi-test': PMI.generatePMITest,
    'alloy-verif': PMI.generateAlloyVerif,
    'mat-comp': PMI.generateMatComp,
    'pmi-calib': PMI.generatePMICalib,
    'pmi-summary': PMI.generatePMISummary,

    // Environmental
    'eia': Env.generateEIA,
    'air-quality': Env.generateAirQuality,
    'water-quality': Env.generateWaterQuality,
    'soil-analysis': Env.generateSoilAnalysis,
    'noise-level': Env.generateNoiseLevel,
    'env-comp': Env.generateEnvComp,

    // ISO
    'internal-audit': ISO.generateInternalAudit,
    'external-audit': ISO.generateExternalAudit,
    'gap-analysis': ISO.generateGapAnalysis,
    'mrg-minutes': ISO.generateMgmtReview,
    'car-plan': ISO.generateCARPlan,
    'iso-check': ISO.generateISOCheck,
    'surv-audit': ISO.generateSurvAudit,
    'cert-rec': ISO.generateCertRec,

    // TPI
    'pim': TPI.generatePIM,
    'itp-review': TPI.generateITPReview,
    'raw-material': TPI.generateRawMaterial,
    'in-process': TPI.generateInProcess,
    'welding': TPI.generateWelding,
    'ndt-witness': TPI.generateNDTWitness,
    'dimensional': TPI.generateDimensional,
    'hydro-test': TPI.generateHydroTest,
    'fat': TPI.generateFAT,
    'final': TPI.generateFinal,
    'pre-dispatch': TPI.generatePreDispatch,
    'release-note': TPI.generateReleaseNote,
    'ncr': TPI.generateNCR,
    'car': TPI.generateCAR,
    'engineering-inspection': TPI.generateEngineeringInspection,
    'Engineering Inspection': TPI.generateEngineeringInspection,
    'Engineering Inspection Report': TPI.generateEngineeringInspection,

    // Engineering
    'mech-insp': Eng.generateMechInsp,
    'struct-insp': Eng.generateStructInsp,
    'equip-inst': Eng.generateEquipInst,
    'alignment': Eng.generateAlignment,
    'load-test': Eng.generateLoadTest,
    'commissioning': Eng.generateCommissioning,
    'site-insp': Eng.generateSiteInsp,
    'tech-dev': Eng.generateTechDev,

    // Pre-Shipment
    'packing': PSI.generatePacking,
    'marking': PSI.generateMarking,
    'qty-verif': PSI.generateQtyVerif,
    'visual': PSI.generateVisual,
    'container': PSI.generateContainer,
    'release-cert': PSI.generateReleaseCert,

    // Expediting
    'prod-prog': Exp.generateProdProg,
    'vendor-follow': Exp.generateVendorFollow,
    'delay-analysis': Exp.generateDelayAnalysis,
    'exp-visit': Exp.generateExpVisit,
    'weekly-sum': Exp.generateWeeklySum,

    // Vendor Audit
    'eval-check': Vendor.generateEvalCheck,
    'quality-audit': Vendor.generateQualityAudit,
    'mfg-cap': Vendor.generateMfgCap,
    'hse-comp': Vendor.generateHSEComp,
    'fin-review': Vendor.generateFinReview,
    'vendor-rating': Vendor.generateVendorRating,
    'audit-ncr': Vendor.generateAuditNCR,

    // Welding Consultancy
    'wps-review': Weld.generateWPSReview,
    'pqr-approval': Weld.generatePQRApproval,
    'wqt-report': Weld.generateWQTReport,
    'weld-audit': Weld.generateWeldAudit,
    'welding-assessment-audit': Weld.generateWeldAudit,
    'weld-insp': Weld.generateWeldInsp,
    'repair-weld': Weld.generateRepairWeld,
    'pwht-mon': Weld.generatePWHTMon,
    'weld-map': Weld.generateWeldMap,

    // Training
    'attendance': Train.generateAttendance,
    'course-eval': Train.generateCourseEval,
    'exam-report': Train.generateExamReport,
    'practical-assess': Train.generatePracticalAssess,
    'candidate-feed': Train.generateCandidateFeed,
    'cert-issue': Train.generateCertIssue
};

export const generateIndustrialPDF = async (data, template, mode = 'download') => {
    try {
        const doc = new jsPDF();
        const fontsLoaded = await addGoogleFonts(doc);
        const primaryFont = fontsLoaded ? FONTS.primary : FONTS.fallback;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const contentWidth = pageWidth - (MARGIN * 2);

        console.log('PDF Generation - Template:', template?.id || template?.title);
        console.log('PDF Generation - Data formType:', data.formType);

        const drawnPages = new Set();
        const drawTemplate = (pageNo) => drawStandardTemplate(doc, pageNo, doc.internal.getNumberOfPages(), template, fontsLoaded, drawnPages, data);

        // Helper to convert URL/Path to Base64 for PDF
        const getBase64Image = async (url) => {
            if (!url) return null;
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

        // Footer occupies pageHeight-35 to pageHeight; reserve space so content never overlaps
        const FOOTER_TOP = 60; // min gap from bottom (content must end above pageHeight - FOOTER_TOP)
        const PAGE_START_Y = 53;

        const localCheckPageBreak = (yOrSpace, requiredSpace) => {
            const y = typeof requiredSpace === 'number' ? yOrSpace : currentY;
            const space = typeof requiredSpace === 'number' ? requiredSpace : yOrSpace;
            if (y + space > pageHeight - FOOTER_TOP) {
                doc.addPage();
                drawTemplate(doc.internal.getNumberOfPages());
                currentY = PAGE_START_Y;
                return PAGE_START_Y;
            }
            return y;
        };

        // Initial Draw
        const formType = data.formType;
        drawStandardTemplate(doc, 1, doc.internal.getNumberOfPages(), template, fontsLoaded, drawnPages, data);
        let currentY = 53; // Start below header (Header box ends at 46mm)

        // --- GENERATOR DISPATCH ---
        const generator = GENERATOR_MAP[formType];

        if (generator) {
            try {
                // Pass helpers to generators that need them (like UT, Weld Audit, etc.)
                // Note: Some legacy generators might be sync, while new ones like UT are async.
                const result = generator(doc, data, currentY, contentWidth, primaryFont,
                    localCheckPageBreak, drawTemplate, getBase64Image);

                if (result instanceof Promise) {
                    currentY = await result;
                } else {
                    currentY = result;
                }
            } catch (e) {
                console.error(`Error generating specific report for ${formType}:`, e);
                doc.setTextColor(255, 0, 0);
                doc.text(`Error generating report details: ${e.message}`, MARGIN, currentY + 10);
                doc.setTextColor(0, 0, 0);
                currentY += 20;
            }
        } else {
            console.warn(`No generator found for form type: ${formType}`);
            doc.setFont(primaryFont, "normal");
            doc.text(`Form Template: ${formType}`, MARGIN, currentY + 5);
        }

        // --- SAVE ---
        if (mode === 'print') {
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } else {
            const safeId = template?.id || data.formType || 'Report';
            const safeReportNo = (data.report_no || 'Report').toString().replace(/[\/\\?%*:|"<>]/g, '_');
            const filename = `${safeReportNo}_${safeId}_${format(new Date(), 'yyyyMMdd')}.pdf`;
            doc.save(filename);
        }
    } catch (globalError) {
        console.error('PDF Generation Global Error:', globalError);
        throw globalError;
    }
};
