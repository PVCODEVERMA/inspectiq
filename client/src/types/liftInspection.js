export const defaultDocumentationReview = [
  { item: 'Valid Maintenance Contract', status: '', remarks: '' },
  { item: 'Previous Inspection Report', status: '', remarks: '' },
  { item: 'Log Book / Maintenance Records', status: '', remarks: '' },
  { item: 'Operating Instructions', status: '', remarks: '' },
];

export const defaultMachineRoomInspection = [
  { item: 'Access & Housekeeping', condition: '', remarks: '' },
  { item: 'Main Switch & Isolation', condition: '', remarks: '' },
  { item: 'Machine & Motor Condition', condition: '', remarks: '' },
  { item: 'Brake Operation', condition: '', remarks: '' },
  { item: 'Rope/Chain Condition & Lubrication', condition: '', remarks: '' },
  { item: 'Lighting (Min 50 Lux)', condition: '', remarks: '' },
];

export const defaultHoistwayInspection = [
  { item: 'Shaft Cleanliness', condition: '', remarks: '' },
  { item: 'Guide Rails & Fastenings', condition: '', remarks: '' },
  { item: 'Traveling Cable', condition: '', remarks: '' },
];

export const defaultCarLandingInspection = [
  { item: 'Car Door Operation', condition: '', remarks: '' },
  { item: 'Landing Door Locks', condition: '', remarks: '' },
  { item: 'Door Safety Devices', condition: '', remarks: '' },
  { item: 'Car Lighting & Fan', condition: '', remarks: '' },
  { item: 'Alarm Bell', condition: '', remarks: '' },
];

export const defaultSafetyDevicesTested = [
  { item: 'Over-speed Governor', result: '', remarks: '' },
  { item: 'Safety Gear', result: '', remarks: '' },
  { item: 'Final Limit Switches', result: '', remarks: '' },
  { item: 'Door Interlocks', result: '', remarks: '' },
  { item: 'Emergency Stop Switch', result: '', remarks: '' },
];

export const getDefaultFormData = () => ({
  serviceId: '',
  clientName: '',
  reportNo: '',
  inspectorName: '',
  reportReference: '',
  warehouseName: '',
  inspectionDate: new Date(),
  warehouseAddress: '',
  liftIdentificationNo: '',
  manufacturer: '',
  yearOfInstallation: '',
  ratedLoadKg: '',
  ratedSpeedMs: '',
  numberOfStops: '',
  inspectionTypes: [],
  referralCodes: [],
  liftTypes: [],
  driveSystem: '',
  controlSystem: '',
  documentationReview: [...defaultDocumentationReview],
  machineRoomInspection: [...defaultMachineRoomInspection],
  hoistwayInspection: [...defaultHoistwayInspection],
  carLandingInspection: [...defaultCarLandingInspection],
  safetyDevicesTested: [...defaultSafetyDevicesTested],
  levelingAccuracy: '',
  noiseVibration: '',
  observations: '',
  recommendations: '',
  correctiveActionDate: null,
  inspectionResult: '',
  inspectorDeclarationConfirmed: false,
  inspectorSignatureUrl: '',
  declarationDate: new Date(),
  photos: [],
});
