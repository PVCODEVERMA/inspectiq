import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { reportTemplates } from '@/data/reportTemplates';
import { industrialReportTypes } from '@/data/industrialReportTypes';

export const useIndustrialForm = () => {
    const { id, serviceType, inspectionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Query Params
    const queryParams = new URLSearchParams(location.search);
    const serviceIdFromUrl = queryParams.get('serviceId');
    const formTypeFromUrl = queryParams.get('formType') || 'inspection';
    const pageTitle = queryParams.get('title');

    // Validate if the ID from URL is a valid MongoDB ObjectId (24 hex chars)
    const isValidObjectId = (str) => /^[0-9a-fA-F]{24}$/.test(str);

    const validServiceId = isValidObjectId(id) ? id : (isValidObjectId(serviceIdFromUrl) ? serviceIdFromUrl : null);
    const reportId = isValidObjectId(inspectionId) ? inspectionId : null;

    // 4. Template Helper
    const getTemplate = (fTypeRaw) => {
        const normalizedType = (fTypeRaw || '').toLowerCase().replace(/[\s\-_]+/g, '-');
        let temp = reportTemplates[fTypeRaw] || reportTemplates[normalizedType];

        if (!temp) {
            Object.values(industrialReportTypes).forEach(group => {
                const found = group.find(t => t.id === fTypeRaw || t.title === fTypeRaw || t.id === normalizedType);
                if (found && reportTemplates[found.id]) {
                    temp = reportTemplates[found.id];
                }
            });
        }
        return temp || reportTemplates['ultrasonic-test'];
    };

    // Initial empty state helper
    const getInitialState = (fType) => {
        const today = new Date().toISOString().split('T')[0];
        const template = getTemplate(fType);
        const steps = template?.steps || [];

        return {
            serviceId: validServiceId || '',
            formType: fType,
            status: 'draft',
            date: today,
            inspection_date: today,
            ...Object.fromEntries(
                steps.flatMap(s => s.fields || []).map(f => [
                    f.id,
                    f.id === 'date' || f.id === 'inspection_date' ? today : (f.defaultValue || '')
                ])
            ),
            results: [],
            probes: {},
            calibration_blocks: [],
            instrument_type: [],
            method: [],
            current_type: [],
            contrast: [],
            penetrant_type_check: [],
            developer_form_check: []
        };
    };

    const [formData, setFormData] = useState(getInitialState(formTypeFromUrl));
    const [isLoading, setIsLoading] = useState(false);
    const isSavingRef = useRef(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraFieldId, setCameraFieldId] = useState(null);
    const [clients, setClients] = useState([]);
    const [clientSearchOpen, setClientSearchOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState("");
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerData, setViewerData] = useState(null);

    const activeTemplate = useMemo(() => {
        return getTemplate(formData.formType || formTypeFromUrl);
    }, [formData.formType, formTypeFromUrl]);

    useEffect(() => {
        if (!reportId) {
            setFormData(getInitialState(formTypeFromUrl));
        }
    }, [reportId, formTypeFromUrl, validServiceId]);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await api.get('/clients');
                setClients(res.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };
        fetchClients();
    }, []);

    useEffect(() => {
        const fetchReport = async () => {
            if (!reportId) return;
            try {
                setIsLoading(true);
                let endpoint = `/inspections/${reportId}`;
                const fType = formTypeFromUrl;

                if (fType === 'ultrasonic-test') endpoint = `/ndt/ultrasonic/${reportId}`;
                else if (fType === 'magnetic-particle') endpoint = `/ndt/magnetic-particle/${reportId}`;
                else if (fType === 'liquid-penetrant') endpoint = `/ndt/liquid-penetrant/${reportId}`;
                else if (fType === 'ndt-summary-report') endpoint = `/ndt/summary/${reportId}`;
                else if (fType === 'Engineering Inspection Report' || fType === 'Engineering Inspection') endpoint = `/tpi/engineering/${reportId}`;
                else if (fType === 'welding-assessment-audit') endpoint = `/consultancy/welding-audit/${reportId}`;

                const res = await api.get(endpoint);
                const data = res.data;

                setFormData(prev => ({
                    ...prev,
                    ...data,
                    date: data.date ? new Date(data.date) : new Date(),
                    results: data.results || [],
                    probes: data.probes || {},
                    calibration_blocks: data.calibration_blocks || [],
                }));
            } catch (error) {
                console.error("Error fetching report:", error);
                toast.error("Failed to load report details");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [reportId, formTypeFromUrl]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxGroup = (fieldId, option, checked) => {
        setFormData(prev => {
            const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
            if (checked) {
                return { ...prev, [fieldId]: [...current, option] };
            } else {
                return { ...prev, [fieldId]: current.filter(item => item !== option) };
            }
        });
    };

    const handleGridInput = (fieldId, row, col, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: {
                ...prev[fieldId],
                [`${row}_${col}`]: value
            }
        }));
    };

    const handleClientChange = (clientId) => {
        const client = clients.find(c => c._id === clientId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                client_name: client.name,
                location: client.address || prev.location
            }));
        }
    };

    const handlePhotoUpload = async (e, fieldId) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('photo', file);

        const appendImage = (url, name) => {
            setFormData(prev => {
                const existing = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
                return { ...prev, [fieldId]: [...existing, { url, name }] };
            });
        };

        try {
            const response = await api.post('/upload/single', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = `http://localhost:5000${response.data.url}`;
            appendImage(url, file.name);
            toast.success("Photo uploaded");
        } catch (error) {
            const reader = new FileReader();
            reader.onloadend = () => {
                appendImage(reader.result, file.name);
            };
            reader.readAsDataURL(file);
            toast.success("Photo preview loaded");
        }
    };

    const handleTableAdd = (stepId, columns) => {
        const emptyRow = Object.fromEntries(columns.map(c => {
            if (c.type === 'select' && c.options?.length > 0) {
                return [c.key, c.options[0]];
            }
            return [c.key, ''];
        }));
        setFormData(prev => ({
            ...prev,
            [stepId]: [...(prev[stepId] || []), emptyRow]
        }));
    };

    const handleTableChange = (stepId, idx, key, value) => {
        setFormData(prev => {
            const newTable = [...(prev[stepId] || [])];
            newTable[idx] = { ...newTable[idx], [key]: value };
            return { ...prev, [stepId]: newTable };
        });
    };

    const handleTableRemove = (stepId, idx) => {
        setFormData(prev => ({
            ...prev,
            [stepId]: prev[stepId].filter((_, i) => i !== idx)
        }));
    };

    const handleSave = async (isDraft = true, pdfAction = null) => {
        const fType = formData.formType || formTypeFromUrl;
        if (!formData.client_name) {
            toast.error("Please enter the Client Name to proceed.");
            return;
        }

        if ((fType === 'engineering-inspection' || fType === 'Engineering Inspection Report') && !formData.project_name) {
            toast.error("Project Name is required.");
            return;
        }

        if (isSavingRef.current) return;
        isSavingRef.current = true;

        try {
            setIsLoading(true);
            const payload = {
                ...formData,
                status: isDraft ? 'draft' : 'submitted',
                serviceType: serviceType,
                formType: fType,
                client_name: formData.client_name,
                inspection_date: formData.date || formData.inspection_date || new Date(),
                project_name: formData.project_name || 'N/A'
            };

            if (!reportId && !payload.report_no) {
                delete payload.report_no;
            }

            // Cleanup payload
            Object.keys(payload).forEach(key => {
                const value = payload[key];
                if (value === '' || value === null || value === undefined) {
                    const fieldsToKeep = ['client_name', 'vendor_name', 'location', 'po_number', 'auditor_remarks', 'audited_by_name', 'reviewed_by_name', 'serviceId', 'project_name'];
                    if (!fieldsToKeep.includes(key)) delete payload[key];
                } else if (typeof value === 'number' && isNaN(value)) {
                    delete payload[key];
                } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                    if (Object.keys(value).length === 0) delete payload[key];
                } else if (Array.isArray(value) && value.length === 0 && key !== 'results') {
                    delete payload[key];
                }
            });

            let endpoint = '/inspections';
            if (fType === 'ultrasonic-test') endpoint = '/ndt/ultrasonic';
            else if (fType === 'magnetic-particle') endpoint = '/ndt/magnetic-particle';
            else if (fType === 'liquid-penetrant') endpoint = '/ndt/liquid-penetrant';
            else if (fType === 'ndt-summary-report') endpoint = '/ndt/summary';
            else if (fType === 'Engineering Inspection Report' || fType === 'Engineering Inspection') endpoint = '/tpi/engineering';
            else if (fType === 'welding-assessment-audit') endpoint = '/consultancy/welding-audit';

            let savedReport;
            if (reportId) {
                const res = await api.put(`${endpoint}/${reportId}`, payload);
                savedReport = res.data;
                if (!pdfAction) toast.success(isDraft ? "Draft Updated Successfully!" : "Report Updated Successfully!");
            } else {
                const res = await api.post(endpoint, payload);
                savedReport = res.data;
                setFormData(prev => ({ ...prev, ...savedReport }));
                if (!pdfAction) toast.success(isDraft ? "Draft Saved Successfully!" : "Report Submitted Successfully!");
                const newPath = `/services/industrial-inspection/${serviceType}/${savedReport._id}/edit?formType=${fType}`;
                navigate(newPath, { replace: true, state: { ...savedReport } });
            }

            if (pdfAction && savedReport) {
                try {
                    const { generateIndustrialPDF } = await import('@/components/services/common/pdf/generateIndustrialPDF');
                    const pdfData = { ...formData, ...savedReport, report_no: savedReport.report_no || formData.report_no, formType: fType };
                    await generateIndustrialPDF(pdfData, activeTemplate, pdfAction);
                    toast.success(`Report ${pdfAction === 'print' ? 'ready to print' : 'downloaded'}!`);
                } catch (pdfError) {
                    console.error("PDF Generation Error:", pdfError);
                    toast.error(`PDF Failed: ${pdfError.message}`);
                }
            }

            if (!pdfAction && !isDraft) navigate(-1);
        } catch (error) {
            console.error("Save Error:", error);
            const serverMessage = error.response?.data?.message;
            toast.error(`Operation failed: ${serverMessage || error.message}`);
        } finally {
            setIsLoading(false);
            setTimeout(() => { isSavingRef.current = false; }, 1000);
        }
    };

    return {
        formData, setFormData,
        isLoading, setIsLoading,
        activeTemplate,
        cameraOpen, setCameraOpen,
        cameraFieldId, setCameraFieldId,
        clients,
        clientSearchOpen, setClientSearchOpen,
        clientSearch, setClientSearch,
        viewerOpen, setViewerOpen,
        viewerData, setViewerData,
        pageTitle,
        handleInputChange,
        handleSelectChange,
        handleCheckboxGroup,
        handleGridInput,
        handleClientChange,
        handlePhotoUpload,
        handleTableAdd,
        handleTableChange,
        handleTableRemove,
        handleSave,
        navigate,
        reportId
    };
};
