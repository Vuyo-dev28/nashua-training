import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Download, Copy, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { storage } from '../utils/storage';
import { Form } from '../types';
import { toast } from 'sonner';

export function QRCodeView() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [formUrl, setFormUrl] = useState('');

  useEffect(() => {
    if (formId) {
      const loadedForm = storage.getForm(formId);
      if (loadedForm) {
        setForm(loadedForm);
        // Create the public form URL
        const url = `${window.location.origin}/f/${formId}`;
        setFormUrl(url);
      } else {
        toast.error('Form not found');
        navigate('/');
      }
    }
  }, [formId, navigate]);

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${form?.name.replace(/\s+/g, '_')}_QR_Code.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('QR code downloaded');
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(formUrl);
    toast.success('URL copied to clipboard');
  };

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: form?.name,
          text: `Fill out this form: ${form?.name}`,
          url: formUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      copyUrl();
    }
  };

  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
            <CardDescription>
              Share this QR code with participants to collect their information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center p-8 bg-white rounded-lg">
              <QRCodeSVG
                id="qr-code-svg"
                value={formUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-2">
              <Label>Form URL</Label>
              <div className="flex gap-2">
                <Input
                  value={formUrl}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyUrl} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={downloadQRCode} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              <Button onClick={shareUrl} variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share URL
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="mb-2">How to use:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Download the QR code image</li>
                <li>Print it or display it on your device</li>
                <li>Participants scan the code with their phone camera</li>
                <li>They'll be directed to fill out the form</li>
                <li>View all submissions in the Data Viewer</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
