import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, QrCode } from 'lucide-react';

export const QRCodeVerification = ({
  reportNo,
  qrToken,
  inspectionResult,
}) => {
  const verificationUrl = `${window.location.origin}/verify/${qrToken}`;

  const handleDownloadQR = () => {
    const svg = document.getElementById('lift-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${reportNo}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Lift Inspection Report - ${reportNo}`,
        text: 'Verify this lift inspection report',
        url: verificationUrl,
      });
    } else {
      navigator.clipboard.writeText(verificationUrl);
      alert('Verification link copied to clipboard');
    }
  };

  const getResultColor = () => {
    switch (inspectionResult) {
      case 'safe':
        return '#22c55e';
      case 'safe_with_action':
        return '#f59e0b';
      case 'not_safe':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          QR Code Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-xl">
          <QRCodeSVG
            id="lift-qr-code"
            value={verificationUrl}
            size={180}
            level="H"
            includeMargin
            fgColor={getResultColor()}
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium">Report: {reportNo}</p>
          <p className="text-xs text-muted-foreground">
            Scan to verify this inspection report
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleDownloadQR}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
