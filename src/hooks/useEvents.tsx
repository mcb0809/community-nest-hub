import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  type: string;
  format: string;
  date: string;
  time: string;
  duration: number;
  instructor: string | null;
  location: string | null;
  meeting_link: string | null;
  max_attendees: number;
  registered: number;
  registered_users: string[] | null;
  tags: string[] | null;
  status: string;
  recording: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      
      // Transform the data to ensure registered_users is properly typed
      const transformedData: Event[] = (data || []).map(event => ({
        ...event,
        registered_users: Array.isArray(event.registered_users) ? 
          event.registered_users.filter((user): user is string => typeof user === 'string') : [],
        tags: Array.isArray(event.tags) ? 
          event.tags.filter((tag): tag is string => typeof tag === 'string') : []
      }));
      
      setEvents(transformedData);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'registered'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          registered: 0
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData: Event = {
        ...data,
        registered_users: Array.isArray(data.registered_users) ? 
          data.registered_users.filter((user): user is string => typeof user === 'string') : [],
        tags: Array.isArray(data.tags) ? 
          data.tags.filter((tag): tag is string => typeof tag === 'string') : []
      };

      setEvents(prev => [...prev, transformedData]);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      return transformedData;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          ...eventData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedData: Event = {
        ...data,
        registered_users: Array.isArray(data.registered_users) ? 
          data.registered_users.filter((user): user is string => typeof user === 'string') : [],
        tags: Array.isArray(data.tags) ? 
          data.tags.filter((tag): tag is string => typeof tag === 'string') : []
      };

      setEvents(prev => prev.map(event => event.id === id ? transformedData : event));
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      return transformedData;
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const registerForEvent = async (eventId: string, userName: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, add registration with user_id
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_name: userName,
          user_id: user.id
        }]);

      if (registrationError) throw registrationError;

      // Then update the event's registered count and users list
      const event = events.find(e => e.id === eventId);
      if (event) {
        const newRegisteredUsers = [...(event.registered_users || []), userName];
        await updateEvent(eventId, {
          registered: event.registered + 1,
          registered_users: newRegisteredUsers
        });
      }

      toast({
        title: "Success",
        description: "Successfully registered for event",
      });
    } catch (error: any) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    refetch: fetchEvents
  };
};
