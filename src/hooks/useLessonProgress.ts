
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useXPActions } from './useXPActions';
import { useToast } from './use-toast';

interface LessonProgress {
  id: string;
  lesson_id: string;
  is_completed: boolean;
  watch_time_seconds: number;
  completed_at: string | null;
}

interface CourseProgress {
  id: string;
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  completed_at: string | null;
}

export const useLessonProgress = (courseId?: string) => {
  const { user } = useAuth();
  const { logCourseComplete } = useXPActions();
  const { toast } = useToast();
  const [lessonProgress, setLessonProgress] = useState<Map<string, LessonProgress>>(new Map());
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch lesson progress for current course
  const fetchLessonProgress = async () => {
    if (!user?.id || !courseId) return;

    try {
      // Get all lesson IDs for this course
      const { data: courseData } = await supabase
        .from('modules')
        .select(`
          lessons(id)
        `)
        .eq('course_id', courseId);

      const lessonIds = courseData?.flatMap(module => 
        module.lessons?.map((lesson: any) => lesson.id) || []
      ) || [];

      if (lessonIds.length === 0) return;

      // Fetch progress for these lessons
      const { data: progressData, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (error) throw error;

      // Convert to Map for easy lookup
      const progressMap = new Map();
      progressData?.forEach(progress => {
        progressMap.set(progress.lesson_id, progress);
      });
      
      setLessonProgress(progressMap);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  // Fetch course progress
  const fetchCourseProgress = async () => {
    if (!user?.id || !courseId) return;

    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCourseProgress(data);
    } catch (error) {
      console.error('Error fetching course progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark lesson as completed
  const markLessonCompleted = async (lessonId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
          watch_time_seconds: 0 // You can implement watch time tracking if needed
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setLessonProgress(prev => new Map(prev.set(lessonId, data)));

      // Log XP for lesson completion
      await supabase.rpc('log_xp_action', {
        p_user_id: user.id,
        p_action_type: 'lesson_complete',
        p_description: `Completed lesson: ${lessonId}`
      });

      // Refresh course progress to check if course is completed
      setTimeout(() => {
        fetchCourseProgress();
      }, 1000);

      toast({
        title: "Chúc mừng!",
        description: "Bạn đã hoàn thành bài học này",
      });

    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tiến độ bài học",
        variant: "destructive",
      });
    }
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.get(lessonId)?.is_completed || false;
  };

  // Get course completion percentage
  const getCourseCompletionPercentage = () => {
    return courseProgress?.progress_percentage || 0;
  };

  // Check if course is completed
  const isCourseCompleted = () => {
    return courseProgress?.completed_at !== null;
  };

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      Promise.all([fetchLessonProgress(), fetchCourseProgress()]);
    }
  }, [courseId, user?.id]);

  // Check for course completion and award XP
  useEffect(() => {
    if (courseProgress?.completed_at && !loading) {
      // Course was just completed, award XP
      logCourseComplete(user?.id!, courseId!);
      toast({
        title: "🎉 Hoàn thành khóa học!",
        description: "Chúc mừng bạn đã hoàn thành khóa học này!",
      });
    }
  }, [courseProgress?.completed_at]);

  return {
    lessonProgress,
    courseProgress,
    loading,
    markLessonCompleted,
    isLessonCompleted,
    getCourseCompletionPercentage,
    isCourseCompleted,
    fetchLessonProgress,
    fetchCourseProgress
  };
};
