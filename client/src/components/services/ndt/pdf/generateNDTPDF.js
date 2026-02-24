import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import qcwsLogo from '@/assets/qcws-logo.png';
import homePageLogo from '@/assets/home_page_logo.png';
import { getBase64Image, addGoogleFonts } from '@/components/services/common/pdf/PdfUtils';

export const generateNDTPDF = async (data, template, mode = 'download') => {
    try {
        const doc = new jsPDF();

        const fontsLoaded = await addGoogleFonts(doc);
        const primaryFont = fontsLoaded ? "Carlito" : "helvetica";
        const titleFont = fontsLoaded ? "Carlito" : "helvetica";

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // -------------------------------- UTILITY FUNCTIONS --------------------------------
        const drawCheckbox = (x, y, size = 3.5, checked = false, type = 'cross') => {
            doc.setLineWidth(0.2);
            doc.setDrawColor(0);
            // Draw the box
            doc.rect(x, y - size + 0.5, size, size);

            if (checked) {
                if (type === 'cross') {
                    // Draw X (☒)
                    doc.line(x + 0.5, y - size + 1, x + size - 0.5, y - 0.5);
                    doc.line(x + size - 0.5, y - size + 1, x + 0.5, y - 0.5);
                } else {
                    // Draw Check (☑)
                    doc.line(x + 0.5, y - (size / 2) - 0.5, x + (size / 3) + 0.5, y - 1);
                    doc.line(x + (size / 3) + 0.5, y - 1, x + size - 0.5, y - size + 1);
                }
            }
        };

        const drawCheckboxGroup = (label, options, values, startX, y) => {
            doc.setFontSize(11);
            doc.setFont(primaryFont, "bold");
            doc.text(label, startX, y);
            const labelWidth = doc.getTextWidth(label);
            let currentX = startX + labelWidth + 3; // Minimal gap of 3 units
            doc.setFont(primaryFont, "normal");

            options.forEach(opt => {
                const isChecked = values && Array.isArray(values) && values.includes(opt);
                drawCheckbox(currentX, y, 3, isChecked);
                doc.text(opt, currentX + 5, y);
                currentX += opt.length > 6 ? 28 : 25;
            });
        };

        const drawInfoRow = (label1, value1, label2, value2, y) => {
            doc.rect(margin, y, contentWidth, 7);
            const mid = margin + (contentWidth / 2);

            // First column
            doc.setFontSize(10);
            doc.setFont(primaryFont, "bold");
            doc.text(label1, margin + 2, y + 5);

            const label1Width = doc.getTextWidth(label1);
            doc.setFont(primaryFont, "normal");

            // Truncate value if it's too long to prevent overlap with second column
            const maxValWidth = label2 ? (mid - margin - label1Width - 12) : (contentWidth - label1Width - 10);
            let displayVal1 = String(value1 || '');
            if (doc.getTextWidth(displayVal1) > maxValWidth) {
                displayVal1 = doc.splitTextToSize(displayVal1, maxValWidth)[0] + "...";
            }
            doc.text(displayVal1, margin + 2 + label1Width + 2, y + 5);

            // Second column (if provided)
            if (label2) {
                doc.setFont(primaryFont, "bold");
                doc.text(label2, mid + 2, y + 5);

                const label2Width = doc.getTextWidth(label2);
                doc.setFont(primaryFont, "normal");

                const maxVal2Width = contentWidth - (mid - margin) - label2Width - 10;
                let displayVal2 = String(value2 || '');
                if (doc.getTextWidth(displayVal2) > maxVal2Width) {
                    displayVal2 = doc.splitTextToSize(displayVal2, maxVal2Width)[0] + "...";
                }
                doc.text(displayVal2, mid + 2 + label2Width + 2, y + 5);
            }

            return y + 7;
        };

        const drawSectionBox = (y, height) => {
            doc.rect(margin, y, contentWidth, height);
            return y + height;
        };

        const checkPageBreak = (requiredSpace) => {
            if (currentY + requiredSpace > pageHeight - 30) { // Reduced from 50 to allow more content per page
                doc.addPage();
                drawTemplate(doc.internal.getNumberOfPages());
                return 53; // Reset Y position to 5mm below header (Header ends at 48)
            }
            return currentY;
        };

        const drawnPages = new Set();

        // -------------------------------- DRAW WATERMARK --------------------------------
        const drawWatermark = (pageNumber) => {
            doc.setPage(pageNumber);
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.12 })); // Subtler watermark
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
        };

        // -------------------------------- DRAW TEMPLATE --------------------------------
        const drawTemplate = (pageNumber) => {
            doc.setPage(pageNumber);
            if (drawnPages.has(pageNumber)) return;
            drawnPages.add(pageNumber);

            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);

            // Header Box Structure - 3 Columns
            doc.rect(margin, 20, contentWidth, 28);
            doc.rect(margin, 20, 45, 28); // Left: Logo
            doc.rect(pageWidth - margin - 45, 20, 45, 28); // Right: Ref/Rev

            // 1. Logo (Left)
            try {
                doc.addImage(qcwsLogo, 'PNG', margin + 9.5, 21, 26, 20, undefined, 'FAST');
                doc.setFontSize(8);
                doc.setFont(primaryFont, "bold");
            } catch (e) {
                console.error("Logo add error", e);
            }

            // 2. Title (Center)
            doc.setFont(titleFont, "bold");
            const titleCenterX = pageWidth / 2;

            if (data.formType === 'welding-assessment-audit') {
                doc.setFontSize(16);
                doc.text("Welding Assessment", titleCenterX, 30, { align: 'center' });
                doc.setFontSize(16);
                doc.text("Audit Report", titleCenterX, 38, { align: 'center' });
            } else {
                const titleStyle = "bold";
                doc.setFont(titleFont, titleStyle);
                const titleMain = (template?.title || 'NDT Report').toUpperCase().replace(/\s*REPORT$/i, '').trim();

                let currentTitleFontSize = 14;
                const maxTitleWidth = contentWidth - 100;
                while (doc.getTextWidth(titleMain) > maxTitleWidth && currentTitleFontSize > 8) {
                    currentTitleFontSize -= 0.5;
                    doc.setFontSize(currentTitleFontSize);
                }
                doc.text(titleMain, titleCenterX, 30, { align: 'center' });
                doc.setFontSize(14);
                doc.text("Audit Report", titleCenterX, 38, { align: 'center' });
            }

            // 3. Reference (Right)
            const refCenterX = pageWidth - margin - 22.5;
            doc.setFontSize(10);
            doc.setFont(primaryFont, "bold");
            doc.text(template?.subTitle || "QCWS/WC/F-11", refCenterX, 29, { align: 'center' });
            doc.line(pageWidth - margin - 45, 33, pageWidth - margin, 33);
            doc.setFont(primaryFont, "bold");
            const revStr = `REV.${String(pageNumber).padStart(2, '0')}`;
            doc.text(revStr, refCenterX, 40, { align: 'center' });

            // 3. Footer
            const boxSize = 8;
            const boxX = pageWidth - margin - boxSize;
            const boxY = pageHeight - 12;

            // Red Box for Page Number
            doc.setFillColor(139, 0, 0); // Dark Red
            doc.rect(boxX, boxY, boxSize, boxSize, 'F');

            // Page Number text (White)
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont(primaryFont, "bold");
            doc.text(String(pageNumber), boxX + (boxSize / 2), boxY + 5.5, { align: 'center' });

            // Footer Report Title (Black, Right Aligned next to box)
            doc.setTextColor(0, 0, 0);
            doc.setFont(primaryFont, "normal");
            doc.setFontSize(10);
            const footerTitle = (template?.title || "REPORT").toUpperCase();
            doc.text(footerTitle, margin, boxY + 5.5);

            // Optional: Top Line for footer separation
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            doc.line(margin, boxY - 2, pageWidth - margin, boxY - 2);
        };

        // Initial Draw
        drawTemplate(1);
        let currentY = 53; // Start 5mm below header (Header ends at 48)

        // -------------------------------- GENERAL INFO BOX --------------------------------
        const drawGeneralInfo = () => {
            if (data.formType === 'welding-assessment-audit') {
                const rowH = 7;
                const boxH = rowH * 4;
                const splitX = margin + (contentWidth * 0.7);

                doc.rect(margin, currentY, contentWidth, boxH);

                // Horizontal lines
                doc.line(margin, currentY + rowH, margin + contentWidth, currentY + rowH);
                doc.line(margin, currentY + rowH * 2, margin + contentWidth, currentY + rowH * 2);
                doc.line(margin, currentY + rowH * 3, margin + contentWidth, currentY + rowH * 3);

                // Vertical split for first two rows
                doc.line(splitX, currentY, splitX, currentY + rowH * 2);

                doc.setFontSize(9);
                doc.setFont(primaryFont, "bold");

                // Row 1: CLIENT & REPORT#
                doc.text("CLIENT:", margin + 2, currentY + 5);
                doc.setFont(primaryFont, "normal");
                doc.text(String(data.client_name || ''), margin + 17, currentY + 5);

                doc.setFont(primaryFont, "bold");
                doc.text("REPORT#:", splitX + 2, currentY + 5);
                doc.setFont(primaryFont, "normal");
                doc.text(String(data.report_no || ''), splitX + 18, currentY + 5);

                // Row 2: PROJECT & DATE
                doc.setFont(primaryFont, "bold");
                doc.text("PROJECT:", margin + 2, currentY + rowH + 5);
                doc.setFont(primaryFont, "normal");
                doc.text(String(data.project_name || ''), margin + 18, currentY + rowH + 5);

                doc.setFont(primaryFont, "bold");
                doc.text("DATE:", splitX + 2, currentY + rowH + 5);
                doc.setFont(primaryFont, "normal");
                const dateStr = data.date ? format(new Date(data.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
                doc.text(dateStr, splitX + 12, currentY + rowH + 5);

                // Row 3: COMPANY
                doc.setFont(primaryFont, "bold");
                doc.text("COMPANY:", margin + 2, currentY + rowH * 2 + 5);
                doc.setFont(primaryFont, "normal");
                doc.text(String(data.company_name || data.client_name || ''), margin + 21, currentY + rowH * 2 + 5);

                // Row 4: AUDIT LOCATION
                doc.setFont(primaryFont, "bold");
                doc.text("AUDIT LOCATION:", margin + 2, currentY + rowH * 3 + 5);
                doc.setFont(primaryFont, "normal");
                doc.text(String(data.location || data.site_location || ''), margin + 31, currentY + rowH * 3 + 5);

                currentY += boxH + 5; // Standardized gap
                return;
            }

            const generalInfo = [
                ["CLIENT:", data.client_name, "REPORT NO:", data.report_no],
                ["PROJECT:", data.project_name, "DATE:", data.date ? format(new Date(data.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')],
                ["COMPANY:", data.company_name, null, null],
                ["AUDIT LOCATION:", data.location || data.site_location, null]
            ];

            generalInfo.forEach((row) => {
                currentY = drawInfoRow(row[0], row[1], row[2], row[3], currentY);
            });
            currentY += 2;
        };

        drawGeneralInfo();

        // -------------------------------- WELDING ASSESSMENT AUDIT SPECIALIZED LOGIC --------------------------------
        if (data.formType === 'welding-assessment-audit') {
            const drawAuditSection = (title, fields, scoreKey, obsKey) => {
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

                // 2. Check Page Break
                currentY = checkPageBreak(boxHeight + 5);
                const startY = currentY;

                // 3. Draw Box and Vertical Dividers
                doc.setDrawColor(0);
                doc.setLineWidth(0.1);
                doc.rect(margin, startY, contentWidth, boxHeight);
                doc.line(margin + leftColWidth, startY, margin + leftColWidth, startY + boxHeight);
                doc.line(pageWidth - margin - complianceWidth, startY, pageWidth - margin - complianceWidth, startY + 8 + fieldsHeight);

                // 4. Left Section: Title and Score
                doc.setFontSize(10);
                doc.setFont(primaryFont, "bold");
                const titleLines = doc.splitTextToSize(title, leftColWidth - 4);
                doc.text(titleLines, margin + (leftColWidth / 2), startY + 12, { align: 'center' });

                doc.text("Score", margin + (leftColWidth / 2), startY + boxHeight - 12, { align: 'center' });
                doc.setTextColor(139, 0, 0); // Dark Red
                doc.text(`${data[scoreKey] || '0'}/10`, margin + (leftColWidth / 2), startY + boxHeight - 6, { align: 'center' });
                doc.setTextColor(0, 0, 0);

                // 5. Header Row: Assessment | Compliance
                doc.setFont(primaryFont, "bold");
                doc.setFontSize(10);
                doc.text("Assessment", margin + leftColWidth + 2, startY + 6);
                doc.text("Compliance", pageWidth - margin - (complianceWidth / 2), startY + 6, { align: 'center' });
                doc.line(margin + leftColWidth, startY + 8, pageWidth - margin, startY + 8);

                // 6. Draw Assessment Items
                let rowY = startY + 8;
                doc.setFontSize(8.5);
                fields.forEach((f) => {
                    doc.setFont(primaryFont, "normal");
                    const labelLines = doc.splitTextToSize(f.label, assessmentWidth - 4);
                    const rowHeight = Math.max(7, (labelLines.length * 4) + 2);

                    doc.text(labelLines, margin + leftColWidth + 2, rowY + 5);

                    const isYes = data[f.id] === 'Yes';
                    const isNo = data[f.id] === 'No';
                    const cbX = pageWidth - margin - complianceWidth + 2;
                    const cbY = rowY + (rowHeight / 2) + 1;

                    doc.setFont(primaryFont, "bold");
                    drawCheckbox(cbX, cbY, 3.5, isYes, 'check');
                    doc.text("Yes", cbX + 5, cbY);
                    drawCheckbox(cbX + 16, cbY, 3.5, isNo, 'cross');
                    doc.text("No", cbX + 21, cbY);

                    rowY += rowHeight;
                    doc.line(margin + leftColWidth, rowY, pageWidth - margin, rowY);
                });

                // 7. Draw Observations
                doc.setFont(primaryFont, "bold");
                doc.text("Observations", margin + leftColWidth + 2, rowY + 5);
                rowY += obsHeaderHeight;

                doc.setTextColor(139, 0, 0);
                doc.setFont(primaryFont, "normal");
                doc.text(obsLines, margin + leftColWidth + 2, rowY + 2);

                currentY = startY + boxHeight + 5;
                doc.setTextColor(0, 0, 0);
            };

            // Objective Section (2-Column Layout)
            const objLeftWidth = 45;
            const objRightWidth = contentWidth - objLeftWidth;
            const objective = "The objective of this welding assessment audit is to verify the organization's compliance with applicable welding codes, standards, and specifications, and to assess the effectiveness of welding procedures, personnel qualifications, and quality control practices.";
            const objLines = doc.splitTextToSize(objective, objRightWidth - 4);
            const objBoxH = Math.max(22, (objLines.length * 5) + 8);

            currentY = checkPageBreak(objBoxH + 5);
            doc.rect(margin, currentY, contentWidth, objBoxH);
            doc.line(margin + objLeftWidth, currentY, margin + objLeftWidth, currentY + objBoxH);

            doc.setFontSize(10);
            doc.setFont(primaryFont, "bold");
            const objTitleLines = doc.splitTextToSize("Objective Of Audit", objLeftWidth - 4);
            doc.text(objTitleLines, margin + (objLeftWidth / 2), currentY + (objBoxH / 2) - 2, { align: 'center' });

            doc.setFontSize(9);
            doc.setFont(primaryFont, "normal");
            doc.text(objLines, margin + objLeftWidth + 2, currentY + 7);
            currentY += objBoxH + 5;

            // Helper to draw the specific grid sections (Joints, Welds, Standards)
            const drawGridSection = (title, items, dataKey) => {
                const leftW = 45;
                const rightW = contentWidth - leftW;
                const rowH = 7;
                const gridRows = 2;
                const boxH = rowH * gridRows;

                currentY = checkPageBreak(boxH + 2);
                doc.rect(margin, currentY, contentWidth, boxH);
                doc.line(margin + leftW, currentY, margin + leftW, currentY + boxH);

                // Vertical split lines for the 3 columns on the right
                const colW = rightW / 3;
                doc.line(margin + leftW + colW, currentY, margin + leftW + colW, currentY + boxH);
                doc.line(margin + leftW + colW * 2, currentY, margin + leftW + colW * 2, currentY + boxH);

                // Horizontal split line for the 2 rows
                doc.line(margin + leftW, currentY + rowH, margin + contentWidth, currentY + rowH);

                // Title on left
                doc.setFontSize(9);
                doc.setFont(primaryFont, "bold");
                const titleLines = doc.splitTextToSize(title, leftW - 4);
                doc.text(titleLines, margin + (leftW / 2), currentY + (boxH / 2) - 1.5, { align: 'center' });

                // Items on right (3x2 grid)
                doc.setFontSize(8.5);
                doc.setFont(primaryFont, "normal");
                const val = data[dataKey] || [];

                items.forEach((it, idx) => {
                    const colIdx = idx % 3;
                    const rowIdx = Math.floor(idx / 3);
                    const x = margin + leftW + (colIdx * colW) + 2;
                    const y = currentY + (rowIdx * rowH) + 5;

                    const isChecked = val.includes(it);
                    drawCheckbox(x, y, 3.5, isChecked, 'cross');
                    doc.text(it, x + 5, y);
                });

                currentY += boxH + 5; // Added 5mm gap between sections
            };

            drawGridSection("Applicable Types of Joints", ["Butt Joint", "T- Joint", "Lap Joint", "Edge Joint", "Open corner joint", "Close corner joint"], "joint_types");
            drawGridSection("Applicable Types of Welds", ["Fillet Weld", "Groove Weld", "Slot Weld", "Spot Weld", "Seam Weld", "Plug Weld"], "weld_types");
            drawGridSection("Reference Standards", ["ASME", "AWS", "API", "ISO", "IS", "EN"], "ref_standards");
            // No extra increment needed here as drawGridSection adds its own 3mm gap

            // Scope Section (2-Column Layout)
            const scopeLeftWidth = 45;
            const scopeRightWidth = contentWidth - scopeLeftWidth;
            const scopeText = "This welding assessment audit was conducted to evaluate the compliance of welding activities with the applicable API requirements. The audit covered the following areas:\n1. Welding procedure qualification  2. Welder qualification and continuity\n3. Welding consumables control  4. Joint preparation and fit-up\n5. Welding execution and supervision  6. Inspection and testing\n7. Documentation and record control";

            const scopeLines = doc.splitTextToSize(scopeText, scopeRightWidth - 6);
            const scopeBoxH = Math.max(30, (scopeLines.length * 4.5) + 6);

            currentY = checkPageBreak(scopeBoxH + 5);
            doc.rect(margin, currentY, contentWidth, scopeBoxH);
            doc.line(margin + scopeLeftWidth, currentY, margin + scopeLeftWidth, currentY + scopeBoxH);

            doc.setFontSize(10);
            doc.setFont(primaryFont, "bold");
            const scopeTitleLines = doc.splitTextToSize("Scope of Audit", scopeLeftWidth - 4);
            doc.text(scopeTitleLines, margin + (scopeLeftWidth / 2), currentY + (scopeBoxH / 2) - 2, { align: 'center' });

            doc.setFontSize(9);
            doc.setFont(primaryFont, "normal");
            doc.text(scopeLines, margin + scopeLeftWidth + 3, currentY + 6);
            currentY += scopeBoxH + 5;

            // Page 1 Audit Start
            drawAuditSection("1. Welding Procedure Qualifications", [
                { id: 'wpq_q1', label: 'WPSs were reviewed for compliance with essential and non-essential variables?' },
                { id: 'wpq_q2', label: 'Welding parameters (current, voltage, travel speed, heat input) were clearly defined?' },
                { id: 'wpq_q3', label: 'Base material grades, filler materials, preheat, interposes temperature, and PWHT requirements were specified in WPS?' }
            ], 'wpq_score', 'wpq_observations');

            // Page 2 Start
            doc.addPage();
            drawTemplate(doc.internal.getNumberOfPages());
            currentY = 53; // Start 5mm below header

            drawAuditSection("2. Procedure Qualification Records (PQR)", [
                { id: 'pqr_q1', label: 'PQRs were reviewed and verified against supporting test results?' },
                { id: 'pqr_q2', label: 'Mechanical test results met acceptance criteria as per API?' },
                { id: 'pqr_q3', label: 'Test coupons, thickness ranges, and essential variables were correctly addressed?' }
            ], 'pqr_score', 'pqr_observations');

            drawAuditSection("3. Welder Qualification and Continuity", [
                { id: 'welder_q1', label: 'Welders were qualified in accordance with the applicable WPS variable range.?' },
                { id: 'welder_q2', label: 'Welder qualification records (WQRs) were available ?' },
                { id: 'welder_q3', label: 'Continuity records were maintained?' },
                { id: 'welder_q4', label: 'Skill matrix available?' },
                { id: 'welder_q5', label: 'Weld repair matrix maintained?' }
            ], 'welder_score', 'welder_observations');

            // Page 3 Start (Ensuring Page 2 only has 2 boxes)
            doc.addPage();
            drawTemplate(doc.internal.getNumberOfPages());
            currentY = 53;

            drawAuditSection("4. Welding Consumables Control", [
                { id: 'cons_q1', label: 'Storage per manufacturer recommendations?' },
                { id: 'cons_q2', label: 'Baking/holding procedures available?' },
                { id: 'cons_q3', label: 'Baking/holding records available?' },
                { id: 'cons_q4', label: 'Consumables traceable to heat/batch?' }
            ], 'cons_score', 'cons_observations');

            drawAuditSection("5. Joint Preparation and Fit-Up", [
                { id: 'joint_q1', label: 'Joint geometry complied with WPS?' },
                { id: 'joint_q2', label: 'Alignment, gap, bevel within tolerance?' },
                { id: 'joint_q3', label: 'Cleanliness before welding satisfactory?' },
                { id: 'joint_q4', label: 'Fit-up inspection done before welding?' }
            ], 'joint_score', 'joint_observations');

            drawAuditSection("6. Welding Supervision", [
                { id: 'sup_q1', label: 'Welding per approved WPS?' },
                { id: 'sup_q2', label: 'Protection (wind/moisture) satisfactory?' },
                { id: 'sup_q3', label: 'Fit-up inspection before welding?' },
                { id: 'sup_q4', label: 'Welders within valuable range?' },
                { id: 'sup_q5', label: 'Welding machines calibrated?' }
            ], 'sup_score', 'sup_observations');

            drawAuditSection("7. Inspection and Testing (NDT)", [
                { id: 'ndt_q1', label: 'QC Engineers are certified?' },
                { id: 'ndt_q2', label: 'NDT personnel certified?' },
                { id: 'ndt_q3', label: 'Inspection procedures approved?' }
            ], 'ndt_score', 'ndt_observations');

            drawAuditSection("8. Record and Documentation", [
                { id: 'rec_q1', label: 'Applicable WPS-PQR available?' },
                { id: 'rec_q2', label: 'Welders are qualified?' },
                { id: 'rec_q3', label: 'Welders continuity record maintained?' },
                { id: 'rec_q4', label: 'Welders skill matrix available?' },
                { id: 'rec_q5', label: 'Weld repair analysis available?' },
                { id: 'rec_q6', label: 'Consumables backing records available?' },
                { id: 'rec_q7', label: 'Consumables storage procedure available?' },
                { id: 'rec_q8', label: 'Welding machines/ovens calibrated?' }
            ], 'rec_score', 'rec_observations');

            // Conclusion Box
            currentY = checkPageBreak(50);
            const conclusionY = currentY;
            doc.rect(margin, conclusionY, contentWidth, 35);
            doc.line(margin + 45, conclusionY, margin + 45, conclusionY + 35);

            doc.setFontSize(10);
            doc.setFont(primaryFont, "bold");
            doc.text("Conclusion", margin + 22.5, conclusionY + 12, { align: 'center' });
            doc.text("Overall Score", margin + 22.5, conclusionY + 22, { align: 'center' });
            doc.setTextColor(139, 0, 0);
            doc.text(`${data.overall_score || '0'}/100`, margin + 22.5, conclusionY + 28, { align: 'center' });
            doc.setTextColor(0, 0, 0);

            doc.setFontSize(9);
            doc.text("Based on the welding assessment audit, scoring results, and supporting photographic", margin + 47, conclusionY + 6);
            doc.text("evidence, the welding activities were assessed as:", margin + 47, conclusionY + 11);

            const status = data.compliance_status || '';
            const options = ["Fully compliant", "Generally compliant with minor non-conformances", "Non-compliant with major deficiencies"];
            let optY = conclusionY + 18;
            options.forEach(opt => {
                const isSel = status === opt;
                drawCheckbox(margin + 47, optY, 3.5, isSel, 'check');
                doc.text(opt, margin + 52.5, optY);
                optY += 6;
            });

            currentY += 42;

            // Overall Auditor Remarks
            currentY = checkPageBreak(30);
            const remarksY = currentY;
            doc.rect(margin, remarksY, contentWidth, 25);
            doc.line(margin + 45, remarksY, margin + 45, remarksY + 25);

            doc.setFont(primaryFont, "bold");
            doc.text("Overall Auditor", margin + 22.5, remarksY + 10, { align: 'center' });
            doc.text("Remarks", margin + 22.5, remarksY + 15, { align: 'center' });

            doc.setFont(primaryFont, "normal");
            const remarksLines = doc.splitTextToSize(data.auditor_remarks || '', contentWidth - 50);
            doc.text(remarksLines, margin + 47, remarksY + 8);
            currentY += 35;

            // Signatures
            currentY = checkPageBreak(35);
            const sigY = currentY;
            doc.rect(margin, sigY, contentWidth, 25);
            doc.line(margin, sigY + 8, pageWidth - margin, sigY + 8);
            doc.line(margin, sigY + 17, pageWidth - margin, sigY + 17);
            doc.line(pageWidth / 2, sigY, pageWidth / 2, sigY + 25);

            doc.setFontSize(9);
            doc.setFont(primaryFont, "bold");
            doc.text(`DATE: ${data.date ? format(new Date(data.date), 'dd.MM.yyyy') : ''}`, margin + 2, sigY + 6);
            doc.text("DATE:", pageWidth / 2 + 2, sigY + 6);

            doc.text("SIGNATURE:", margin + 2, sigY + 14);
            doc.text("SIGNATURE:", pageWidth / 2 + 2, sigY + 14);

            doc.text("AUDITED BY:", margin + 2, sigY + 22);
            doc.text("REVIEWED BY:", pageWidth / 2 + 2, sigY + 22);

            doc.setFont(primaryFont, "normal");
            doc.text(String(data.audited_by_name || ''), margin + 25, sigY + 22);
            doc.text(String(data.reviewed_by_name || ''), pageWidth / 2 + 28, sigY + 22);

            currentY += 35;

            // Photos Grid
            if (data.photos && data.photos.length > 0) {
                let pagePhotoCount = 0;
                const imgWidth = (contentWidth / 2) - 2;
                const imgHeight = 65;
                const gridMargin = margin;
                let currentX = gridMargin;
                let photoPageY = 60;

                for (let i = 0; i < data.photos.length; i++) {
                    // New Page if starting or every 4 photos
                    if (i % 4 === 0) {
                        doc.addPage();
                        drawTemplate(doc.internal.getNumberOfPages());

                        doc.setFontSize(11);
                        doc.setFont(primaryFont, "bold");
                        doc.text("PHOTOGRAPHS", pageWidth / 2, 53, { align: 'center' });
                        doc.setFontSize(8);
                        doc.setFont(primaryFont, "normal");
                        doc.setTextColor(100, 100, 100); // Grey Color
                        doc.text("(Attach photographs of all observation/ findings as evidence)", pageWidth / 2, 56, { align: 'center' });
                        doc.setTextColor(0, 0, 0);

                        photoPageY = 60;
                        currentX = gridMargin;
                        pagePhotoCount = 0;
                    }

                    const photo = data.photos[i];
                    const imgData = await getBase64Image(photo.url);

                    if (imgData) {
                        // Draw outer border for the image box
                        doc.setDrawColor(0);
                        doc.setLineWidth(0.1);
                        doc.rect(currentX, photoPageY, imgWidth, imgHeight + 8);

                        try {
                            doc.addImage(imgData, 'JPEG', currentX + 1, photoPageY + 1, imgWidth - 2, imgHeight - 2);
                        } catch (e) { console.error(e); }

                        // Caption line and text
                        doc.line(currentX, photoPageY + imgHeight, currentX + imgWidth, photoPageY + imgHeight);
                        doc.setFontSize(9);
                        doc.setFont(primaryFont, "normal");
                        doc.text(`PIC-${i + 1}: ${photo.name || 'Final weld'}`, currentX + (imgWidth / 2), photoPageY + imgHeight + 5, { align: 'center' });

                        pagePhotoCount++;

                        // Update grid positions
                        if (pagePhotoCount % 2 === 0) {
                            currentX = gridMargin;
                            photoPageY += imgHeight + 12; // Move to next row
                        } else {
                            currentX += imgWidth + 4; // Move to next column
                        }
                    }
                }
            }

            // Finalize (Moved to end of file for all reports)
        }

        // -------------------------------- TEMPLATE-SPECIFIC SECTIONS --------------------------------

        // Ultrasonic Testing Template
        if (data.formType === 'ultrasonic-test') {
            // Technical Information
            const techInfo = [
                ["WELDING PROCESS:", data.welding_process, "MATERIAL SPEC:", data.material_spec],
                ["SURFACE CONDITION:", data.surface_condition, "PROCEDURE NO:", data.procedure_no],
                ["SURFACE TEMPERATURE:", data.surface_temp, "ACCEPTANCE STANDARD:", data.acceptance_std]
            ];

            techInfo.forEach((row) => {
                currentY = drawInfoRow(row[0], row[1], row[2], row[3], currentY);
            });
            currentY += 2;

            // Equipment Information
            const equipInfo = [
                ["TEST METHODS:", data.test_methods, "INSTRUMENT MAKE:", data.instrument_make],
                ["TEST TECHNIQUE:", data.test_technique, "INSTRUMENTS ID:", data.instrument_id],
                ["TYPE OF COUPLANT:", data.couplant, "TYPE OF CABLE:", data.cable_type]
            ];

            equipInfo.forEach((row) => {
                currentY = drawInfoRow(row[0], row[1], row[2], row[3], currentY);
            });
            currentY += 2;

            // Calibration & Sketch
            currentY = checkPageBreak(35);
            const calibHeight = 35;
            doc.rect(margin, currentY, contentWidth, calibHeight);

            // Calibration Blocks
            const blocks = Array.isArray(data.calibration_blocks) ? data.calibration_blocks.join(' / ') : '';
            doc.setFontSize(11);
            doc.setFont(primaryFont, "bold");
            doc.text(`CALIBRATION BLOCKS USED: ${blocks}`, margin + 2, currentY + 5);

            // Probe Table
            const tableY = currentY + 8;
            doc.line(margin, tableY, margin + 105, tableY);

            // Headers

            const cols = ["PROBE ANGLE", "0°", "45°", "60°", "70°"];
            const colWidths = [35, 15, 15, 15, 15];
            let x = margin;
            cols.forEach((c, i) => {
                doc.rect(x, tableY, colWidths[i], 5);
                doc.setFontSize(8);
                doc.text(c, x + 2, tableY + 3.5);
                x += colWidths[i];
            });

            // Rows
            const rows = ["Dimension", "Frequency", "Reference Gain", "Range"];
            let rY = tableY + 5;
            rows.forEach((r) => {
                x = margin;
                doc.rect(x, rY, 35, 5);
                doc.setFont(primaryFont, "bold");
                doc.text(r.toUpperCase() + ":", x + 2, rY + 3.5);
                x += 35;

                ["0°", "45°", "60°", "70°"].forEach((deg) => {
                    doc.rect(x, rY, 15, 5);
                    doc.setFont(primaryFont, "normal");
                    const val = data.probes?.[`${r}_${deg}`] || '';
                    doc.text(String(val), x + 2, rY + 3.5);
                    x += 15;
                });
                rY += 5;
            });
            doc.setFontSize(9);

            // Sketch Box
            const sketchX = margin + 105;
            const sketchW = contentWidth - 105;
            doc.text("Scanning Sketch", sketchX + (sketchW / 2), currentY + calibHeight - 2, { align: 'center' });

            const sketchData = data.scanning_sketch;
            let sketchUrl = '';

            if (Array.isArray(sketchData) && sketchData.length > 0) {
                sketchUrl = typeof sketchData[0] === 'object' ? sketchData[0].url : sketchData[0];
            } else if (typeof sketchData === 'object' && sketchData !== null) {
                sketchUrl = sketchData.url;
            } else {
                sketchUrl = sketchData;
            }

            if (sketchUrl) {
                try {
                    let finalUrl = sketchUrl;
                    if (sketchUrl.startsWith('http')) {
                        finalUrl = await getBase64Image(sketchUrl);
                    }

                    if (finalUrl) {
                        const imgProps = doc.getImageProperties(finalUrl);
                        doc.addImage(finalUrl, imgProps.fileType,
                            sketchX + 5, currentY + 2, sketchW - 10, calibHeight - 8, undefined, 'FAST');
                    }
                } catch (e) {
                    console.error("Sketch error", e);
                }
            }

            currentY += calibHeight + 5;
        }

        // Magnetic Particle Testing Template
        if (data.formType === 'magnetic-particle') {
            // Basic Info
            const basicInfo = [
                ["MATERIAL SPEC:", data.material_spec, "PROCEDURE NO:", data.procedure_no],
                ["THICKNESS:", data.thickness, "ACCEPTANCE STANDARD:", data.acceptance_std]
            ];

            basicInfo.forEach((row) => {
                currentY = drawInfoRow(row[0], row[1], row[2], row[3], currentY);
            });
            currentY += 2;

            // Equipment Section
            currentY = checkPageBreak(28);
            const eqHeight = 28;
            doc.rect(margin, currentY, contentWidth, eqHeight);

            // Horizontal lines
            doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);
            doc.line(margin, currentY + 14, margin + contentWidth, currentY + 14);
            doc.line(margin, currentY + 21, margin + contentWidth, currentY + 21);

            // Row 1
            doc.setFont(primaryFont, "bold");
            doc.text("LIGHTING EQUIPMENT:", margin + 2, currentY + 5);
            const lEqWidth = doc.getTextWidth("LIGHTING EQUIPMENT:");
            doc.setFont(primaryFont, "normal");
            doc.text(String(data.lighting_equip || ''), margin + 2 + lEqWidth + 2, currentY + 5);

            doc.setFont(primaryFont, "bold");
            doc.text("INSTRUMENT MAKE:", margin + (contentWidth / 2) + 2, currentY + 5);
            const iMkWidth = doc.getTextWidth("INSTRUMENT MAKE:");
            doc.setFont(primaryFont, "normal");
            doc.text(String(data.instrument_make || ''), margin + (contentWidth / 2) + 2 + iMkWidth + 2, currentY + 5);

            // Row 2
            doc.setFont(primaryFont, "bold");
            doc.text("LIGHT INTENSITY:", margin + 2, currentY + 12);
            const lInWidth = doc.getTextWidth("LIGHT INTENSITY:");
            doc.setFont(primaryFont, "normal");
            doc.text(String(data.light_intensity || ''), margin + 2 + lInWidth + 2, currentY + 12);

            doc.setFont(primaryFont, "bold");
            doc.text("INSTRUMENTS ID:", margin + (contentWidth / 2) + 2, currentY + 12);
            const iIdWidth = doc.getTextWidth("INSTRUMENTS ID:");
            doc.setFont(primaryFont, "normal");
            doc.text(String(data.instrument_id || ''), margin + (contentWidth / 2) + 2 + iIdWidth + 2, currentY + 12);

            // Row 3 - Checkboxes
            drawCheckboxGroup("TYPE OF INST:", ["YOKE", "PROD"], data.instrument_type, margin + 2, currentY + 19);
            drawCheckboxGroup("METHOD:", ["WET", "DRY"], data.method, margin + (contentWidth / 2) + 2, currentY + 19);

            // Row 4 - Checkboxes
            drawCheckboxGroup("TYPE OF CURRENT:", ["AC", "DC"], data.current_type, margin + 2, currentY + 26);
            drawCheckboxGroup("CONTRAST:", ["YES", "NO"], data.contrast || [], margin + (contentWidth / 2) + 2, currentY + 26);

            currentY += eqHeight + 5;
        }

        // Liquid Penetrant Testing Template
        if (data.formType === 'liquid-penetrant') {
            // Basic Infor
            const basicInfo = [
                ["PROCEDURE NO:", data.procedure_no, "TYPE OF PENETRANT:", data.penetrant_type],
                ["ACCEPTANCE STANDARD:", data.acceptance_std, "DEVELOPER FORM:", data.developer_form]
            ];

            basicInfo.forEach((row) => {
                currentY = drawInfoRow(row[0], row[1], row[2], row[3], currentY);
            });
            currentY += 2;

            // Consumables Grid - 3 Row Structure to match user image
            currentY = checkPageBreak(25);
            const gridHeight = 21;
            const col1X = margin;
            const col2X = margin + (contentWidth / 2);

            doc.rect(margin, currentY, contentWidth, gridHeight);

            // Lines
            doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);
            doc.line(margin, currentY + 14, margin + contentWidth, currentY + 14);
            doc.line(col2X, currentY, col2X, currentY + gridHeight);

            // Row 1: Headers
            doc.setFont(primaryFont, "bold");
            doc.setFontSize(10);
            doc.text("PENETRANT", col1X + (contentWidth / 4), currentY + 5, { align: 'center' });
            doc.text("DEVELOPER", col2X + (contentWidth / 4), currentY + 5, { align: 'center' });

            // Row 2: Make/Batch
            doc.setFontSize(8);
            doc.setFont(primaryFont, "bold");
            doc.text("MAKE:", col1X + 2, currentY + 12);
            const mk1W = doc.getTextWidth("MAKE:");
            doc.text("BATCH:", col1X + 45, currentY + 12);
            const bt1W = doc.getTextWidth("BATCH:");

            doc.text("MAKE:", col2X + 2, currentY + 12);
            const mk2W = doc.getTextWidth("MAKE:");
            doc.text("BATCH:", col2X + 45, currentY + 12);
            const bt2W = doc.getTextWidth("BATCH:");

            doc.setFont(primaryFont, "normal");
            doc.text(String(data.penetrant_make || ''), col1X + 2 + mk1W + 2, currentY + 12);
            doc.text(String(data.penetrant_batch || ''), col1X + 45 + bt1W + 2, currentY + 12);
            doc.text(String(data.developer_make || ''), col2X + 2 + mk2W + 2, currentY + 12);
            doc.text(String(data.developer_batch || ''), col2X + 45 + bt2W + 2, currentY + 12);

            // Row 3: Checkboxes
            doc.setFontSize(9);
            doc.setFont(primaryFont, "bold");
            doc.text("TYPE:", col1X + 2, currentY + 19);
            const tW = doc.getTextWidth("TYPE:");
            doc.text("FORM:", col2X + 2, currentY + 19);
            const fW = doc.getTextWidth("FORM:");
            doc.setFont(primaryFont, "normal");

            // Penetrant Type Checkboxes
            const pType = data.penetrant_type_check || [];
            let pX = col1X + 2 + tW + 3;
            drawCheckbox(pX, currentY + 19, 3, pType.includes("Florescent"));
            doc.text("Florescent", pX + 5, currentY + 19);
            pX += 25;
            drawCheckbox(pX, currentY + 19, 3, pType.includes("Non Florescent"));
            doc.text("Non Florescent", pX + 5, currentY + 19);

            // Developer Form Checkboxes
            const dForm = data.developer_form_check || [];
            let dX = col2X + 2 + fW + 3;
            drawCheckbox(dX, currentY + 19, 3, dForm.includes("Wet"));
            doc.text("Wet", dX + 5, currentY + 19);
            dX += 15;
            drawCheckbox(dX, currentY + 19, 3, dForm.includes("Dry"));
            doc.text("Dry", dX + 5, currentY + 19);

            currentY += gridHeight + 5;

            // Validation Info
            const validationInfo = [
                ["SURFACE TEMP:", data.surface_temp, "DWELL TIME:", data.dwell_time],
                ["LIGHT INTENSITY:", data.light_intensity, "DEVELOPING TIME:", data.developing_time]
            ];

            validationInfo.forEach((row) => {
                currentY = drawInfoRow(row[0], row[1], row[2], row[3], currentY);
            });
            currentY += 5;
        }

        // NDT Summary Template
        if (data.formType === 'ndt-summary-report') {
            // Basic Info
            const basicInfo = [
                ["MATERIAL SPEC:", data.material_spec, "PROCEDURE NO:", data.procedure_no],
                ["THICKNESS:", data.thickness, "ACCEPTANCE STANDARD:", data.acceptance_std]
            ];

            basicInfo.forEach((row) => {
                currentY = drawInfoRow(row[0], row[1], row[2], row[3], currentY);
            });
            currentY += 2;

            // Equipment Section (similar to MPT)
            currentY = checkPageBreak(28);
            const eqHeight = 28;
            doc.rect(margin, currentY, contentWidth, eqHeight);

            // Lines and content (simplified - can expand as needed)
            doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);
            doc.line(margin, currentY + 14, margin + contentWidth, currentY + 14);
            doc.line(margin, currentY + 21, margin + contentWidth, currentY + 21);

            doc.setFont(primaryFont, "bold");
            doc.text("INSTRUMENT MAKE:", margin + 2, currentY + 5);
            const imkW = doc.getTextWidth("INSTRUMENT MAKE:");
            doc.setFont(primaryFont, "normal");
            doc.text(String(data.instrument_make || ''), margin + 2 + imkW + 2, currentY + 5);

            doc.setFont(primaryFont, "bold");
            doc.text("INSTRUMENTS ID:", margin + (contentWidth / 2) + 2, currentY + 5);
            const iidW = doc.getTextWidth("INSTRUMENTS ID:");
            doc.setFont(primaryFont, "normal");
            doc.text(String(data.instrument_id || ''), margin + (contentWidth / 2) + 2 + iidW + 2, currentY + 5);

            currentY += eqHeight + 5;
        }

        // -------------------------------- RESULTS TABLE --------------------------------
        const resultsColumns = template?.steps?.find(s => s.id === 'results')?.columns || [];

        if (resultsColumns.length > 0) {
            currentY = checkPageBreak(40);

            const rowHeight = 7;
            const pageBreakThreshold = 50; // Must match checkPageBreak calculation (pageHeight - 50)
            const tableHeaderHeight = 10;

            // Calculate findings height dynamically based on form type
            let findingsHeight = 20;
            if (data.formType === 'liquid-penetrant') {
                findingsHeight = 35; // 30mm box + 5mm margin
            }

            // Available height must leave room for Findings BEFORE the page break threshold
            const availableHeight = pageHeight - currentY - pageBreakThreshold - findingsHeight - tableHeaderHeight;

            let minRows = 0;
            if (data.formType === 'liquid-penetrant') {
                minRows = 5; // User requested exact 5 rows default for LP
            } else {
                const dynamicRows = Math.floor(availableHeight / rowHeight);
                minRows = Math.max(dynamicRows, 0);
            }

            const tableData = (data.results || []).map(row => resultsColumns.map(c => {
                if (c.key === 'result') {
                    return row[c.key] || 'Satisfactory';
                }
                return row[c.key] || '';
            }));

            // Pad with empty rows to fill the page (if space allows)
            while (tableData.length < minRows) {
                tableData.push(new Array(resultsColumns.length).fill(''));
            }

            autoTable(doc, {
                startY: currentY,
                head: [resultsColumns.map(c => c.label)],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 11 },
                bodyStyles: { fillColor: false }, // Transparent for watermark visibility
                styles: {
                    font: primaryFont,
                    fontSize: 11,
                    cellPadding: 2,
                    lineWidth: 0.1,
                    lineColor: 0
                },
                margin: { left: margin, right: margin, bottom: 50 },
                didDrawPage: (data) => {
                    if (data.pageNumber > 1) {
                        drawTemplate(data.pageNumber);
                    }
                    drawWatermark(data.pageNumber);
                }
            });

            currentY = doc.lastAutoTable?.finalY || currentY + 20;
        }

        // -------------------------------- FINDINGS SECTION --------------------------------
        // Skip for Welding Audit as it has its own conclusion
        if (data.formType !== 'welding-assessment-audit') {
            currentY += 5;

            // Recalculate findings height for the check
            let findingsSectionHeight = 20;
            if (data.formType === 'liquid-penetrant') {
                findingsSectionHeight = 35;
            }
            currentY = checkPageBreak(findingsSectionHeight);
        }

        if (data.formType === 'liquid-penetrant') {
            const findingsHeight = 30; // Increased height for manual entry
            doc.rect(margin, currentY, contentWidth, findingsHeight);
            doc.setFontSize(11);
            doc.setFont(primaryFont, "bold"); // Bold label
            doc.text("Findings If Any:", margin + 2, currentY + 5);
            const fWidth = doc.getTextWidth("Findings If Any:");
            doc.setFont(primaryFont, "normal");
            if (data.findings_any) {
                doc.text(String(data.findings_any), margin + 2 + fWidth + 2, currentY + 5);
            }
            currentY += findingsHeight + 2;
        }

        if (data.formType === 'ndt-summary-report' && data.summary_text) {
            doc.setFont(primaryFont, "normal");
            doc.setFontSize(11);
            const splitText = doc.splitTextToSize(data.summary_text, contentWidth - 4);
            doc.text(splitText, margin + 2, currentY + 5);
        }

        // -------------------------------- FINAL PASS: WATERMARK ON ALL PAGES --------------------------------
        const totalPagesCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPagesCount; i++) {
            drawWatermark(i);
        }

        // -------------------------------- SAVE PDF --------------------------------
        if (mode === 'print') {
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } else {
            try {
                // Service-specific code map — each service gets its own prefix
                const SERVICE_CODE_MAP = {
                    'welding-assessment-audit': 'WAA',
                    'ultrasonic-test': 'UT',
                    'magnetic-particle': 'MPT',
                    'liquid-penetrant': 'LPT',
                    'ndt-summary-report': 'NDTS',
                    'pim': 'PIM',
                    'itp-review': 'ITP',
                    'raw-material': 'RMI',
                    'in-process': 'IPI',
                    'welding': 'WI',
                    'ndt-witness': 'NDT-W',
                    'dimensional': 'DIM',
                    'hydro-test': 'HT',
                    'fat': 'FAT',
                    'Engineering Inspection': 'EIR',
                    'Engineering Inspection Report': 'EIR',
                };

                const serviceCode = SERVICE_CODE_MAP[data?.formType] || 'RPT';
                const dateStr = format(new Date(), 'yyyyMMdd');

                // Use report_no if available (already has service prefix e.g. WAA-2026-0001)
                // Otherwise build fallback filename using service code
                const reportNo = (data?.report_no || '').toString().trim();
                const safeReportNo = reportNo
                    ? reportNo.replace(/[\/\\?%*:|"<>]/g, '_')
                    : `${serviceCode}-DRAFT`;

                const filename = `${safeReportNo}_${dateStr}.pdf`;
                doc.save(filename);
            } catch (saveError) {
                console.error('PDF Save Error:', saveError);
                throw saveError;
            }
        }
    } catch (globalError) {
        console.error('NDT PDF Generation Global Error:', globalError);
        console.error('Error Stack:', globalError.stack);
        throw globalError;
    }
};
