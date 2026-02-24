import jsPDF from 'jspdf';
import { format } from 'date-fns';
import {
    addGoogleFonts, FONTS, MARGIN,
    drawStandardTemplate, drawInfoRow,
    checkPageBreak, getBase64Image
} from '../../common/pdf/PdfUtils';
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
