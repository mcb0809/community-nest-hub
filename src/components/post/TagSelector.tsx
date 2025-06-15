
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const TagSelector = ({ selectedTags, onTagsChange, placeholder = "Chọn hoặc tạo tag..." }: TagSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(SUGGESTED_TAGS);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
      
      // Add to available tags if it's a new one
      if (!availableTags.includes(trimmedTag)) {
        setAvailableTags([...availableTags, trimmedTag]);
      }
    }
    setInputValue('');
    setOpen(false);
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

  const filteredTags = availableTags.filter(tag => 
    !selectedTags.includes(tag) && 
    tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Tìm kiếm hoặc tạo tag mới..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
            />
            <CommandEmpty>
              {inputValue.trim() && (
                <div
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted"
                  onClick={() => addTag(inputValue)}
                >
                  <Plus className="w-4 h-4" />
                  Tạo tag "{inputValue}"
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredTags.map((tag) => (
                <CommandItem
                  key={tag}
                  value={tag}
                  onSelect={() => addTag(tag)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-red-100 hover:text-red-700"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
