
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  FileText, 
  Download, 
  Play, 
  Pause,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileAttachmentProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  className?: string;
}

const FileAttachment = ({ fileName, fileType, fileSize, fileUrl, className }: FileAttachmentProps) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = fileType.startsWith('image/');
  const isAudio = fileType.startsWith('audio/');
  const isJson = fileType === 'application/json';

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  if (isImage) {
    return (
      <div className={cn("relative max-w-sm rounded-lg overflow-hidden", className)}>
        <img 
          src={fileUrl} 
          alt={fileName}
          className="w-full h-auto max-h-64 object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <Download className="w-4 h-4 text-white" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-white text-xs truncate">{fileName}</p>
          <p className="text-white/70 text-xs">{formatFileSize(fileSize)}</p>
        </div>
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className={cn("flex items-center space-x-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg max-w-sm", className)}>
        <Button
          size="sm"
          variant="ghost"
          className="h-10 w-10 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
          onClick={toggleAudio}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white truncate">{fileName}</span>
          </div>
          <p className="text-xs text-purple-300">{formatFileSize(fileSize)}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <Download className="w-4 h-4" />
        </Button>
        <audio
          ref={audioRef}
          src={fileUrl}
          onEnded={handleAudioEnd}
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-3 p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg max-w-sm", className)}>
      <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
        {isJson ? (
          <FileText className="w-5 h-5 text-white" />
        ) : (
          <Image className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{fileName}</p>
        <p className="text-xs text-slate-400">{formatFileSize(fileSize)}</p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400"
        onClick={() => window.open(fileUrl, '_blank')}
      >
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default FileAttachment;
