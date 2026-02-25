import { format } from 'date-fns';
import { MARGIN, drawInfoRow, drawCheckbox } from '@/components/services/common/pdf/PdfUtils';

export const generateWeldAuditAction = async (doc, data, currentY, contentWidth, primaryFont, checkPageBreak, drawTemplate, getBase64Image) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Specialized General Info for Welding Audit ---
    const rowH = 7;
    const boxH = rowH * 4;
    const splitX = MARGIN + (contentWidth * 0.7);

    doc.rect(MARGIN, currentY, contentWidth, boxH);

    // Horizontal lines
    doc.line(MARGIN, currentY + rowH, MARGIN + contentWidth, currentY + rowH);
    doc.line(MARGIN, currentY + rowH * 2, MARGIN + contentWidth, currentY + rowH * 2);
    doc.line(MARGIN, currentY + rowH * 3, MARGIN + contentWidth, currentY + rowH * 3);

    // Vertical split for first two rows
    doc.line(splitX, currentY, splitX, currentY + rowH * 2);

    doc.setFontSize(9);
    doc.setFont(primaryFont, "bold");

    // Row 1: CLIENT & REPORT#
    doc.text("CLIENT:", MARGIN + 2, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.client_name || ''), MARGIN + 17, currentY + 5);

    doc.setFont(primaryFont, "bold");
    doc.text("REPORT#:", splitX + 2, currentY + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.report_no || ''), splitX + 18, currentY + 5);

    // Row 2: PROJECT & DATE
    doc.setFont(primaryFont, "bold");
    doc.text("PROJECT:", MARGIN + 2, currentY + rowH + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.project_name || ''), MARGIN + 18, currentY + rowH + 5);

    doc.setFont(primaryFont, "bold");
    doc.text("DATE:", splitX + 2, currentY + rowH + 5);
    doc.setFont(primaryFont, "normal");
    const dateStr = data.date ? format(new Date(data.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
    doc.text(dateStr, splitX + 12, currentY + rowH + 5);

    // Row 3: COMPANY
    doc.setFont(primaryFont, "bold");
    doc.text("COMPANY:", MARGIN + 2, currentY + (rowH * 2) + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.company_name || data.client_name || ''), MARGIN + 21, currentY + (rowH * 2) + 5);

    // Row 4: AUDIT LOCATION
    doc.setFont(primaryFont, "bold");
    doc.text("AUDIT LOCATION:", MARGIN + 2, currentY + (rowH * 3) + 5);
    doc.setFont(primaryFont, "normal");
    doc.text(String(data.location || data.site_location || ''), MARGIN + 31, currentY + (rowH * 3) + 5);

    currentY += boxH + 8; // Reset Y with gap

    const drawAuditSection = (title, fields, scoreKey, obsKey, y) => {
        const leftColWidth = 45;
        const rightColWidth = contentWidth - leftColWidth;
        const complianceWidth = 35;
        const assessmentWidth = rightColWidth - complianceWidth;

        // 1. Calculate Content Height
        let fieldsHeight = 0;
        fields.forEach(f => {
            const labelLines = doc.splitTextToSize(f.label, assessmentWidth - 4);
            fieldsHeight += Math.max(7, (labelLines.length * 4) + 2);
        });

        const obsText = data[obsKey] || '';
        const obsLines = doc.splitTextToSize(obsText, rightColWidth - 4);
        const obsContentHeight = (obsLines.length * 4) + 4;
        const obsHeaderHeight = 7;

        const totalContentHeight = 8 + fieldsHeight + obsHeaderHeight + obsContentHeight;
        const boxHeight = Math.max(45, totalContentHeight);

        // 2. Check Page Break (pass current y so content never overlaps footer)
        y = checkPageBreak(y, boxHeight + 5);
        const startY = y;

        // 3. Draw Box and Vertical Dividers
        doc.setDrawColor(0);
        doc.setLineWidth(0.1);
        doc.rect(MARGIN, startY, contentWidth, boxHeight);
        doc.line(MARGIN + leftColWidth, startY, MARGIN + leftColWidth, startY + boxHeight);
        doc.line(pageWidth - MARGIN - complianceWidth, startY, pageWidth - MARGIN - complianceWidth, startY + 8 + fieldsHeight);

        // 4. Left Section: Title and Score
        doc.setFontSize(10);
        doc.setFont(primaryFont, "bold");
        const titleLines = doc.splitTextToSize(title, leftColWidth - 4);
        doc.text(titleLines, MARGIN + (leftColWidth / 2), startY + 12, { align: 'center' });

        doc.text("Score", MARGIN + (leftColWidth / 2), startY + boxHeight - 12, { align: 'center' });
        doc.setTextColor(139, 0, 0); // Dark Red
        doc.text(`${data[scoreKey] || '0'}/10`, MARGIN + (leftColWidth / 2), startY + boxHeight - 6, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // 5. Header Row: Assessment | Compliance
        doc.setFont(primaryFont, "bold");
        doc.setFontSize(10);
        doc.text("Assessment", MARGIN + leftColWidth + 2, startY + 6);
        doc.text("Compliance", pageWidth - MARGIN - (complianceWidth / 2), startY + 6, { align: 'center' });
        doc.line(MARGIN + leftColWidth, startY + 8, pageWidth - MARGIN, startY + 8);

        // 6. Draw Assessment Items
        let rowY = startY + 8;
        doc.setFontSize(8.5);
        fields.forEach((f) => {
            doc.setFont(primaryFont, "normal");
            const labelLines = doc.splitTextToSize(f.label, assessmentWidth - 4);
            const rowHeight = Math.max(7, (labelLines.length * 4) + 2);

            doc.text(labelLines, MARGIN + leftColWidth + 2, rowY + 5);

            const isYes = data[f.id] === 'Yes';
            const isNo = data[f.id] === 'No';
            const cbX = pageWidth - MARGIN - complianceWidth + 2;
            const cbY = rowY + (rowHeight / 2) + 1;

            doc.setFont(primaryFont, "bold");
            drawCheckbox(doc, cbX, cbY, 3.5, isYes, 'check');
            doc.text("Yes", cbX + 5, cbY);
            drawCheckbox(doc, cbX + 16, cbY, 3.5, isNo, 'cross');
            doc.text("No", cbX + 21, cbY);

            rowY += rowHeight;
            doc.line(MARGIN + leftColWidth, rowY, pageWidth - MARGIN, rowY);
        });

        // 7. Draw Observations
        doc.setFont(primaryFont, "bold");
        doc.text("Observations", MARGIN + leftColWidth + 2, rowY + 5);
        rowY += obsHeaderHeight;

        doc.setTextColor(139, 0, 0);
        doc.setFont(primaryFont, "normal");
        doc.text(obsLines, MARGIN + leftColWidth + 2, rowY + 2);

        doc.setTextColor(0, 0, 0);
        return startY + boxHeight + 5;
    };

    // Objective Section (2-Column Layout)
    const objLeftWidth = 45;
    const objRightWidth = contentWidth - objLeftWidth;
    const objective = "The objective of this welding assessment audit is to verify the organization's compliance with applicable welding codes, standards, and specifications, and to assess the effectiveness of welding procedures, personnel qualifications, and quality control practices.";
    const objLines = doc.splitTextToSize(objective, objRightWidth - 4);
    const objBoxH = Math.max(22, (objLines.length * 5) + 8);

    currentY = checkPageBreak(currentY, objBoxH + 5);
    doc.rect(MARGIN, currentY, contentWidth, objBoxH);
    doc.line(MARGIN + objLeftWidth, currentY, MARGIN + objLeftWidth, currentY + objBoxH);

    doc.setFontSize(10);
    doc.setFont(primaryFont, "bold");
    const objTitleLines = doc.splitTextToSize("Objective Of Audit", objLeftWidth - 4);
    doc.text(objTitleLines, MARGIN + (objLeftWidth / 2), currentY + (objBoxH / 2) - 2, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont(primaryFont, "normal");
    doc.text(objLines, MARGIN + objLeftWidth + 2, currentY + 7);
    currentY += objBoxH + 5;

    // Helper to draw the specific grid sections
    const drawGridSection = (title, items, dataKey, y) => {
        const leftW = 45;
        const rightW = contentWidth - leftW;
        const rowH = 7;
        const gridRows = 2;
        const boxH = rowH * gridRows;

        y = checkPageBreak(y, boxH + 2);
        doc.rect(MARGIN, y, contentWidth, boxH);
        doc.line(MARGIN + leftW, y, MARGIN + leftW, y + boxH);

        const colW = rightW / 3;
        doc.line(MARGIN + leftW + colW, y, MARGIN + leftW + colW, y + boxH);
        doc.line(MARGIN + leftW + colW * 2, y, MARGIN + leftW + colW * 2, y + boxH);
        doc.line(MARGIN + leftW, y + rowH, MARGIN + contentWidth, y + rowH);

        doc.setFontSize(9);
        doc.setFont(primaryFont, "bold");
        const titleLines = doc.splitTextToSize(title, leftW - 4);
        doc.text(titleLines, MARGIN + (leftW / 2), y + (boxH / 2) - 1.5, { align: 'center' });

        doc.setFontSize(8.5);
        doc.setFont(primaryFont, "normal");
        const val = data[dataKey] || [];

        items.forEach((it, idx) => {
            const colIdx = idx % 3;
            const rowIdx = Math.floor(idx / 3);
            const x = MARGIN + leftW + (colIdx * colW) + 2;
            const checkY = y + (rowIdx * rowH) + 5;

            const isChecked = val.includes(it);
            drawCheckbox(doc, x, checkY, 3.5, isChecked, 'cross');
            doc.text(it, x + 5, checkY);
        });

        return y + boxH + 5;
    };

    currentY = drawGridSection("Applicable Types of Joints", ["Butt Joint", "T- Joint", "Lap Joint", "Edge Joint", "Open corner joint", "Close corner joint"], "joint_types", currentY);
    currentY = drawGridSection("Applicable Types of Welds", ["Fillet Weld", "Groove Weld", "Slot Weld", "Spot Weld", "Seam Weld", "Plug Weld"], "weld_types", currentY);
    currentY = drawGridSection("Reference Standards", ["ASME", "AWS", "API", "ISO", "IS", "EN"], "ref_standards", currentY);

    // Scope Section
    const scopeLeftWidth = 45;
    const scopeRightWidth = contentWidth - scopeLeftWidth;
    const scopeText = "This welding assessment audit was conducted to evaluate the compliance of welding activities with the applicable API requirements. The audit covered the following areas:\n1. Welding procedure qualification  2. Welder qualification and continuity\n3. Welding consumables control  4. Joint preparation and fit-up\n5. Welding execution and supervision  6. Inspection and testing\n7. Documentation and record control";

    const scopeLines = doc.splitTextToSize(scopeText, scopeRightWidth - 6);
    const scopeBoxH = Math.max(30, (scopeLines.length * 4.5) + 6);

    currentY = checkPageBreak(currentY, scopeBoxH + 5);
    doc.rect(MARGIN, currentY, contentWidth, scopeBoxH);
    doc.line(MARGIN + scopeLeftWidth, currentY, MARGIN + scopeLeftWidth, currentY + scopeBoxH);

    doc.setFontSize(10);
    doc.setFont(primaryFont, "bold");
    const scopeTitleLines = doc.splitTextToSize("Scope of Audit", scopeLeftWidth - 4);
    doc.text(scopeTitleLines, MARGIN + (scopeLeftWidth / 2), currentY + (scopeBoxH / 2) - 2, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont(primaryFont, "normal");
    doc.text(scopeLines, MARGIN + scopeLeftWidth + 3, currentY + 6);
    currentY += scopeBoxH + 5;

    // Page 1 Audit Sections
    currentY = drawAuditSection("1. Welding Procedure Qualifications", [
        { id: 'wpq_q1', label: 'WPSs were reviewed for compliance with essential and non-essential variables?' },
        { id: 'wpq_q2', label: 'Welding parameters (current, voltage, travel speed, heat input) were clearly defined?' },
        { id: 'wpq_q3', label: 'Base material grades, filler materials, preheat, interposes temperature, and PWHT requirements were specified in WPS?' }
    ], 'wpq_score', 'wpq_observations', currentY);

    // New Pages for subsequent sections
    const addSectionOnNewPage = (title, fields, scoreKey, obsKey) => {
        doc.addPage();
        drawTemplate(doc.internal.getNumberOfPages());
        return drawAuditSection(title, fields, scoreKey, obsKey, 53);
    };

    currentY = addSectionOnNewPage("2. Procedure Qualification Records (PQR)", [
        { id: 'pqr_q1', label: 'PQRs were reviewed and verified against supporting test results?' },
        { id: 'pqr_q2', label: 'Mechanical test results met acceptance criteria as per API?' },
        { id: 'pqr_q3', label: 'Test coupons, thickness ranges, and essential variables were correctly addressed?' }
    ], 'pqr_score', 'pqr_observations');

    currentY = drawAuditSection("3. Welder Qualification and Continuity", [
        { id: 'welder_q1', label: 'Welders were qualified in accordance with the applicable WPS variable range.?' },
        { id: 'welder_q2', label: 'Welder qualification records (WQRs) were available ?' },
        { id: 'welder_q3', label: 'Continuity records were maintained?' },
        { id: 'welder_q4', label: 'Skill matrix available?' },
        { id: 'welder_q5', label: 'Weld repair matrix maintained?' }
    ], 'welder_score', 'welder_observations', currentY);

    currentY = addSectionOnNewPage("4. Welding Consumables Control", [
        { id: 'cons_q1', label: 'Storage per manufacturer recommendations?' },
        { id: 'cons_q2', label: 'Baking/holding procedures available?' },
        { id: 'cons_q3', label: 'Baking/holding records available?' },
        { id: 'cons_q4', label: 'Consumables traceable to heat/batch?' }
    ], 'cons_score', 'cons_observations');

    currentY = drawAuditSection("5. Joint Preparation and Fit-Up", [
        { id: 'joint_q1', label: 'Joint geometry complied with WPS?' },
        { id: 'joint_q2', label: 'Alignment, gap, bevel within tolerance?' },
        { id: 'joint_q3', label: 'Cleanliness before welding satisfactory?' },
        { id: 'joint_q4', label: 'Fit-up inspection done before welding?' }
    ], 'joint_score', 'joint_observations', currentY);

    currentY = drawAuditSection("6. Welding Supervision", [
        { id: 'sup_q1', label: 'Welding per approved WPS?' },
        { id: 'sup_q2', label: 'Protection (wind/moisture) satisfactory?' },
        { id: 'sup_q3', label: 'Fit-up inspection before welding?' },
        { id: 'sup_q4', label: 'Welders within valuable range?' },
        { id: 'sup_q5', label: 'Welding machines calibrated?' }
    ], 'sup_score', 'sup_observations', currentY);

    currentY = addSectionOnNewPage("7. Inspection and Testing (NDT)", [
        { id: 'ndt_q1', label: 'QC Engineers are certified?' },
        { id: 'ndt_q2', label: 'NDT personnel certified?' },
        { id: 'ndt_q3', label: 'Inspection procedures approved?' }
    ], 'ndt_score', 'ndt_observations');

    currentY = drawAuditSection("8. Record and Documentation", [
        { id: 'rec_q1', label: 'Applicable WPS-PQR available?' },
        { id: 'rec_q2', label: 'Welders are qualified?' },
        { id: 'rec_q3', label: 'Welders continuity record maintained?' },
        { id: 'rec_q4', label: 'Welders skill matrix available?' },
        { id: 'rec_q5', label: 'Weld repair analysis available?' },
        { id: 'rec_q6', label: 'Consumables backing records available?' },
        { id: 'rec_q7', label: 'Consumables storage procedure available?' },
        { id: 'rec_q8', label: 'Welding machines/ovens calibrated?' }
    ], 'rec_score', 'rec_observations', currentY);

    // Conclusion Box
    currentY = checkPageBreak(currentY, 50);
    const conclusionY = currentY;
    doc.rect(MARGIN, conclusionY, contentWidth, 35);
    doc.line(MARGIN + 45, conclusionY, MARGIN + 45, conclusionY + 35);

    doc.setFontSize(10);
    doc.setFont(primaryFont, "bold");
    doc.text("Conclusion", MARGIN + 22.5, conclusionY + 12, { align: 'center' });
    doc.text("Overall Score", MARGIN + 22.5, conclusionY + 22, { align: 'center' });
    doc.setTextColor(139, 0, 0);
    doc.text(`${data.overall_score || '0'}/100`, MARGIN + 22.5, conclusionY + 28, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(9);
    doc.text("Based on the welding assessment audit, scoring results, and supporting photographic", MARGIN + 47, conclusionY + 6);
    doc.text("evidence, the welding activities were assessed as:", MARGIN + 47, conclusionY + 11);

    const status = data.compliance_status || '';
    const options = ["Fully compliant", "Generally compliant with minor non-conformances", "Non-compliant with major deficiencies"];
    let optY = conclusionY + 18;
    options.forEach(opt => {
        const isSel = status === opt;
        drawCheckbox(doc, MARGIN + 47, optY, 3.5, isSel, 'check');
        doc.text(opt, MARGIN + 52.5, optY);
        optY += 6;
    });

    currentY += 42;

    // Overall Auditor Remarks
    currentY = checkPageBreak(currentY, 30);
    const remarksY = currentY;
    doc.rect(MARGIN, remarksY, contentWidth, 25);
    doc.line(MARGIN + 45, remarksY, MARGIN + 45, remarksY + 25);

    doc.setFont(primaryFont, "bold");
    doc.text("Overall Auditor", MARGIN + 22.5, remarksY + 10, { align: 'center' });
    doc.text("Remarks", MARGIN + 22.5, remarksY + 15, { align: 'center' });

    doc.setFont(primaryFont, "normal");
    const remarksLines = doc.splitTextToSize(data.auditor_remarks || '', contentWidth - 50);
    doc.text(remarksLines, MARGIN + 47, remarksY + 8);
    currentY += 35;

    currentY += 10;

    // Photos Grid
    if (data.photos && data.photos.length > 0) {
        let pagePhotoCount = 0;
        const imgWidth = (contentWidth / 2) - 2;
        const imgHeight = 65;
        const gridMargin = MARGIN;
        let pcurrentX = gridMargin;
        let photoPageY = 60;

        for (let i = 0; i < data.photos.length; i++) {
            if (i % 4 === 0) {
                doc.addPage();
                drawTemplate(doc.internal.getNumberOfPages());
                doc.setFontSize(11);
                doc.setFont(primaryFont, "bold");
                doc.text("PHOTOGRAPHS", pageWidth / 2, 53, { align: 'center' });
                doc.setFontSize(8);
                doc.setFont(primaryFont, "normal");
                doc.setTextColor(100, 100, 100);
                doc.text("(Attach photographs of all observation/ findings as evidence)", pageWidth / 2, 56, { align: 'center' });
                doc.setTextColor(0, 0, 0);
                photoPageY = 60;
                pcurrentX = gridMargin;
                pagePhotoCount = 0;
            }

            const photo = data.photos[i];
            const imgData = await getBase64Image(photo.url);

            if (imgData) {
                doc.setDrawColor(0);
                doc.setLineWidth(0.1);
                doc.rect(pcurrentX, photoPageY, imgWidth, imgHeight + 8);

                try {
                    doc.addImage(imgData, 'JPEG', pcurrentX + 1, photoPageY + 1, imgWidth - 2, imgHeight - 2);
                } catch (e) { console.error(e); }

                doc.line(pcurrentX, photoPageY + imgHeight, pcurrentX + imgWidth, photoPageY + imgHeight);
                doc.setFontSize(9);
                doc.setFont(primaryFont, "normal");
                doc.text(`PIC-${i + 1}: ${photo.name || 'Final weld'}`, pcurrentX + (imgWidth / 2), photoPageY + imgHeight + 5, { align: 'center' });

                pagePhotoCount++;
                if (pagePhotoCount % 2 === 0) {
                    pcurrentX = gridMargin;
                    photoPageY += imgHeight + 12;
                } else {
                    pcurrentX += imgWidth + 4;
                }
            }
        }
    }

    return currentY;
};
