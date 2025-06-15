
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Download, FileText, Search, Filter, ExternalLink } from 'lucide-react';
import { Document } from '@/hooks/useDocuments';

interface DocumentListProps {
  documents: Document[];
  onEdit: (document: Document) => void;
  onDelete: (documentId: string) => void;
  loading?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onEdit, onDelete, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');

  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.category)))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesAccess = filterAccess === 'all' || doc.access_level === filterAccess;
    return matchesSearch && matchesCategory && matchesAccess;
  });

  const getAccessLevelColor = (level: string) => {
    return level === 'vip' 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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
      <Card className="bg-slate-800 border-blue-500/20">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">Đang tải tài liệu...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Danh Sách Tài Liệu ({documents.length})
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'Tất cả danh mục' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterAccess} onValueChange={setFilterAccess}>
            <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Quyền truy cập" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="free">FREE</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            {documents.length === 0 
              ? "Chưa có tài liệu nào. Hãy tạo tài liệu đầu tiên!"
              : "Không tìm thấy tài liệu phù hợp với bộ lọc."
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Tài Liệu</TableHead>
                  <TableHead className="text-slate-300">Loại</TableHead>
                  <TableHead className="text-slate-300">Danh Mục</TableHead>
                  <TableHead className="text-slate-300">Quyền</TableHead>
                  <TableHead className="text-slate-300">Kích Thước</TableHead>
                  <TableHead className="text-slate-300">Lượt Tải</TableHead>
                  <TableHead className="text-slate-300">Ngày Tạo</TableHead>
                  <TableHead className="text-slate-300">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{document.title}</div>
                        {document.description && (
                          <div className="text-sm text-slate-400 line-clamp-2">{document.description}</div>
                        )}
                        {document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {document.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {document.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{document.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase">
                        {document.file_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {document.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAccessLevelColor(document.access_level)}>
                        {document.access_level.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {formatFileSize(document.file_size)}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {document.downloads}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {formatDate(document.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.open(document.file_url, '_blank')}
                          size="sm"
                          variant="outline"
                          className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                          title="Xem tài liệu"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => onEdit(document)}
                          size="sm"
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => onDelete(document.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                          title="Xóa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList;
