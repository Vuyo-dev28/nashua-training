import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Download, Trash2, RefreshCw, FileSpreadsheet, History, Calendar, LayoutGrid, CheckCircle2, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { storage } from '../utils/storage';
import { exportToCSV } from '../utils/csv';
import { Form, Submission } from '../types';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export function DataViewer() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [formId]);

  const loadData = async () => {
    if (formId) {
      try {
        const loadedForm = await storage.getForm(formId);
        if (loadedForm) {
          setForm(loadedForm);
          const loadedSubmissions = await storage.getSubmissions(formId);
          setSubmissions(loadedSubmissions);
        } else {
          toast.error('Form not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      }
    }
  };
 
  const handleExport = () => {
    if (form) {
      exportToCSV(form, submissions);
      toast.success('CSV file downloaded');
    }
  };
 
  const handleClearSubmissions = async () => {
    if (formId) {
      try {
        await storage.deleteSubmissions(formId);
        await loadData();
        setShowClearDialog(false);
        toast.success('All submissions cleared');
      } catch (error) {
        console.error('Error clearing submissions:', error);
        toast.error('Failed to clear submissions');
      }
    }
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return value?.toString() || '';
  };

  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    { 
      label: 'Total Responses', 
      value: submissions.length, 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Last Response', 
      value: submissions.length > 0 ? new Date(submissions[0].submittedAt).toLocaleDateString() : 'None', 
      icon: Calendar, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      label: 'Form Status', 
      value: 'Active', 
      icon: RefreshCw, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
  ];

  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-50/50 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-50/50 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
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
                Data Viewer
              </Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">{form.name}</h1>
            <p className="text-slate-500 font-medium">Browse and analyze all captured form submissions</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={loadData}
              variant="outline"
              className="h-12 px-5 rounded-2xl bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              disabled={submissions.length === 0}
              className="h-12 px-6 rounded-2xl bg-slate-900 border-none text-white font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 flex-1 md:flex-none"
            >
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Export .CSV
            </Button>
            <Button
              onClick={() => setShowClearDialog(true)}
              disabled={submissions.length === 0}
              variant="ghost"
              className="h-12 w-12 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all p-0 flex-none"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-6">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Table Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="pt-10 pb-6 px-10 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Captured Submissions</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Detailed view of every entry collected</CardDescription>
              </div>
              <Badge className="bg-slate-100 text-slate-600 border-none font-bold py-1 px-3 rounded-xl">{submissions.length} Entries</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {submissions.length === 0 ? (
                <div className="text-center py-24 px-10">
                  <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Yet</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">Once users start scanning your QR code, their responses will appear right here in real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-b border-slate-100 hover:bg-transparent">
                        <TableHead className="w-[80px] font-bold text-slate-400 uppercase tracking-widest text-[10px] px-10 py-5">#</TableHead>
                        <TableHead className="w-[200px] font-bold text-slate-400 uppercase tracking-widest text-[10px] py-5">Timing</TableHead>
                        {form.fields.map((field) => (
                          <TableHead key={field.id} className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-5 whitespace-nowrap min-w-[150px]">
                            {field.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {submissions.map((submission, index) => (
                          <motion.tr
                            key={submission.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <TableCell className="px-10 py-6 font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">
                              {submissions.length - index}
                            </TableCell>
                            <TableCell className="py-6 font-medium text-slate-500 whitespace-nowrap">
                              <span className="block text-slate-900 font-bold">{new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-[10px] font-black uppercase text-slate-300">{new Date(submission.submittedAt).toLocaleDateString()}</span>
                            </TableCell>
                            {form.fields.map((field) => (
                              <TableCell key={field.id} className="py-6 font-semibold text-slate-700">
                                {formatValue(submission.data[field.id]) || <span className="text-slate-300 font-normal italic">—</span>}
                              </TableCell>
                            ))}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="text-center">
              <AlertDialogTitle className="text-2xl font-black tracking-tight text-slate-900">Destroy Dataset?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium font-outfit mt-2">
                You are about to permanently delete <span className="font-bold text-red-600">{submissions.length} stored responses</span>. This action is irreversible.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-3 mt-8 sm:flex-row">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 m-0">
              Keep Data
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearSubmissions}
              className="h-12 flex-1 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-lg shadow-red-100 m-0"
            >
              Yes, Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
