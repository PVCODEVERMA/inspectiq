import { MARGIN, drawInfoRow } from '@/components/services/common/pdf/PdfUtils';

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
