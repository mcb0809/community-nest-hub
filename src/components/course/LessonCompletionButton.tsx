
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';

interface LessonCompletionButtonProps {
  lessonId: string;
  isCompleted: boolean;
  onMarkCompleted: (lessonId: string) => void;
  disabled?: boolean;
}

const LessonCompletionButton: React.FC<LessonCompletionButtonProps> = ({
  lessonId,
  isCompleted,
  onMarkCompleted,
  disabled = false
}) => {
  if (isCompleted) {
    return (
      <Button
        variant="outline"
        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
        disabled
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Đã hoàn thành
      </Button>
    );
  }

  return (
    <Button
      onClick={() => onMarkCompleted(lessonId)}
      disabled={disabled}
      className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
    >
      <Circle className="w-4 h-4 mr-2" />
      Đánh dấu hoàn thành
    </Button>
  );
};

export default LessonCompletionButton;
