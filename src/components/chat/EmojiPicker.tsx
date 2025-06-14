
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const emojiCategories = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩'],
  gestures: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  objects: ['💼', '📱', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '📷', '📸', '📹', '📼', '🔍', '🔎', '💡', '🔦', '🏮'],
  nature: ['🌱', '🌿', '🍀', '🍃', '🌾', '🌵', '🌲', '🌳', '🌴', '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌼', '🌙', '⭐', '🌟', '✨', '⚡', '🔥', '💧']
};

const EmojiPicker = ({ onEmojiSelect, onClose, isOpen }: EmojiPickerProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Emoji Picker */}
      <div className="absolute bottom-full right-0 mb-2 w-80 h-64 bg-slate-800 border border-purple-500/30 rounded-lg shadow-2xl z-50 overflow-hidden">
        <div className="p-3 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-white">Chọn emoji</h3>
        </div>
        
        <div className="h-48 overflow-y-auto p-2">
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <div key={category} className="mb-3">
              <div className="text-xs text-purple-300 mb-2 capitalize font-medium">
                {category}
              </div>
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 text-lg hover:bg-purple-500/20 hover:scale-110 transition-all duration-200",
                      "flex items-center justify-center"
                    )}
                    onClick={() => {
                      onEmojiSelect(emoji);
                      onClose();
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EmojiPicker;
