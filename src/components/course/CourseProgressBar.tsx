
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, BookOpen } from 'lucide-react';

interface CourseProgressBarProps {
  progress: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

const CourseProgressBar: React.FC<CourseProgressBarProps> = ({
  progress,
  completedLessons,
  totalLessons,
  isCompleted
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-semibold flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          Tiến độ học tập
        </h4>
        {isCompleted && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <Trophy className="w-3 h-3 mr-1" />
            Hoàn thành
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">
            {completedLessons}/{totalLessons} bài học
          </span>
          <span className="text-slate-300">
            {progress}%
          </span>
        </div>
        
        <Progress 
          value={progress} 
          className="w-full h-2 bg-slate-700"
        />
        
        {isCompleted && (
          <div className="text-center py-2">
            <p className="text-green-400 text-sm font-medium">
              🎉 Chúc mừng! Bạn đã hoàn thành khóa học này!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseProgressBar;
