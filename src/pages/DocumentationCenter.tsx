
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Folder,
  File,
  Plus,
  Star,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';

const DocumentationCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { documents, loading } = useDocuments();

  // Generate dynamic folders from documents
  const folders = [
    { id: 'all', name: 'All Documents', count: documents.length, icon: FileText },
    ...Array.from(new Set(documents.map(doc => doc.category))).map(category => ({
      id: category,
      name: category,
      count: documents.filter(doc => doc.category === category).length,
      icon: File
    }))
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFolder = selectedFolder === 'all' || doc.category === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'free': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'vip': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getFileTypeIcon = (type: string) => {
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300">Đang tải tài liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Documentation Center</h1>
          <p className="text-slate-600 dark:text-slate-400">Truy cập thư viện tài nguyên toàn diện của chúng tôi</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Tìm kiếm tài liệu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Folders Sidebar */}
        <div className="lg:w-64 space-y-2">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Danh Mục</h3>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <folder.icon className="w-5 h-5" />
                <span className="font-medium">{folder.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {folder.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Documents Grid/List */}
        <div className="flex-1">
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredDocuments.map((doc) => {
              const FileIcon = getFileTypeIcon(doc.file_type);
              
              return (
                <Card key={doc.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getAccessLevelColor(doc.access_level)}>
                        {doc.access_level.toUpperCase()}
                      </Badge>
                      <div className="flex items-center text-slate-500">
                        <Download className="w-4 h-4 mr-1" />
                        <span className="text-sm">{doc.downloads}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {doc.file_type.toUpperCase()} • {formatFileSize(doc.file_size)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {doc.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {doc.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {doc.downloads} downloads
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(doc.created_at)}
                      </div>
                    </div>

                    {/* Tags */}
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{doc.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Tải về
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredDocuments.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {documents.length === 0 ? 'Chưa có tài liệu nào' : 'Không tìm thấy tài liệu'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {documents.length === 0 
                  ? 'Hãy liên hệ admin để thêm tài liệu mới.'
                  : 'Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentationCenter;
