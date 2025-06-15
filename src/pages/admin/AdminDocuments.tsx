
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentForm from '@/components/admin/documents/DocumentForm';
import DocumentList from '@/components/admin/documents/DocumentList';

const AdminDocuments = () => {
  const { documents, loading, createDocument, updateDocument, deleteDocument } = useDocuments();
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDocument = async (documentData: any) => {
    try {
      setIsSubmitting(true);
      await createDocument(documentData);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDocument = async (documentData: any) => {
    if (!editingDocument) return;
    
    try {
      setIsSubmitting(true);
      await updateDocument(editingDocument.id, documentData);
      setEditingDocument(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      await deleteDocument(documentId);
    }
  };

  const handleEditDocument = (document: any) => {
    setEditingDocument(document);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDocument(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Documents Management</h1>
          <p className="text-slate-400">Quản lý tài liệu và thư viện tài nguyên</p>
        </div>
        
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Tài Liệu
          </Button>
        )}
      </div>

      {showForm ? (
        <DocumentForm
          document={editingDocument}
          onSubmit={editingDocument ? handleUpdateDocument : handleCreateDocument}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      ) : (
        <DocumentList
          documents={documents}
          onEdit={handleEditDocument}
          onDelete={handleDeleteDocument}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AdminDocuments;
