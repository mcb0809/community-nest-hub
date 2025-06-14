
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
  User
} from 'lucide-react';

const DocumentationCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const folders = [
    { id: 'all', name: 'All Documents', count: 24, icon: FileText },
    { id: 'ebooks', name: 'E-books', count: 8, icon: FileText },
    { id: 'templates', name: 'Templates', count: 6, icon: File },
    { id: 'slides', name: 'Presentations', count: 4, icon: FileText },
    { id: 'technical', name: 'Technical Docs', count: 6, icon: FileText },
  ];

  const documents = [
    {
      id: 1,
      title: 'React Best Practices Guide',
      description: 'Comprehensive guide covering React best practices, patterns, and performance optimization techniques.',
      type: 'PDF',
      category: 'technical',
      size: '2.4 MB',
      downloads: 1256,
      rating: 4.8,
      author: 'John Smith',
      lastUpdated: '2024-06-10',
      tags: ['React', 'Best Practices', 'Performance'],
      accessLevel: 'free',
      thumbnail: '/api/placeholder/200/250',
    },
    {
      id: 2,
      title: 'Full-Stack Development Roadmap',
      description: 'Complete roadmap for becoming a full-stack developer with recommended resources and learning path.',
      type: 'PDF',
      category: 'ebooks',
      size: '1.8 MB',
      downloads: 892,
      rating: 4.9,
      author: 'Sarah Johnson',
      lastUpdated: '2024-06-05',
      tags: ['Roadmap', 'Full-Stack', 'Learning'],
      accessLevel: 'vip',
      thumbnail: '/api/placeholder/200/250',
    },
    {
      id: 3,
      title: 'Modern Web Design Templates',
      description: 'Collection of modern, responsive web design templates built with Tailwind CSS.',
      type: 'ZIP',
      category: 'templates',
      size: '12.5 MB',
      downloads: 543,
      rating: 4.7,
      author: 'Emily Chen',
      lastUpdated: '2024-06-08',
      tags: ['Templates', 'Tailwind CSS', 'Design'],
      accessLevel: 'free',
      thumbnail: '/api/placeholder/200/250',
    },
    {
      id: 4,
      title: 'API Documentation Standards',
      description: 'Guidelines and standards for creating comprehensive API documentation.',
      type: 'Markdown',
      category: 'technical',
      size: '0.8 MB',
      downloads: 321,
      rating: 4.6,
      author: 'Mike Davis',
      lastUpdated: '2024-06-12',
      tags: ['API', 'Documentation', 'Standards'],
      accessLevel: 'free',
      thumbnail: '/api/placeholder/200/250',
    },
    {
      id: 5,
      title: 'Database Design Presentation',
      description: 'Comprehensive presentation covering database design principles and normalization.',
      type: 'PPTX',
      category: 'slides',
      size: '4.2 MB',
      downloads: 234,
      rating: 4.5,
      author: 'Dr. Maria Garcia',
      lastUpdated: '2024-06-01',
      tags: ['Database', 'Design', 'Presentation'],
      accessLevel: 'vip',
      thumbnail: '/api/placeholder/200/250',
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    // In a real app, you'd have different icons for different file types
    return FileText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Documentation Center</h1>
          <p className="text-slate-600 dark:text-slate-400">Access our comprehensive library of resources</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search documents..." 
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
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Categories</h3>
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
              const FileIcon = getFileTypeIcon(doc.type);
              
              return (
                <Card key={doc.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getAccessLevelColor(doc.accessLevel)}>
                        {doc.accessLevel.toUpperCase()}
                      </Badge>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm ml-1">{doc.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {doc.type} • {doc.size}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                      {doc.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {doc.downloads} downloads
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(doc.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Author */}
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <User className="w-4 h-4 mr-2" />
                      {doc.author}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                        disabled={doc.accessLevel === 'vip'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {doc.accessLevel === 'vip' ? 'VIP Only' : 'Download'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No documents found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentationCenter;
