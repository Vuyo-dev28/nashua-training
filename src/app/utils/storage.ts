import { ref, set, get, child, remove, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from './firebase';
import { Form, Submission } from '../types';

const FORMS_PATH = 'forms';
const SUBMISSIONS_PATH = 'submissions';

export const storage = {
  // Forms
  async getForms(): Promise<Form[]> {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, FORMS_PATH));
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          return Object.keys(data).map(key => ({ id: key, ...data[key] } as Form));
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      return [];
    }
  },

  async getForm(id: string): Promise<Form | undefined> {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, `${FORMS_PATH}/${id}`));
      if (snapshot.exists()) {
        return { id: snapshot.key, ...snapshot.val() } as Form;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching form:', error);
      return undefined;
    }
  },

  async saveForm(form: Form): Promise<void> {
    try {
      const formRef = ref(rtdb, `${FORMS_PATH}/${form.id}`);
      await set(formRef, {
        name: form.name,
        description: form.description || '',
        fields: form.fields,
        createdAt: form.createdAt,
        createdBy: form.createdBy
      });
    } catch (error) {
      console.error('Error saving form:', error);
      throw error;
    }
  },

  async deleteForm(id: string): Promise<void> {
    try {
      // Delete the form
      await remove(ref(rtdb, `${FORMS_PATH}/${id}`));
      
      // Delete associated submissions
      const submissions = await this.getSubmissions(id);
      const deletePromises = submissions.map(s => remove(ref(rtdb, `${SUBMISSIONS_PATH}/${s.id}`)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  },

  // Submissions
  async getSubmissions(formId?: string): Promise<Submission[]> {
    try {
      const dbRef = ref(rtdb, SUBMISSIONS_PATH);
      let snapshot;
      
      if (formId) {
        const submissionsQuery = query(dbRef, orderByChild('formId'), equalTo(formId));
        snapshot = await get(submissionsQuery);
      } else {
        snapshot = await get(dbRef);
      }
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          return Object.keys(data).map(key => ({ id: key, ...data[key] } as Submission));
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },

  async saveSubmission(submission: Submission): Promise<void> {
    try {
      const submissionRef = ref(rtdb, `${SUBMISSIONS_PATH}/${submission.id}`);
      await set(submissionRef, {
        formId: submission.formId,
        data: submission.data,
        submittedAt: submission.submittedAt
      });
    } catch (error) {
      console.error('Error saving submission:', error);
      throw error;
    }
  },

  async deleteSubmissions(formId: string): Promise<void> {
    try {
      const submissions = await this.getSubmissions(formId);
      const deletePromises = submissions.map((s: Submission) => remove(ref(rtdb, `${SUBMISSIONS_PATH}/${s.id}`)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing submissions:', error);
      throw error;
    }
  },

  clearAllData(): void {
    console.warn('clearAllData is not implemented for Realtime Database');
  }
};
