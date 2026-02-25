// --- Constants ---
const MARGIN = 15;
const BOX_PAD = 2;

// --- Drawing Helpers ---
const drawCheckbox = (doc, x, y, size = 3, checked = false) => {
    doc.rect(x, y - 3, size, size);
    if (checked) {
        doc.setFontSize(8);
        doc.text("X", x + 0.6, y - 0.4);
        doc.setFontSize(9);
    }
};

const drawCheckboxGroup = (doc, label, options, values, startX, y, fontName = "times", fontSize = 11) => {
    doc.setFontSize(fontSize);
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


export const generateGenericSafety = (doc, data, currentY, contentWidth, primaryFont, title) => {
    // Key Safety Info
    const safetyInfo = [
        ["AUDIT TYPE:", data.audit_type || title, "AUDITOR:", data.auditor_name],
        ["LOCATION:", data.location, "DATE:", data.inspection_date]
    ];

    safetyInfo.forEach((row) => {
        currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont);
    });
    currentY += 5;

    // Compliance Checklist Section (Example)
    const checklistY = currentY;
    doc.rect(MARGIN, checklistY, contentWidth, 30);

    doc.setFont(primaryFont, "bold");
    doc.text("COMPLIANCE SUMMARY", MARGIN + 2, checklistY + 5);

    // Checkboxes for compliance
    drawCheckboxGroup(doc, "PPE Compliance:", ["Pass", "Fail"], data.ppe_compliance, MARGIN + 2, checklistY + 12, primaryFont);
    drawCheckboxGroup(doc, "Fire Safety:", ["Pass", "Fail"], data.fire_safety, MARGIN + 2, checklistY + 20, primaryFont);
    drawCheckboxGroup(doc, "Work Permits:", ["Pass", "Fail"], data.work_permits, MARGIN + (contentWidth / 2), checklistY + 12, primaryFont);

    currentY += 35;
    return currentY;
};
