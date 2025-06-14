
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useEvents, Event } from '@/hooks/useEvents';
import EventForm from '@/components/admin/events/EventForm';
import EventsTable from '@/components/admin/events/EventsTable';

const AdminEvents = () => {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useEvents();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateEvent = async (eventData: any) => {
    try {
      setIsSubmitting(true);
      await createEvent(eventData);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!editingEvent) return;
    
    try {
      setIsSubmitting(true);
      await updateEvent(editingEvent.id, eventData);
      setEditingEvent(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Events Management</h1>
          <p className="text-slate-400">Manage community events and workshops</p>
        </div>
        
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {showForm ? (
        <EventForm
          event={editingEvent}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      ) : (
        <EventsTable
          events={events}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AdminEvents;
