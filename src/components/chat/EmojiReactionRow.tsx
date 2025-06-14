
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface EmojiReactionRowProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
}

const EmojiReactionRow = ({ reactions, onReact }: EmojiReactionRowProps) => {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          onClick={() => onReact(reaction.emoji)}
          className={cn(
            "h-7 px-2 rounded-full bg-slate-700/50 hover:bg-purple-500/20 border border-slate-600/50 hover:border-purple-500/40 transition-all duration-200",
            "text-xs text-slate-300 hover:text-white"
          )}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span className="text-xs">{reaction.count}</span>
        </Button>
      ))}
      
      {/* Add reaction button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReact('👍')}
        className="h-7 w-7 p-0 rounded-full bg-slate-700/30 hover:bg-purple-500/20 border border-slate-600/30 hover:border-purple-500/40 transition-all duration-200 text-slate-400 hover:text-purple-400"
      >
        +
      </Button>
    </div>
  );
};

export default EmojiReactionRow;
