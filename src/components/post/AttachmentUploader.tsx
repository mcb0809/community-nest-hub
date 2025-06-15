
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Image, X, Eye } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface AttachmentUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

const AttachmentUploader = ({ 
  onFilesChange, 
  maxFiles = 10
}: AttachmentUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{[key: string]: string}>({});

  const createImagePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [file.name]: url }));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    onFilesChange(newFiles);
    
    // Create previews for new image files
    acceptedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        createImagePreview(file);
      }
    });
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    }
  });

  const removeFile = (indexToRemove: number) => {
    const fileToRemove = files[indexToRemove];
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(newFiles);
    onFilesChange(newFiles);
    
    // Clean up preview URL
    if (previewUrls[fileToRemove.name]) {
      URL.revokeObjectURL(previewUrls[fileToRemove.name]);
      setPreviewUrls(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[fileToRemove.name];
        return newPreviews;
      });
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        {...getRootProps()}
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive ? (
            'Thả file vào đây...'
          ) : (
            <>
              Kéo thả file vào đây hoặc <span className="text-blue-500 font-medium">click để chọn</span>
              <br />
              <span className="text-xs text-gray-400">
                Hỗ trợ: Hình ảnh, Video, PDF, Word, Text, Zip (tối đa {maxFiles} files)
              </span>
            </>
          )}
        </p>
      </Card>

      {/* File List with Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Files đã chọn ({files.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* Image Preview */}
                {file.type.startsWith('image/') && previewUrls[file.name] && (
                  <div className="mb-3">
                    <img
                      src={previewUrls[file.name]}
                      alt={`Preview of ${file.name}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                
                {/* File Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                        {file.type && (
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                            {file.type.split('/')[1]?.toUpperCase()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;
