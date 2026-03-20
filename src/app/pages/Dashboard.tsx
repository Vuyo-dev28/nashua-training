import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, QrCode, Database, Edit, Trash2, LogOut, BarChart3, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { storage } from '../utils/storage';
import { Form } from '../types';
import { useAuth } from '../utils/auth';
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

export function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const loadedForms = await storage.getForms();
      setForms(loadedForms);
      
      const counts: Record<string, number> = {};
      await Promise.all(loadedForms.map(async (form) => {
        const submissions = await storage.getSubmissions(form.id);
        counts[form.id] = submissions.length;
      }));
      setSubmissionCounts(counts);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (formId: string) => {
    try {
      await storage.deleteForm(formId);
      await loadForms();
      setDeleteFormId(null);
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const totalSubmissions = Object.values(submissionCounts).reduce((a, b) => a + b, 0);

  const stats = [
    { label: 'Total Forms', value: forms.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Submissions', value: totalSubmissions, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Avg. per Form', value: forms.length ? (totalSubmissions / forms.length).toFixed(1) : 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 pt-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage your data collection forms and view results</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={() => navigate('/form/new')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 h-12 px-6 rounded-xl font-bold flex-1 md:flex-none"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Form
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
              <Card className="border-none shadow-sm bg-white overflow-hidden relative">
                <div className={`absolute top-0 right-0 p-4 ${stat.bg} rounded-bl-3xl`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-500 font-medium uppercase tracking-wider text-xs">
                    {stat.label}
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Forms Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 px-1">Your Forms</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : forms.length === 0 ? (
            <Card className="text-center p-16 border-dashed border-2 border-slate-200 bg-transparent shadow-none">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <CardTitle className="text-slate-900 mb-2">No forms found</CardTitle>
              <CardDescription className="mb-8 text-lg">
                Get started by creating your first data collection form
              </CardDescription>
              <Button 
                onClick={() => navigate('/form/new')} 
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Form
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {forms.map((form, i) => (
                  <motion.div
                    key={form.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <Card className="group hover:shadow-xl transition-all duration-300 border-none shadow-sm bg-white overflow-hidden border-t-4 border-t-indigo-500">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                            {form.fields.length} Fields
                          </span>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                            {new Date(form.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {form.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-slate-500">
                          {form.description || 'No description provided'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600 flex items-center">
                              <Users className="h-4 w-4 mr-2 text-slate-400" />
                              Submissions
                            </span>
                            <span className="text-lg font-bold text-slate-900">
                              {submissionCounts[form.id] || 0}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/form/edit/${form.id}`)}
                              className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-medium"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/form/${form.id}/qr`)}
                              className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-medium"
                            >
                              <QrCode className="mr-2 h-4 w-4" />
                              QR Code
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/form/${form.id}/data`)}
                              className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-medium"
                            >
                              <Database className="mr-2 h-4 w-4" />
                              Data
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteFormId(form.id)}
                              className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all font-medium"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteFormId !== null} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-lg">
              This will permanently delete the form and all its submissions. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="border-slate-200 text-slate-600 rounded-xl px-6 py-2">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFormId && handleDelete(deleteFormId)}
              className="bg-red-600 hover:bg-red-700 text-white border-none rounded-xl px-6 py-2"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
