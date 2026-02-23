import React, { useMemo, lazy, Suspense } from 'react';
import { useParams, useLocation } from 'react-router-dom';

// Lazy load components to keep bundle size small
const NDT_REPORTS = {
    'ultrasonic-test': lazy(() => import('../../ndt/reports/UT')),
    'magnetic-particle': lazy(() => import('../../ndt/reports/MPT')),
    'liquid-penetrant': lazy(() => import('../../ndt/reports/LPT')),
    'ndt-summary-report': lazy(() => import('../../ndt/reports/SummaryReport')),
    'vt': lazy(() => import('../../ndt/reports/VT')),
    'rt': lazy(() => import('../../ndt/reports/RT')),
    'leak-test': lazy(() => import('../../ndt/reports/LeakTest')),
    'hardness-test': lazy(() => import('../../ndt/reports/HardnessTest')),
    'eddy-current': lazy(() => import('../../ndt/reports/EddyCurrent')),
    'ndt-calib': lazy(() => import('../../ndt/reports/CalibrationRecord')),
};

const PWHT_REPORTS = {
    'pwht-setup': lazy(() => import('../../pwht/reports/SetupReport')),
    'temp-chart': lazy(() => import('../../pwht/reports/TemperatureChart')),
    'heating-log': lazy(() => import('../../pwht/reports/HeatingCycle')),
    'tc-place': lazy(() => import('../../pwht/reports/TCPlacement')),
    'pwht-cert': lazy(() => import('../../pwht/reports/CompletionCertificate')),
};

const WELDING_REPORTS = {
    'wps-review': lazy(() => import('../../welding/reports/WPSReview')),
    'pqr-approval': lazy(() => import('../../welding/reports/PQR')),
    'wqt-report': lazy(() => import('../../welding/reports/WQT')),
    'welding-assessment-audit': lazy(() => import('../../welding/reports/AssessmentAudit')),
    'weld-audit': lazy(() => import('../../welding/reports/ProcedureAudit')),
    'weld-insp': lazy(() => import('../../welding/reports/Inspection')),
    'repair-weld': lazy(() => import('../../welding/reports/RepairWelding')),
    'pwht-mon': lazy(() => import('../../welding/reports/PWHTMonitoring')),
    'weld-map': lazy(() => import('../../welding/reports/WeldMap')),
};

const TPI_REPORTS = {
    'pim': lazy(() => import('../../tpi/reports/PIM')),
    'itp-review': lazy(() => import('../../tpi/reports/ITPReview')),
    'raw-material': lazy(() => import('../../tpi/reports/RawMaterial')),
    'in-process': lazy(() => import('../../tpi/reports/InProcess')),
    'welding': lazy(() => import('../../tpi/reports/TPI')),
    'ndt-witness': lazy(() => import('../../tpi/reports/NDTWitness')),
    'dimensional': lazy(() => import('../../tpi/reports/Dimensional')),
    'hydro-test': lazy(() => import('../../tpi/reports/HydroTest')),
    'fat': lazy(() => import('../../tpi/reports/FAT')),
    'final': lazy(() => import('../../tpi/reports/FinalInspection')),
    'pre-dispatch': lazy(() => import('../../tpi/reports/PreDispatch')),
    'release-note': lazy(() => import('../../tpi/reports/ReleaseNote')),
    'engineering-inspection': lazy(() => import('../../tpi/reports/WeldingInspection')),
};

const PMI_REPORTS = {
    'pmi-test': lazy(() => import('../../pmi/reports/PMI')),
    'alloy-verif': lazy(() => import('../../pmi/reports/AlloyVerification')),
    'mat-comp': lazy(() => import('../../pmi/reports/MaterialComposition')),
    'pmi-calib': lazy(() => import('../../pmi/reports/Calibration')),
    'pmi-summary': lazy(() => import('../../pmi/reports/SummarySheet')),
};


const ReportDispatcher = () => {
    const { serviceType } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const formType = queryParams.get('formType');

    const ReportComponent = useMemo(() => {
        let map = {};
        if (serviceType === 'ndt-services') map = NDT_REPORTS;
        else if (serviceType === 'pwht-services') map = PWHT_REPORTS;
        else if (serviceType === 'welding-consultancy') map = WELDING_REPORTS;
        else if (serviceType === 'third-party-inspection') map = TPI_REPORTS;
        else if (serviceType === 'pmi-services') map = PMI_REPORTS;

        const Component = map[formType] || NDT_REPORTS['ultrasonic-test'];
        return Component;
    }, [serviceType, formType]);

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Report...</div>}>
            <ReportComponent />
        </Suspense>
    );
};

export default ReportDispatcher;
