import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Download, Copy, Share2, QrCode, ExternalLink, Printer, Info, Check, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { storage } from '../utils/storage';
import { Form } from '../types';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';

export function QRCodeView() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [formUrl, setFormUrl] = useState('');

  useEffect(() => {
    const loadFormData = async () => {
      if (formId) {
        try {
          const loadedForm = await storage.getForm(formId);
          if (loadedForm) {
            setForm(loadedForm);
            // Create the public form URL
            const url = `${window.location.origin}/f/${formId}`;
            setFormUrl(url);
          } else {
            toast.error('Form not found');
            navigate('/');
          }
        } catch (error) {
          console.error('Error loading form:', error);
          toast.error('Failed to load sharing details');
        }
      }
    };
    loadFormData();
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
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-50/50 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-50/50 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="rounded-full bg-white shadow-sm border border-slate-200 h-10 w-10 p-0 hover:bg-slate-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold uppercase tracking-wider text-[10px] px-2 py-0">
                Sharing Portal
              </Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">{form.name}</h1>
          </div>
          
          <Button
            onClick={() => window.open(formUrl, '_blank')}
            variant="outline"
            className="h-12 px-5 rounded-2xl bg-white border-slate-200 text-indigo-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Live Preview
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Main QR Card */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white h-full flex flex-col">
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500" />
              <CardContent className="p-10 flex flex-col flex-1">
                <div className="bg-slate-50 rounded-[2.5rem] p-12 flex items-center justify-center relative group">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="bg-white p-6 rounded-3xl shadow-xl group-hover:scale-105 transition-transform duration-500"
                  >
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={formUrl}
                      size={240}
                      level="H"
                      includeMargin={false}
                      className="rounded-lg"
                    />
                  </motion.div>
                  
                  {/* Floating badge */}
                  <div className="absolute -bottom-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest py-2 px-6 rounded-full shadow-xl shadow-indigo-100 border-4 border-white">
                    Scan Me
                  </div>
                </div>

                <div className="mt-12 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Direct Link</Label>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                      <Input
                        value={formUrl}
                        readOnly
                        className="bg-transparent border-none focus-visible:ring-0 font-medium text-slate-600 truncate py-0 h-10"
                      />
                      <Button onClick={copyUrl} className="h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm px-4">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={downloadQRCode} className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 transition-all group">
                      <Download className="mr-3 h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                      Save PNG
                    </Button>
                    <Button onClick={shareUrl} className="h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-xl shadow-slate-200 transition-all group">
                      <Share2 className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Share Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Guidelines Sidebar */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
              <CardHeader className="p-8 pb-0">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                  <Info className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">How to deploy</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <ul className="space-y-6">
                  {[
                    { text: 'Download the high-res PNG for professional printing.', icon: Download },
                    { text: 'Place the QR code on tables, signs, or digital displays.', icon: Printer },
                    { text: 'Users scan with any smartphone camera to begin.', icon: QrCode },
                  ].map((step, idx) => (
                    <li key={idx} className="flex gap-4 items-start group">
                      <div className="bg-white/10 w-8 h-8 rounded-lg flex items-center justify-center flex-none group-hover:bg-white/20 transition-colors">
                        <step.icon className="w-4 h-4" />
                      </div>
                      <p className="text-indigo-50 font-medium leading-tight pt-1">{step.text}</p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-10 p-5 bg-white/10 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span className="font-black text-xs uppercase tracking-widest">Ready to go</span>
                  </div>
                  <p className="text-sm text-indigo-100 leading-relaxed font-outfit">
                    Your form is live and secure. All data collected is stored in your private database.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-8 group hover:bg-slate-50 transition-all pointer-events-none">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 leading-none">Responses</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Real-time sync enabled</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
