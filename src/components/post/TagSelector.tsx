
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

const SUGGESTED_TAGS = [
  'Công nghệ', 'Lập trình', 'AI', 'Machine Learning', 'Web Development',
  'Mobile App', 'UI/UX', 'Database', 'DevOps', 'Security',
  'Thảo luận', 'Hỏi đáp', 'Chia sẻ kinh nghiệm', 'Tutorial',
  'News', 'Review', 'Tips & Tricks', 'Best Practices'
];

const TagSelector = ({ selectedTags, onTagsChange, placeholder = "Thêm tag..." }: TagSelectorProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const filteredTags = SUGGESTED_TAGS.filter(tag => 
    !selectedTags.includes(tag) && 
    tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
        />
        
        {showSuggestions && inputValue && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {inputValue.trim() && (
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
                onClick={() => addTag(inputValue)}
              >
                <Plus className="w-4 h-4" />
                Tạo tag "{inputValue}"
              </div>
            )}
            {filteredTags.map((tag) => (
              <div
                key={tag}
                className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                onClick={() => addTag(tag)}
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
