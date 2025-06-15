
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useXPActions } from './useXPActions';

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  category: string;
  level: number;
  total_hours?: number;
  price?: number;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  content_md?: string;
  video_url?: string;
  attachment_url?: string;
  module_id?: string;
  is_preview?: boolean;
  order_index?: number;
  created_at: string;
  updated_at: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { logCourseComplete } = useXPActions();

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
    } finally {
      setLoading(false);
    }
  };

  const completeCourse = async (courseId: string) => {
    if (!user?.id) return;

    try {
      // Log XP for completing course - this will now update the database
      const xpEarned = await logCourseComplete(user.id, courseId);
      console.log(`Course completed! XP earned: ${xpEarned}`);
      
      // Here you could also update a user_course_progress table
      // to track which courses the user has completed
      
    } catch (error) {
      console.error('Error completing course:', error);
    }
  };

  const completeLesson = async (lessonId: string, courseId: string) => {
    if (!user?.id) return;

    try {
      // Here you could implement lesson completion tracking
      // and potentially award XP for individual lessons
      console.log(`Lesson ${lessonId} completed in course ${courseId}`);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    completeCourse,
    completeLesson,
    refetch: fetchCourses
  };
};
