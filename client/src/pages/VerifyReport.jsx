import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  Calendar,
  Building,
  User,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';

const VerifyReport = () => {
  const { token } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      verifyReport(token);
    }
  }, [token]);

  const verifyReport = async (qrToken) => {
    try {
      const response = await api.get(`/inspections/verify/${qrToken}`);
      const data = response.data;

      if (data) {
        setReport(data);
      } else {
        setError('Report not found');
      }
    } catch (err) {
      setError('Invalid or expired verification code');
    }
    setLoading(false);
  };

  const getResultDisplay = () => {
    switch (report?.inspection_result) {
      case 'safe':
        return {
          icon: CheckCircle,
          text: 'SAFE for use',
          color: 'text-green-600',
          bg: 'bg-green-50',
        };
      case 'safe_with_action':
        return {
          icon: AlertTriangle,
          text: 'SAFE with recommended actions',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
        };
      case 'not_safe':
        return {
          icon: XCircle,
          text: 'NOT SAFE for use',
          color: 'text-red-600',
          bg: 'bg-red-50',
        };
      default:
        return {
          icon: QrCode,
          text: 'Pending',
          color: 'text-gray-600',
          bg: 'bg-gray-50',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  const result = getResultDisplay();
  const ResultIcon = result.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Report Verification" subtitle="Lift Inspection Report" />

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Verification Status */}
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-green-600 mb-2">
            Report Verified
          </h2>
          <p className="text-muted-foreground">
            This is an authentic inspection report
          </p>
        </div>

        {/* Report Details */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Report Details</h3>
            <Badge variant="outline">{report.report_no}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{report.client_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Inspection Date</p>
                <p className="font-medium">
                  {format(new Date(report.inspection_date), 'PPP')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <QrCode className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Lift ID</p>
                <p className="font-medium">{report.lift_identification_no}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{report.warehouse_name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Result */}
        <div className={`rounded-2xl p-6 ${result.bg}`}>
          <div className="flex items-center gap-4">
            <ResultIcon className={`w-12 h-12 ${result.color}`} />
            <div>
              <h3 className="font-semibold text-lg">Inspection Result</h3>
              <p className={`text-xl font-bold ${result.color}`}>{result.text}</p>
            </div>
          </div>
        </div>

        {/* AI Risk Score */}
        {report.ai_risk_score !== undefined && report.ai_risk_score !== null && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold mb-4">AI Risk Assessment</h3>
            <div className="flex items-center gap-4">
              <div
                className={`text-4xl font-bold ${report.ai_risk_score >= 80
                  ? 'text-green-500'
                  : report.ai_risk_score >= 50
                    ? 'text-amber-500'
                    : 'text-red-500'
                  }`}
              >
                {report.ai_risk_score}
              </div>
              <div>
                <p className="font-medium">Risk Score</p>
                <p className="text-sm text-muted-foreground">Out of 100</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyReport;
