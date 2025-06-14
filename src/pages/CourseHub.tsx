import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Play,
  User,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createSlug } from '@/utils/slugUtils';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  level: number;
  total_hours: number;
  price: number;
}

const CourseHub = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === parseInt(selectedLevel));
    }

    setFilteredCourses(filtered);
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Cơ bản';
      case 2: return 'Trung cấp';
      case 3: return 'Nâng cao';
      default: return 'Cơ bản';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 2: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 3: return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getUniqueCategories = () => {
    const categories = courses.map(course => course.category);
    return [...new Set(categories)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Trung tâm Khóa học
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Khám phá những khóa học chất lượng cao được thiết kế để nâng cao kỹ năng và kiến thức của bạn
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-slate-600">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{courses.length}</h3>
            <p className="text-slate-400">Khóa học</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-slate-600">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">1,000+</h3>
            <p className="text-slate-400">Học viên</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-slate-600">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">95%</h3>
            <p className="text-slate-400">Hài lòng</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass border-slate-600">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white hover:bg-slate-700">Tất cả danh mục</SelectItem>
                {getUniqueCategories().map((category) => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Cấp độ" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white hover:bg-slate-700">Tất cả cấp độ</SelectItem>
                <SelectItem value="1" className="text-white hover:bg-slate-700">Cơ bản</SelectItem>
                <SelectItem value="2" className="text-white hover:bg-slate-700">Trung cấp</SelectItem>
                <SelectItem value="3" className="text-white hover:bg-slate-700">Nâng cao</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="glass border-slate-600 hover:border-purple-500/50 transition-all duration-300 group">
              <CardHeader>
                {course.thumbnail_url ? (
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-16 h-16 text-white/50" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className={getLevelColor(course.level)}>
                      {getLevelText(course.level)}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                    {course.title}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm line-clamp-3">
                  {course.description || 'Chưa có mô tả'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.total_hours || 0}h
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Miễn phí
                  </span>
                </div>
                
                <Link to={`/course/${createSlug(course.title)}`}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 group">
                    <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Bắt đầu học
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass border-slate-600">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy khóa học</h3>
            <p className="text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseHub;
