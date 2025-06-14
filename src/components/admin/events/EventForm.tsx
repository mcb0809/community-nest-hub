
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Event } from '@/hooks/useEvents';

interface EventFormProps {
  event?: Event;
  onSubmit: (eventData: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    type: event?.type || 'workshop',
    format: event?.format || 'online',
    date: event?.date || '',
    time: event?.time || '',
    duration: event?.duration || 60,
    instructor: event?.instructor || '',
    location: event?.location || '',
    meeting_link: event?.meeting_link || '',
    max_attendees: event?.max_attendees || 50,
    status: event?.status || 'upcoming',
    recording: event?.recording || '',
    tags: event?.tags || []
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card className="bg-slate-800 border-red-500/20">
      <CardHeader>
        <CardTitle className="text-red-400">
          {event ? 'Edit Event' : 'Create New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-300">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="masterclass">Masterclass</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format" className="text-slate-300">Format</Label>
              <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-300">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-slate-300">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-slate-300">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-slate-300">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_attendees" className="text-slate-300">Max Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) => handleInputChange('max_attendees', parseInt(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
                min="1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor" className="text-slate-300">Instructor</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => handleInputChange('instructor', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {formData.format === 'offline' ? (
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="meeting_link" className="text-slate-300">Meeting Link</Label>
              <Input
                id="meeting_link"
                value={formData.meeting_link}
                onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          )}

          {formData.status === 'completed' && (
            <div className="space-y-2">
              <Label htmlFor="recording" className="text-slate-300">Recording URL</Label>
              <Input
                id="recording"
                value={formData.recording}
                onChange={(e) => handleInputChange('recording', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-300">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="bg-slate-700 border-slate-600 text-white flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm" className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="border-red-500/50 text-red-300">
                  {tag}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              {isLoading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventForm;
