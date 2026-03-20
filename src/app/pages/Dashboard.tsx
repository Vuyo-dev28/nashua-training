import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, QrCode, Database, Edit, Trash2, LogOut } from 'lucide-react';
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
      
      // Load submission counts for each form
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

  const getSubmissionCount = (formId: string) => {
    return submissionCounts[formId] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl mb-2">Trainer Data Collection</h1>
            <p className="text-gray-600">Create forms, generate QR codes, and collect participant data</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={logout}
              className="flex-1 md:flex-none"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <Button
              onClick={() => navigate('/form/new')}
              className="flex-1 md:flex-none"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Form
            </Button>
          </div>
        </div>

        {forms.length === 0 ? (
          <Card className="text-center p-12">
            <CardHeader>
              <CardTitle>No Forms Yet</CardTitle>
              <CardDescription>
                Create your first form to start collecting data from participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/form/new')} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{form.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {form.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{form.fields.length} fields</span>
                      <span>{getSubmissionCount(form.id)} submissions</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/form/edit/${form.id}`)}
                        className="w-full"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/form/${form.id}/qr`)}
                        className="w-full"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        QR Code
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/form/${form.id}/data`)}
                        className="w-full"
                      >
                        <Database className="mr-2 h-4 w-4" />
                        View Data
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteFormId(form.id)}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteFormId !== null} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this form? This will also delete all associated submissions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFormId && handleDelete(deleteFormId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
