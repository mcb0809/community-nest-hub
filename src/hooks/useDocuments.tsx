
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Document {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  access_level: 'free' | 'vip';
  category: string;
  tags: string[];
  uploaded_by?: string;
  downloads: number;
  created_at: string;
  updated_at: string;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (documentData: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'downloads'>) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          ...documentData,
          uploaded_by: user?.id,
          downloads: 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      setDocuments(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  const updateDocument = async (id: string, documentData: Partial<Document>) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...documentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setDocuments(prev => prev.map(doc => doc.id === id ? data : doc));
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      // First get the document to get the file URL
      const { data: document } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', id)
        .single();

      if (document?.file_url) {
        // Extract file path from URL
        const filePath = document.file_url.split('/').pop();
        if (filePath) {
          // Delete file from storage
          await supabase.storage
            .from('documents')
            .remove([filePath]);
        }
      }

      // Delete document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch: fetchDocuments
  };
};
