import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Search,
  Filter,
  Star,
  CheckCircle
} from 'lucide-react';
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
  created_at: string;
  lesson_count?: number;
}

const CourseHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // First fetch all public courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Then fetch lesson counts for each course through modules
      const coursesWithLessonCount = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { data: modulesData, error: modulesError } = await supabase
            .from('modules')
            .select(`
              id,
              lessons(count)
            `)
            .eq('course_id', course.id);

          if (modulesError) {
            console.error('Error fetching modules for course:', course.id, modulesError);
            return { ...course, lesson_count: 0 };
          }

          // Calculate total lesson count across all modules
          const totalLessons = modulesData?.reduce((total, module: any) => {
            return total + (module.lessons?.[0]?.count || 0);
          }, 0) || 0;

          return {
            ...course,
            lesson_count: totalLessons
          };
        })
      );

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

  const categories = [
    { id: 'all', name: 'Tất cả khóa học', count: courses.length },
    ...Array.from(new Set(courses.map(course => course.category))).map(category => ({
      id: category,
      name: category,
      count: courses.filter(course => course.category === category).length
    }))
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getLevelBadgeVariant = (level: number) => {
    switch (level) {
      case 1: return 'secondary';
      case 2: return 'default';
      case 3: return 'destructive';
      default: return 'secondary';
    }
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Cơ bản';
      case 2: return 'Trung cấp';
      case 3: return 'Nâng cao';
      default: return 'Cơ bản';
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Trung tâm khóa học</h1>
          <p className="text-slate-600 dark:text-slate-400">Nâng cao kỹ năng với các khóa học chất lượng cao</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Tìm kiếm khóa học..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={selectedCategory === category.id ? 
              "bg-gradient-to-r from-blue-500 to-purple-600" : ""
            }
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {courses.length === 0 ? 'Chưa có khóa học nào' : 'Không tìm thấy khóa học'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {courses.length === 0 
              ? 'Hãy quay lại sau khi có khóa học mới được thêm vào'
              : 'Thử thay đổi từ khóa tìm kiếm hoặc danh mục'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow overflow-hidden group">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play className="w-12 h-12 text-white bg-black/30 rounded-full p-3 group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <Badge 
                  className="absolute top-2 left-2" 
                  variant={getLevelBadgeVariant(course.level)}
                >
                  {getLevelText(course.level)}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {course.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.total_hours}h
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {course.lesson_count} bài học
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-cyan-400">
                    {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
                  </span>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                    Bắt đầu học
                  </Button>
                </div>
                
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 w-fit">
                  {course.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseHub;
