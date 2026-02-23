import React from 'react';
import { useIndustrialForm } from '@/hooks/useIndustrialForm';
import { IndustrialFormUI } from '@/components/services/common/reports/IndustrialFormUI';

const VT = () => {
    const formProps = useIndustrialForm();
    return <IndustrialFormUI {...formProps} />;
};

export default VT;
