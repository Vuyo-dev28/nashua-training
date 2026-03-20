import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Download, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { storage } from '../utils/storage';
import { exportToCSV } from '../utils/csv';
import { Form, Submission } from '../types';
import { toast } from 'sonner';
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

  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>{form.name} - Submissions</CardTitle>
                <CardDescription>
                  {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'} collected
                </CardDescription>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  onClick={loadData}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={submissions.length === 0}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  onClick={() => setShowClearDialog(true)}
                  disabled={submissions.length === 0}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {submissions.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <p className="text-gray-500 mb-4">No submissions yet</p>
              <p className="text-sm text-gray-400">
                Share your form's QR code to start collecting data
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">#</TableHead>
                      <TableHead className="w-[180px]">Submitted At</TableHead>
                      {form.fields.map((field) => (
                        <TableHead key={field.id}>{field.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission, index) => (
                      <TableRow key={submission.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </TableCell>
                        {form.fields.map((field) => (
                          <TableCell key={field.id}>
                            {formatValue(submission.data[field.id])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Submissions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {submissions.length} submission{submissions.length === 1 ? '' : 's'}? 
              This action cannot be undone. Make sure to export your data first if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearSubmissions}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
