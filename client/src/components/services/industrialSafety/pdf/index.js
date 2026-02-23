// Safety PDF Generators — each report type in its own subfolder
export { generateSafetyAudit } from './safety-audit/generateSafetyAudit';
export {
    generateRiskAssess,
    generatePPEInsp,
    generateFireSafety,
    generateLifting,
    generatePermitAudit,
    generateAccidentInv,
    generateToolboxTalk
} from './other/generateSafetyOther';
