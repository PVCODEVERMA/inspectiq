import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
    addGoogleFonts,
    drawStandardTemplate,
    drawInfoRow,
    MARGIN,
    FONTS
} from './PdfUtils';

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
