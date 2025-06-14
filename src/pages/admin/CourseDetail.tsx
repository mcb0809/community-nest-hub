import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, GripVertical, Play, FileText, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ModuleForm from '@/components/admin/course/ModuleForm';
import LessonForm from '@/components/admin/course/LessonForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: number;
  is_public: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons?: Lesson[];
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

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
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
      if (modulesWithLessons.length > 0 && !selectedModule) {
        setSelectedModule(modulesWithLessons[0]);
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

  const handleModuleCreated = () => {
    setIsModuleFormOpen(false);
    setEditingModule(null);
    fetchCourseData();
  };

  const handleLessonCreated = () => {
    setIsLessonFormOpen(false);
    setEditingLesson(null);
    fetchCourseData();
  };

  const deleteModule = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Module đã được xóa",
      });
      fetchCourseData();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa module",
        variant: "destructive",
      });
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Bài học đã được xóa",
      });
      fetchCourseData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài học",
        variant: "destructive",
      });
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

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy khóa học</h2>
        <p className="text-slate-400">Khóa học này không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg p-6 glass border border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/course')}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                  Cấp độ {course.level}
                </Badge>
                <Badge 
                  variant={course.is_public ? "default" : "secondary"}
                  className={course.is_public ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                >
                  {course.is_public ? 'Công khai' : 'Ẩn'}
                </Badge>
              </div>
              {course.description && (
                <p className="text-slate-300 mt-2">{course.description}</p>
              )}
            </div>
          </div>
          
          <Dialog open={isModuleFormOpen} onOpenChange={setIsModuleFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Module
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo Module mới</DialogTitle>
              </DialogHeader>
              <ModuleForm courseId={courseId!} onSuccess={handleModuleCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Modules & Lessons */}
        <div className="lg:col-span-1">
          <Card className="glass border-slate-600 h-fit">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Cấu trúc khóa học
                <Badge variant="outline" className="border-slate-500 text-slate-400">
                  {modules.length} modules
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-2">
                  {modules.map((module, index) => (
                    <div key={module.id} className="space-y-1">
                      <div
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedModule?.id === module.id
                            ? 'bg-purple-500/20 border border-purple-500/50'
                            : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600'
                        }`}
                        onClick={() => setSelectedModule(module)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="w-4 h-4 text-slate-400" />
                            <span className="text-white font-medium">
                              Module {index + 1}: {module.title}
                            </span>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white p-1">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-600">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingModule(module);
                                  setIsModuleFormOpen(true);
                                }}
                                className="text-white hover:bg-slate-700"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteModule(module.id)}
                                className="text-red-400 hover:bg-slate-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="text-sm text-slate-400 mt-1">
                          {module.lessons?.length || 0} bài học
                        </div>
                      </div>

                      {/* Lessons */}
                      {selectedModule?.id === module.id && module.lessons && (
                        <div className="ml-6 space-y-1">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="p-2 rounded-md bg-slate-700/30 border border-slate-600 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <Play className="w-3 h-3 text-cyan-400" />
                                <span className="text-sm text-slate-300">
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                                {lesson.is_preview && (
                                  <Eye className="w-3 h-3 text-green-400" />
                                )}
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white p-1">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-slate-800 border-slate-600">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingLesson(lesson);
                                      setIsLessonFormOpen(true);
                                    }}
                                    className="text-white hover:bg-slate-700"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteLesson(lesson.id)}
                                    className="text-red-400 hover:bg-slate-700"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Xóa
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedModule ? (
            <Card className="glass border-slate-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{selectedModule.title}</CardTitle>
                    {selectedModule.description && (
                      <p className="text-slate-400 mt-2">{selectedModule.description}</p>
                    )}
                  </div>
                  
                  <Dialog open={isLessonFormOpen} onOpenChange={setIsLessonFormOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm bài học
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Thêm bài học mới</DialogTitle>
                      </DialogHeader>
                      <LessonForm moduleId={selectedModule.id} onSuccess={handleLessonCreated} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {selectedModule.lessons && selectedModule.lessons.length > 0 ? (
                  <div className="space-y-4">
                    {selectedModule.lessons.map((lesson, index) => (
                      <Card key={lesson.id} className="glass border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Play className="w-4 h-4 text-cyan-400" />
                                <h4 className="text-lg font-semibold text-white">
                                  Bài {index + 1}: {lesson.title}
                                </h4>
                                {lesson.is_preview && (
                                  <Badge variant="outline" className="border-green-500/30 text-green-400">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              
                              {lesson.video_url && (
                                <div className="text-sm text-slate-400 mb-2">
                                  <span className="font-medium">Video:</span> {lesson.video_url}
                                </div>
                              )}
                              
                              {lesson.content_md && (
                                <div className="text-sm text-slate-300 mb-2">
                                  <span className="font-medium text-slate-400">Nội dung:</span>
                                  <div className="mt-1 p-3 bg-slate-800/50 rounded border border-slate-600">
                                    {lesson.content_md.substring(0, 200)}
                                    {lesson.content_md.length > 200 && '...'}
                                  </div>
                                </div>
                              )}
                              
                              {lesson.attachment_url && (
                                <div className="flex items-center space-x-2 text-sm text-slate-400">
                                  <FileText className="w-4 h-4" />
                                  <span>Có tài liệu đính kèm</span>
                                </div>
                              )}
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-slate-800 border-slate-600">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingLesson(lesson);
                                    setIsLessonFormOpen(true);
                                  }}
                                  className="text-white hover:bg-slate-700"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteLesson(lesson.id)}
                                  className="text-red-400 hover:bg-slate-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Chưa có bài học</h3>
                    <p className="text-slate-400 mb-4">Thêm bài học đầu tiên cho module này</p>
                    <Button
                      onClick={() => setIsLessonFormOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm bài học
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass border-slate-600">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Chọn module để bắt đầu</h3>
                <p className="text-slate-400">Chọn một module từ sidebar để xem và chỉnh sửa nội dung</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Module Modal */}
      {editingModule && (
        <Dialog open={isModuleFormOpen} onOpenChange={setIsModuleFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Module</DialogTitle>
            </DialogHeader>
            <ModuleForm
              courseId={courseId!}
              module={editingModule}
              onSuccess={handleModuleCreated}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <Dialog open={isLessonFormOpen} onOpenChange={setIsLessonFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa bài học</DialogTitle>
            </DialogHeader>
            <LessonForm
              moduleId={selectedModule?.id!}
              lesson={editingLesson}
              onSuccess={handleLessonCreated}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CourseDetail;
