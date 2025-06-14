
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Clock,
  BookOpen,
  User
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
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  video_url: string;
  content_md: string;
  attachment_url: string;
  is_preview: boolean;
  order_index: number;
}

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course info
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('is_public', true)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch modules with lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          lessons(*)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesError) throw modulesError;

      const modulesWithLessons = modulesData?.map((module: any) => ({
        ...module,
        lessons: module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || []
      })) || [];

      setModules(modulesWithLessons);
      
      // Set first lesson as current lesson
      if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
        setCurrentLesson(modulesWithLessons[0].lessons[0]);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);

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

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy khóa học</h2>
        <p className="text-slate-400">Khóa học này không tồn tại hoặc không công khai.</p>
        <Button
          onClick={() => navigate('/courses')}
          className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600"
        >
          Quay lại danh sách khóa học
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      {/* Main Video/Content Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/courses')}
          className="border-slate-600 text-white hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại khóa học
        </Button>

        {/* Video/Content Display */}
        <Card className="glass border-slate-600">
          <CardContent className="p-0">
            {currentLesson ? (
              <div>
                {/* Video Area */}
                <div className="w-full h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center rounded-t-lg">
                  {currentLesson.video_url ? (
                    <iframe
                      src={currentLesson.video_url}
                      className="w-full h-full rounded-t-lg"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center">
                      <Play className="w-16 h-16 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70">Video chưa có sẵn</p>
                    </div>
                  )}
                </div>

                {/* Lesson Info */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h2>
                  
                  {/* Course Info */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-slate-400">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {course.title}
                    </span>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                      {getLevelText(course.level)}
                    </Badge>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                      {course.category}
                    </Badge>
                  </div>

                  {/* Lesson Content */}
                  {currentLesson.content_md && (
                    <div className="prose prose-invert max-w-none">
                      <div className="bg-slate-800/50 p-4 rounded border border-slate-600">
                        <h3 className="text-white mb-3">Nội dung bài học:</h3>
                        <div className="text-slate-300 whitespace-pre-wrap">
                          {currentLesson.content_md}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attachment */}
                  {currentLesson.attachment_url && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => window.open(currentLesson.attachment_url, '_blank')}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Tải tài liệu
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Chọn bài học để bắt đầu</h3>
                <p className="text-slate-400">Chọn một bài học từ danh sách bên cạnh</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Course Structure */}
      <div className="lg:col-span-1">
        <Card className="glass border-slate-600 h-full">
          <CardHeader>
            <CardTitle className="text-white text-lg">{course.title}</CardTitle>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {course.total_hours}h
              </span>
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {totalLessons} bài học
              </span>
            </div>
            <Progress value={0} className="w-full" />
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {modules.map((module, moduleIndex) => (
                <div key={module.id} className="border-b border-slate-600 last:border-b-0">
                  <div className="p-4 bg-slate-800/30">
                    <h4 className="font-semibold text-white text-sm">
                      Module {moduleIndex + 1}: {module.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {module.lessons.length} bài học
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full p-3 text-left transition-colors ${
                          currentLesson?.id === lesson.id
                            ? 'bg-purple-500/20 border-l-2 border-purple-500'
                            : 'hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {currentLesson?.id === lesson.id ? (
                              <Play className="w-4 h-4 text-purple-400" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-500 text-xs flex items-center justify-center text-slate-400">
                                {lessonIndex + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">
                              {lesson.title}
                            </p>
                            {lesson.is_preview && (
                              <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs mt-1">
                                Preview
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseViewer;
