// --- Constants ---
const MARGIN = 15;
const BOX_PAD = 2;

// --- Drawing Helpers ---
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


const generateGenericTraining = (doc, data, currentY, contentWidth, primaryFont, title) => {
    doc.setFont(primaryFont, "bold");
    doc.text(`${title}`, MARGIN + 2, currentY + 5);
    currentY += 10;
    const info = [
        ["COURSE:", data.course_name, "TRAINER:", data.trainer_name],
        ["DURATION:", data.duration, "ATTENDEES:", data.attendee_count]
    ];
    info.forEach(row => { currentY = drawInfoRow(doc, row[0], row[1], row[2], row[3], currentY, contentWidth, primaryFont); });
    currentY += 5;
    return currentY;
};

export const generateAttendance = (doc, data, cy, cw, pf) => generateGenericTraining(doc, data, cy, cw, pf, "ATTENDANCE SHEET");
export const generateCourseEval = (doc, data, cy, cw, pf) => generateGenericTraining(doc, data, cy, cw, pf, "COURSE EVALUATION");
export const generateExamReport = (doc, data, cy, cw, pf) => generateGenericTraining(doc, data, cy, cw, pf, "EXAM REPORT");
export const generatePracticalAssess = (doc, data, cy, cw, pf) => generateGenericTraining(doc, data, cy, cw, pf, "PRACTICAL ASSESSMENT");
export const generateCandidateFeed = (doc, data, cy, cw, pf) => generateGenericTraining(doc, data, cy, cw, pf, "CANDIDATE FEEDBACK");
export const generateCertIssue = (doc, data, cy, cw, pf) => generateGenericTraining(doc, data, cy, cw, pf, "CERTIFICATE ISSUE");
