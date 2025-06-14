import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Eye, EyeOff, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CourseForm from '@/components/admin/course/CourseForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  level: number;
  total_hours: number;
  price: number;
  is_public: boolean;
  lesson_count?: number;
}

const CourseAdmin = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Use any to bypass TypeScript errors until types are regenerated
      const { data, error } = await (supabase as any)
        .from('courses')
        .select(`
          *,
          lessons(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const coursesWithLessonCount = data?.map((course: any) => ({
        ...course,
        lesson_count: course.lessons?.[0]?.count || 0
      })) || [];

      setCourses(coursesWithLessonCount);
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

  const toggleCourseVisibility = async (courseId: string, isPublic: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('courses')
        .update({ is_public: !isPublic })
        .eq('id', courseId);

      if (error) throw error;

      setCourses(courses.map(course => 
        course.id === courseId 
          ? { ...course, is_public: !isPublic }
          : course
      ));

      toast({
        title: "Thành công",
        description: `Khóa học đã được ${!isPublic ? 'hiển thị' : 'ẩn'}`,
      });
    } catch (error) {
      console.error('Error toggling course visibility:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái khóa học",
        variant: "destructive",
      });
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(courses.map(course => course.category)))];

  const handleCourseCreated = () => {
    setIsCreateModalOpen(false);
    fetchCourses();
  };

  const handleCourseUpdated = () => {
    setEditingCourse(null);
    fetchCourses();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý khóa học</h1>
          <p className="text-slate-400">Tạo và quản lý các khóa học trong hệ thống</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              Tạo khóa học mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo khóa học mới</DialogTitle>
            </DialogHeader>
            <CourseForm onSuccess={handleCourseCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass border-slate-600 text-white placeholder-slate-400"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              {categoryFilter === 'all' ? 'Tất cả danh mục' : categoryFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-600">
            {categories.map(category => (
              <DropdownMenuItem
                key={category}
                onClick={() => setCategoryFilter(category)}
                className="text-white hover:bg-slate-700"
              >
                {category === 'all' ? 'Tất cả danh mục' : category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="glass border-slate-600 hover:border-purple-500/50 transition-all duration-200 group">
            <CardHeader className="pb-3">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple-900 to-slate-900 rounded-lg mb-3 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="w-12 h-12 text-purple-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={course.is_public ? "default" : "secondary"}
                    className={course.is_public ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                  >
                    {course.is_public ? 'Công khai' : 'Ẩn'}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-600">
                      <DropdownMenuItem
                        onClick={() => setEditingCourse(course)}
                        className="text-white hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleCourseVisibility(course.id, course.is_public)}
                        className="text-white hover:bg-slate-700"
                      >
                        {course.is_public ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Ẩn khóa học
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Hiển thị
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <CardTitle className="text-white text-lg line-clamp-2">{course.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Danh mục:</span>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    {course.category}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span>Cấp độ:</span>
                  <span className="text-white">Cấp độ {course.level}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tổng giờ học:</span>
                  <span className="text-white">{course.total_hours}h</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Số bài học:</span>
                  <span className="text-white">{course.lesson_count || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Giá:</span>
                  <span className="text-cyan-400 font-semibold">
                    {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy khóa học</h3>
          <p className="text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
            </DialogHeader>
            <CourseForm 
              course={editingCourse} 
              onSuccess={handleCourseUpdated} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CourseAdmin;
