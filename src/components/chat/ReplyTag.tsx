
import React from 'react';
import { Reply } from 'lucide-react';

interface ReplyTagProps {
  replyTo: {
    user: string;
    message: string;
  };
}

const ReplyTag = ({ replyTo }: ReplyTagProps) => {
  return (
    <div className="flex items-start space-x-2 mb-2 pl-3 border-l-2 border-purple-500/40 bg-purple-500/10 rounded-r-lg p-2">
      <Reply className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-purple-300 font-semibold mb-1">
          Replying to {replyTo.user}
        </div>
        <div className="text-xs text-slate-400 truncate">
          {replyTo.message}
        </div>
      </div>
    </div>
  );
};

export default ReplyTag;
