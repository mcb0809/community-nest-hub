
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  X,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useFileUpload } from '@/hooks/useFileUpload';

interface VoiceRecorderProps {
  onSendVoiceMessage: (attachment: any) => void;
  onClose: () => void;
}

const VoiceRecorder = ({ onSendVoiceMessage, onClose }: VoiceRecorderProps) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording
  } = useVoiceRecorder();

  const { uploadVoiceMessage, uploading } = useFileUpload();

  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopAndSend = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const attachment = await uploadVoiceMessage(audioBlob);
      if (attachment) {
        onSendVoiceMessage(attachment);
        onClose();
      }
    }
  };

  const handleCancel = () => {
    cancelRecording();
    onClose();
  };

  if (!isRecording && recordingTime === '0:00') {
    return (
      <div className="flex items-center space-x-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <Button
          onClick={handleStartRecording}
          className="h-10 w-10 p-0 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
        >
          <Mic className="w-5 h-5" />
        </Button>
        <span className="text-sm text-purple-300">Click to start recording</span>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg">
      <div className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center",
        isRecording && !isPaused ? "bg-red-500 animate-pulse" : "bg-slate-600"
      )}>
        <Mic className="w-5 h-5 text-white" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-white">{recordingTime}</span>
          {isRecording && (
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-purple-400 animate-pulse rounded-full"></div>
              <div className="w-1 h-4 bg-cyan-400 animate-pulse rounded-full" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-4 bg-purple-400 animate-pulse rounded-full" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Ready to send'}
        </span>
      </div>

      <div className="flex space-x-2">
        {isRecording && (
          <Button
            onClick={isPaused ? resumeRecording : pauseRecording}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        )}
        
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
        >
          <X className="w-4 h-4" />
        </Button>

        {isRecording ? (
          <Button
            onClick={handleStopAndSend}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-green-400"
            disabled={uploading}
          >
            <Square className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleStopAndSend}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-green-400"
            disabled={uploading}
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
