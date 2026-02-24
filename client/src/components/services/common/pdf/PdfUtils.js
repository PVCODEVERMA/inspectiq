import qcwsLogo from '@/assets/qcws-logo.png';
import homePageLogo from '@/assets/home_page_logo.png';
import { format } from 'date-fns';

// --- Constants ---
export const MARGIN = 15;
/** Same gap/padding inside all boxes and between footer rows */
export const BOX_PAD = 2;
/** Vertical step between rows in multi-row boxes (e.g. footer SIGN/DATE/AUDITED BY) */
export const ROW_GAP = 6;

export const FONTS = {
    primary: "Carlito",
    title: "Carlito",
    fallback: "helvetica"
};

// --- Font Loading ---
export const addGoogleFonts = async (doc) => {
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

// --- Drawing Helpers ---

export const drawCheckbox = (doc, x, y, size = 3, checked = false) => {
    doc.rect(x, y - 3, size, size);
    if (checked) {
        doc.setFontSize(8);
        doc.text("X", x + 0.6, y - 0.4);
        doc.setFontSize(9);
    }
};

export const drawCheckboxGroup = (doc, label, options, values, startX, y, fontName = "times") => {
    doc.setFontSize(11);
    doc.setFont(fontName, "bold");
    doc.text(label, startX, y);
    const labelWidth = doc.getTextWidth(label);
    let currentX = startX + labelWidth + 3;
    doc.setFont(fontName, "normal");

    options.forEach(opt => {
        const isChecked = values && Array.isArray(values) && values.includes(opt);
        drawCheckbox(doc, currentX, y, 3, isChecked);
        doc.text(opt, currentX + 5, y);
        currentX += opt.length > 6 ? 28 : 25;
    });
};

export const drawInfoRow = (doc, label1, value1, label2, value2, y, contentWidth, fontName = "times", fontSize = 10) => {
    const rowH = 7;
    doc.rect(MARGIN, y, contentWidth, rowH);
    const mid = MARGIN + (contentWidth / 2);
    const textY = y + 5;

    doc.setFontSize(fontSize);
    doc.setFont(fontName, "bold");
    doc.text(label1, MARGIN + BOX_PAD, textY);

    const label1Width = doc.getTextWidth(label1);
    doc.setFont(fontName, "normal");

    // Add truncation to prevent overlap with second column
    let val1 = String(value1 || '');
    if (label2) {
        const maxWidth = (contentWidth / 2) - label1Width - (BOX_PAD * 3);
        if (doc.getTextWidth(val1) > maxWidth) {
            val1 = doc.splitTextToSize(val1, maxWidth)[0];
            if (val1.length < String(value1).length) val1 += '...';
        }
    }
    doc.text(val1, MARGIN + BOX_PAD + label1Width + BOX_PAD, textY);

    if (label2) {
        doc.setFont(fontName, "bold");
        doc.text(label2, mid + BOX_PAD, textY);

        const label2Width = doc.getTextWidth(label2);
        doc.setFont(fontName, "normal");

        let val2 = String(value2 || '');
        const maxWidth = (contentWidth / 2) - label2Width - (BOX_PAD * 3);
        if (doc.getTextWidth(val2) > maxWidth) {
            val2 = doc.splitTextToSize(val2, maxWidth)[0];
            if (val2.length < String(value2).length) val2 += '...';
        }
        doc.text(val2, mid + BOX_PAD + label2Width + BOX_PAD, textY);
    }

    return y + rowH;
};

export const checkPageBreak = (doc, currentY, pageHeight, requiredSpace, drawTemplateFn) => {
    if (currentY + requiredSpace > pageHeight - 60) {
        doc.addPage();
        drawTemplateFn(doc.internal.getNumberOfPages());
        return 40; // Reset Y position
    }
    return currentY;
};

// --- Template Drawing ---
// Note: You must pass 'drawnPages' Set to manage state if calling multiple times
export const drawStandardTemplate = (doc, pageNumber, totalPages, template, fontsLoaded, drawnPages, data = {}) => {
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

    // Header Box Structure - Height 30mm (20 to 50)
    doc.rect(MARGIN, 20, contentWidth, 30);
    doc.rect(MARGIN, 20, 45, 30); // Logo Box
    doc.rect(pageWidth - MARGIN - 45, 20, 45, 30); // Ref Box

    // Logo
    try {
        doc.addImage(qcwsLogo, 'PNG', MARGIN + 9.5, 22.5, 26, 21, undefined, 'FAST');
    } catch (e) {
        console.error("Logo add error", e);
    }

    const titleStyle = fontsLoaded ? "normal" : "bold";
    // Title
    doc.setFontSize(14);
    doc.setFont(titleFont, titleStyle);

    // With equal boxes (45mm each), the center is exactly the page center
    const titleCenterX = pageWidth / 2;

    const isWeldingAudit = ['weld-audit', 'welding-assessment-audit'].includes(template.id) || (template.title && template.title.includes("Welding Assessment"));

    if (isWeldingAudit) {
        doc.setFontSize(16);
        doc.text("Welding Assessment", titleCenterX, 32, { align: 'center' });
        doc.text("Audit Report", titleCenterX, 42, { align: 'center' });
    } else {
        const titleMain = (template.title || "INSPECTION REPORT").toUpperCase().replace(/\s*REPORT$/i, '').trim();
        doc.text(titleMain, titleCenterX, 32, { align: 'center' });
        doc.text("REPORT", titleCenterX, 42, { align: 'center' });
    }

    // Reference
    const refCenterX = pageWidth - MARGIN - 22.5;
    doc.setFontSize(10);
    doc.setFont(primaryFont, "bold");
    // Divider line at middle of box (20 + 13 = 33)
    doc.line(pageWidth - MARGIN - 45, 33, pageWidth - MARGIN, 33);

    // Top inner (20 to 33) -> Center ~26
    doc.text(template.subTitle || "QCWS/F-01", refCenterX, 27, { align: 'center' });
    // Bottom inner (33 to 45) -> Center ~38.5
    doc.text("REV.01", refCenterX, 42.5, { align: 'center' });

    // no footer or signature drawing here; page numbers and report title handled below
    // but we still need dimensions for the separator and page number box
    const footerRow1 = BOX_PAD + 4;
    const footerRow2 = footerRow1 + ROW_GAP;
    const footerRow3 = footerRow2 + ROW_GAP;
    const footerBoxH = footerRow3 + ROW_GAP;
    const finalY = pageHeight - 35;

    const boxSize = 8;
    const boxX = pageWidth - MARGIN - boxSize;
    const footerBoxBottom = finalY + footerBoxH;
    const separatorY = footerBoxBottom + BOX_PAD;
    const titleY = separatorY + ROW_GAP;

    // Separator line below signature box (so it doesn't cut through label descenders)
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.line(MARGIN, separatorY, pageWidth - MARGIN, separatorY);

    // Red Box for Page Number (same row as title)
    const boxY = titleY - 5.5;
    doc.setFillColor(139, 0, 0); // Dark Red
    doc.rect(boxX, boxY, boxSize, boxSize, 'F');

    // Page Number text (White)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(primaryFont, "bold");
    doc.text(String(pageNumber), boxX + (boxSize / 2), boxY + 5.5, { align: 'center' });

    // Footer Report Title (Black, Left Aligned) — keep clear of red box
    doc.setTextColor(0, 0, 0);
    doc.setFont(primaryFont, "normal");
    doc.setFontSize(10);
    const footerTitle = (template.title || "REPORT").toUpperCase();
    const footerId = data.report_no || data.reportNo || '';
    const footerDisplayFull = footerId ? `${footerTitle} / ${footerId}` : footerTitle;

    const maxFooterWidth = boxX - MARGIN - 10;
    let footerDisplay = footerDisplayFull;
    while (doc.getTextWidth(footerDisplay) > maxFooterWidth && footerDisplay.length > 3) {
        footerDisplay = `${footerDisplay.slice(0, -4)}...`;
    }

    doc.text(footerDisplay, MARGIN + BOX_PAD, titleY);
};

// helper that should be called once after full document generated
export const drawSignatureFooterOnLastPage = (doc, template, data) => {
    const pageCount = doc.internal.getNumberOfPages();

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (MARGIN * 2);
    const footerRow1 = BOX_PAD + 4;
    const footerRow2 = footerRow1 + ROW_GAP;
    const footerRow3 = footerRow2 + ROW_GAP;
    const footerBoxH = footerRow3 + ROW_GAP;
    const finalY = pageHeight - 35;

    doc.setPage(pageCount);
    doc.rect(MARGIN, finalY, contentWidth, footerBoxH);
    doc.line(MARGIN + (contentWidth / 2), finalY, MARGIN + (contentWidth / 2), finalY + footerBoxH);

    // always draw the signature labels on the final page regardless of template
    const testLabel = "TESTED BY:";
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SIGN:", MARGIN + BOX_PAD, finalY + footerRow1);
    doc.text("DATE:", MARGIN + BOX_PAD, finalY + footerRow2);
    doc.text(testLabel, MARGIN + BOX_PAD, finalY + footerRow3);

    doc.text("SIGN:", MARGIN + (contentWidth / 2) + BOX_PAD, finalY + footerRow1);
    doc.text("DATE:", MARGIN + (contentWidth / 2) + BOX_PAD, finalY + footerRow2);
    doc.text("WITNESSED/REVIEWED BY( TPI/CLIENT):", MARGIN + (contentWidth / 2) + BOX_PAD, finalY + footerRow3);

    doc.setFont(FONTS.primary, "normal");
    doc.setFontSize(9);
    const auditedByName = data.audited_by_name || '';
    const reviewedByName = data.reviewed_by_name || '';

    doc.text(String(auditedByName), MARGIN + BOX_PAD + (doc.getTextWidth(testLabel) + BOX_PAD), finalY + footerRow3);
    const witnessLabel = "WITNESSED/REVIEWED BY( TPI/CLIENT):";
    doc.text(String(reviewedByName), MARGIN + (contentWidth / 2) + BOX_PAD + (doc.getTextWidth(witnessLabel) + BOX_PAD), finalY + footerRow3);
};

// --- TPI Section Header ---
export const drawSectionHeader = (doc, title, y, contentWidth, fontName = 'helvetica') => {
    const headerH = BOX_PAD + ROW_GAP;
    doc.setFillColor(30, 58, 138); // dark blue
    doc.rect(MARGIN, y, contentWidth, headerH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(fontName, "bold");
    doc.setFontSize(10);
    doc.text(title.toUpperCase(), MARGIN + BOX_PAD, y + BOX_PAD + 4);
    doc.setTextColor(0, 0, 0);
    return y + headerH + BOX_PAD;
};

// --- Standard Report Header Fields ---
export const drawReportHeader = (doc, data, currentY, contentWidth, primaryFont) => {
    const headerFields = [
        ["CLIENT:", data.client_name || 'N/A', "REPORT NO:", data.report_no || 'Auto-Generated'],
        ["VENDOR:", data.vendor_name || 'N/A', "DATE:", data.date ? format(new Date(data.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')],
        ["ITEM:", data.item_tested || data.item || data.item_details || 'N/A', null],
        ["LOCATION:", data.location || data.site_location || 'N/A', null]
    ];

    headerFields.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });

    return currentY + 2;
};

// --- TPI Table ---
export const drawTable = (doc, headers, rows, y, contentWidth, fontName = 'helvetica', checkPageBreak, drawTemplate) => {
    const colCount = headers.length;
    const colWidth = contentWidth / colCount;
    const rowHeight = BOX_PAD + ROW_GAP + 2;
    const startX = MARGIN;
    const cellPad = BOX_PAD;
    const textYOffset = BOX_PAD + 4;

    // Header row
    if (checkPageBreak) y = checkPageBreak(rowHeight);
    doc.setFillColor(219, 234, 254); // light blue
    doc.rect(startX, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.1);
    doc.rect(startX, y, contentWidth, rowHeight);

    doc.setFontSize(8);
    doc.setFont(fontName, 'bold');
    doc.setTextColor(0, 0, 0);

    headers.forEach((header, i) => {
        const cellX = startX + i * colWidth;
        if (i > 0) doc.line(cellX, y, cellX, y + rowHeight);
        const text = doc.splitTextToSize(String(header), colWidth - cellPad * 2);
        doc.text(text, cellX + cellPad, y + textYOffset);
    });

    y += rowHeight;

    // Data rows
    doc.setFont(fontName, 'normal');
    const dataRows = rows && rows.length > 0 ? rows : [headers.map(() => '')];

    dataRows.forEach((row) => {
        let maxLines = 1;
        row.forEach((cell, i) => {
            const lines = doc.splitTextToSize(String(cell || ''), colWidth - cellPad * 2);
            if (lines.length > maxLines) maxLines = lines.length;
        });
        const cellHeight = Math.max(rowHeight, maxLines * 4 + BOX_PAD * 2);

        if (checkPageBreak) {
            const newY = checkPageBreak(cellHeight);
            if (newY < y) {
                y = newY;
                doc.setFillColor(219, 234, 254);
                doc.rect(startX, y, contentWidth, rowHeight, 'F');
                doc.setDrawColor(180, 180, 180);
                doc.rect(startX, y, contentWidth, rowHeight);
                headers.forEach((h, i) => {
                    const cx = startX + i * colWidth;
                    if (i > 0) doc.line(cx, y, cx, y + rowHeight);
                    doc.setFont(fontName, 'bold');
                    doc.text(doc.splitTextToSize(String(h), colWidth - cellPad * 2), cx + cellPad, y + textYOffset);
                });
                y += rowHeight;
                doc.setFont(fontName, 'normal');
            } else {
                y = newY;
            }
        }

        doc.setDrawColor(180, 180, 180);
        doc.rect(startX, y, contentWidth, cellHeight);

        row.forEach((cell, i) => {
            const cellX = startX + i * colWidth;
            if (i > 0) doc.line(cellX, y, cellX, y + cellHeight);
            const text = doc.splitTextToSize(String(cell || ''), colWidth - cellPad * 2);
            doc.text(text, cellX + cellPad, y + textYOffset - 0.5);
        });

        y += cellHeight;
    });

    return y + 2;
};

