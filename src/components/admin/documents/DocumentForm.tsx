
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const categories = [
  'E-books',
  'Templates', 
  'Presentations',
  'Technical Docs',
  'Guides',
  'Resources'
];

const DocumentForm = ({ document, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    access_level: 'free',
    tags: []
  });
  const [file, setFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        description: document.description || '',
        category: document.category || '',
        access_level: document.access_level || 'free',
        tags: document.tags || []
      });
    }
  }, [document]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('File quá lớn. Vui lòng chọn file nhỏ hơn 50MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!document && !file) {
      alert('Vui lòng chọn file để upload.');
      return;
    }

    try {
      setUploading(true);
      let fileUrl = document?.file_url;
      let fileType = document?.file_type;
      let fileSize = document?.file_size;

      if (file) {
        fileUrl = await uploadFile(file);
        fileType = file.type || file.name.split('.').pop();
        fileSize = file.size;
      }

      const documentData = {
        ...formData,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize
      };

      await onSubmit(documentData);
    } catch (error) {
      console.error('Error submitting document:', error);
      alert('Có lỗi xảy ra khi lưu tài liệu.');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Card className="bg-slate-800 border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {document ? 'Chỉnh Sửa Tài Liệu' : 'Upload Tài Liệu Mới'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          {!document && (
            <div>
              <Label className="text-slate-300">File Tài Liệu *</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-700/50 hover:bg-slate-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-400">
                      <span className="font-semibold">Click để upload</span> hoặc kéo thả file
                    </p>
                    <p className="text-xs text-slate-500">PDF, DOCX, PPTX, ZIP, MD (MAX. 50MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.pptx,.zip,.md,.txt"
                  />
                </label>
                {file && (
                  <p className="mt-2 text-sm text-green-400">
                    Đã chọn: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-slate-300">Tên Tài Liệu *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Nhập tên tài liệu..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-slate-300">Mô Tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Mô tả nội dung tài liệu..."
              rows={3}
            />
          </div>

          {/* Category & Access Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Danh Mục *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Quyền Truy Cập</Label>
              <Select value={formData.access_level} onValueChange={(value) => setFormData(prev => ({ ...prev, access_level: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">FREE</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-slate-300">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Nhập tag và nhấn Enter"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Thêm
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300">
                  {tag}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading || uploading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {(isLoading || uploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {document ? 'Cập Nhật' : 'Lưu Tài Liệu'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || uploading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentForm;
