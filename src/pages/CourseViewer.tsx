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
  User,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createSlug, extractIdFromSlug } from '@/utils/slugUtils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import AuthRequiredModal from '@/components/auth/AuthRequiredModal';
import CommentsSection from '@/components/course/CommentsSection';
import LessonCompletionButton from '@/components/course/LessonCompletionButton';
import CourseProgressBar from '@/components/course/CourseProgressBar';

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
  const { courseId, slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAuthenticated, showAuthModal, requireAuth, closeAuthModal } = useAuthGuard();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Use lesson progress hook
  const {
    courseProgress,
    markLessonCompleted,
    isLessonCompleted,
    getCourseCompletionPercentage,
    isCourseCompleted
  } = useLessonProgress(course?.id);

  useEffect(() => {
    const identifier = courseId || extractIdFromSlug(slug || '') || slug;
    if (identifier) {
      fetchCourseData(identifier);
    }
  }, [courseId, slug]);

  const fetchCourseData = async (identifier: string) => {
    try {
      let courseData;
      
      // Try to fetch by ID first
      const { data: courseById, error: courseByIdError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', identifier)
        .eq('is_public', true)
        .single();

      if (courseById && !courseByIdError) {
        courseData = courseById;
      } else {
        // If not found by ID, try to search by title slug
        const { data: coursesByTitle, error: coursesByTitleError } = await supabase
          .from('courses')
          .select('*')
          .eq('is_public', true);

        if (coursesByTitleError) throw coursesByTitleError;

        // Find course by matching slug
        courseData = coursesByTitle?.find(course => 
          createSlug(course.title) === identifier
        );

        if (!courseData) {
          throw new Error('Course not found');
        }
      }

      setCourse(courseData);

      // Update URL to use slug if we're currently using ID
      if (courseId && courseData.title) {
        const courseSlug = createSlug(courseData.title);
        navigate(`/course/${courseSlug}`, { replace: true });
      }

      // Fetch modules with lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          lessons(*)
        `)
        .eq('course_id', courseData.id)
        .order('order_index');

      if (modulesError) throw modulesError;

      const modulesWithLessons = modulesData?.map((module: any) => ({
        ...module,
        lessons: module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || []
      })) || [];

      setModules(modulesWithLessons);
      
      // Set first preview lesson or first lesson if authenticated
      if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
        const firstModule = modulesWithLessons[0];
        const previewLesson = firstModule.lessons.find(lesson => lesson.is_preview);
        setCurrentLesson(previewLesson || (isAuthenticated ? firstModule.lessons[0] : null));
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

  const handleLessonSelect = (lesson: Lesson) => {
    if (!lesson.is_preview && !isAuthenticated) {
      requireAuth();
      return;
    }
    setCurrentLesson(lesson);
  };

  const handleMarkLessonCompleted = async (lessonId: string) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    await markLessonCompleted(lessonId);
  };

  const extractYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
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

  const embedUrl = currentLesson?.video_url ? getYouTubeEmbedUrl(currentLesson.video_url) : null;

  return (
    <div className="space-y-6">
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        title="Yêu cầu đăng nhập để xem khóa học"
        description="Bạn cần đăng nhập để truy cập toàn bộ nội dung khóa học. Chỉ có thể xem preview miễn phí."
      />

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
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={currentLesson.title}
                        className="w-full h-full rounded-t-lg"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <div className="text-center">
                        <Play className="w-16 h-16 text-white/50 mx-auto mb-4" />
                        <p className="text-white/70">Video chưa có sẵn hoặc URL không hợp lệ</p>
                        {currentLesson.video_url && (
                          <p className="text-white/50 text-sm mt-2">URL: {currentLesson.video_url}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-white">{currentLesson.title}</h2>
                      <div className="flex items-center space-x-2">
                        {currentLesson.is_preview && (
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            Preview
                          </Badge>
                        )}
                        {isLessonCompleted(currentLesson.id) && (
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Hoàn thành
                          </Badge>
                        )}
                      </div>
                    </div>
                    
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

                    {/* Auth Warning for non-preview content */}
                    {!currentLesson.is_preview && !isAuthenticated && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">Nội dung này yêu cầu đăng nhập</span>
                        </div>
                        <p className="text-slate-300 text-sm mt-1">
                          Bạn cần đăng nhập để xem toàn bộ nội dung khóa học.
                        </p>
                      </div>
                    )}

                    {/* Lesson Content */}
                    {currentLesson.content_md && (currentLesson.is_preview || isAuthenticated) && (
                      <div className="prose prose-invert max-w-none mb-4">
                        <div className="bg-slate-800/50 p-4 rounded border border-slate-600">
                          <h3 className="text-white mb-3">Nội dung bài học:</h3>
                          <div className="text-slate-300 whitespace-pre-wrap">
                            {currentLesson.content_md}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lesson Completion Button */}
                    {isAuthenticated && (currentLesson.is_preview || isAuthenticated) && (
                      <div className="flex items-center justify-between mb-4">
                        <LessonCompletionButton
                          lessonId={currentLesson.id}
                          isCompleted={isLessonCompleted(currentLesson.id)}
                          onMarkCompleted={handleMarkLessonCompleted}
                        />
                      </div>
                    )}

                    {/* Attachment */}
                    {currentLesson.attachment_url && (currentLesson.is_preview || isAuthenticated) && (
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
                  {!isAuthenticated ? (
                    <div>
                      <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Yêu cầu đăng nhập</h3>
                      <p className="text-slate-400 mb-4">Đăng nhập để truy cập toàn bộ nội dung khóa học</p>
                      <Button 
                        onClick={() => requireAuth()}
                        className="bg-gradient-to-r from-purple-500 to-cyan-500"
                      >
                        Đăng nhập ngay
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Chọn bài học để bắt đầu</h3>
                      <p className="text-slate-400">Chọn một bài học từ danh sách bên cạnh</p>
                    </div>
                  )}
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
              
              {/* Course Progress */}
              {isAuthenticated && courseProgress && (
                <CourseProgressBar
                  progress={getCourseCompletionPercentage()}
                  completedLessons={courseProgress.completed_lessons}
                  totalLessons={courseProgress.total_lessons}
                  isCompleted={isCourseCompleted()}
                />
              )}
              
              {!isAuthenticated && (
                <Progress value={0} className="w-full" />
              )}
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
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isAccessible = lesson.is_preview || isAuthenticated;
                        const lessonCompleted = isLessonCompleted(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson)}
                            disabled={!isAccessible}
                            className={`w-full p-3 text-left transition-colors ${
                              currentLesson?.id === lesson.id
                                ? 'bg-purple-500/20 border-l-2 border-purple-500'
                                : isAccessible 
                                  ? 'hover:bg-slate-700/50'
                                  : 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {!isAccessible ? (
                                  <Lock className="w-4 h-4 text-slate-500" />
                                ) : lessonCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : currentLesson?.id === lesson.id ? (
                                  <Play className="w-4 h-4 text-purple-400" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-500 text-xs flex items-center justify-center text-slate-400">
                                    {lessonIndex + 1}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  isAccessible ? 'text-white' : 'text-slate-500'
                                }`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  {lesson.is_preview && (
                                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                                      Preview
                                    </Badge>
                                  )}
                                  {lessonCompleted && (
                                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                                      Hoàn thành
                                    </Badge>
                                  )}
                                  {!isAccessible && (
                                    <Badge variant="outline" className="border-slate-500/30 text-slate-500 text-xs">
                                      Cần đăng nhập
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comments Section - Only show if authenticated */}
      {isAuthenticated && <CommentsSection courseId={course.id} />}
    </div>
  );
};

export default CourseViewer;
