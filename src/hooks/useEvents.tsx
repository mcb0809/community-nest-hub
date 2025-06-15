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

const sendEventWebhook = async (event: Event) => {
  try {
    console.log('Sending webhook for new event:', event.id);
    
    const webhookUrl = 'https://mcbaivn.tino.page/webhook/eventcreate';
    const credentials = btoa('MCBAIVN:Machbang8920!');
    
    // Create event link (assuming you have a frontend URL structure)
    const eventLink = `${window.location.origin}/events/${event.id}`;
    
    const payload = {
      event_id: event.id,
      event_name: (event.title || '').trim(),
      event_time: `${event.date} ${event.time}`.trim(),
      event_link: eventLink,
      event_type: (event.type || '').trim(),
      event_status: (event.status || '').trim(),
      event_format: (event.format || '').trim(),
      duration: event.duration,
      description: (event.description || '').trim(),
      max_attendees: event.max_attendees,
      instructor: (event.instructor || '').trim(),
      location: event.format === 'offline' ? (event.location || '').trim() : null,
      meeting_link: event.format === 'online' ? (event.meeting_link || '').trim() : null,
      tags: event.tags || [],
      created_at: event.created_at,
      timestamp: new Date().toISOString()
    };

    console.log('Event creation payload to send:', JSON.stringify(payload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Event creation response status:', response.status);

    if (response.ok) {
      console.log('✅ Event creation webhook sent successfully');
      const responseData = await response.text();
      console.log('Event creation response data:', responseData);
    } else {
      console.error('❌ Event creation webhook failed with status:', response.status);
      const errorText = await response.text();
      console.error('Event creation error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Error sending event creation webhook:', error);
    console.error('Event creation error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

const sendRegistrationWebhook = async (
  event: Event,
  userName: string,
  userId: string,
  userEmail: string | null
) => {
  try {
    console.log('=== STARTING REGISTRATION WEBHOOK ===');
    console.log('Event Title:', event.title);
    console.log('User Name:', userName);
    console.log('User Email:', userEmail);
    
    const webhookUrl = 'https://mcbaivn.tino.page/webhook/eventjoint';
    const credentials = btoa('MCBAIVN:Machbang8920!');
    
    console.log('Webhook URL:', webhookUrl);
    console.log('Credentials generated successfully');
    
    // Clean and encode data to prevent server issues
    const payload = {
      user_name: (userName || '').trim(),
      user_email: (userEmail || '').trim(),
      event_title: (event.title || '').trim(),
      event_time: `${event.date} ${event.time}`.trim(),
      registered_at: new Date().toISOString()
    };
    
    console.log('Payload to send:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Registration webhook sent successfully');
      const responseData = await response.text();
      console.log('Response data:', responseData);
    } else {
      console.error('❌ Webhook failed with status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error sending registration webhook:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

const sendEventUpdateWebhook = async (event: Event) => {
  try {
    console.log('Sending webhook for updated event:', event.id);

    const webhookUrl = 'https://mcbaivn.tino.page/webhook/updateevent';
    const credentials = btoa('MCBAIVN:Machbang8920!');

    // Create event link (assuming you have a frontend URL structure)
    const eventLink = `${window.location.origin}/events/${event.id}`;

    const payload = {
      event_id: event.id,
      event_name: (event.title || '').trim(),
      event_time: `${event.date} ${event.time}`.trim(),
      event_link: eventLink,
      event_type: (event.type || '').trim(),
      event_status: (event.status || '').trim(),
      event_format: (event.format || '').trim(),
      duration: event.duration,
      description: (event.description || '').trim(),
      max_attendees: event.max_attendees,
      instructor: (event.instructor || '').trim(),
      location: event.format === 'offline' ? (event.location || '').trim() : null,
      meeting_link: event.format === 'online' ? (event.meeting_link || '').trim() : null,
      tags: event.tags || [],
      updated_at: event.updated_at,
      timestamp: new Date().toISOString()
    };

    console.log('Event update payload to send:', JSON.stringify(payload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Event update response status:', response.status);

    if (response.ok) {
      console.log('✅ Event update webhook sent successfully');
      const responseData = await response.text();
      console.log('Event update response data:', responseData);
    } else {
      console.error('❌ Event update webhook failed with status:', response.status);
      const errorText = await response.text();
      console.error('Event update error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Error sending event update webhook:', error);
    console.error('Event update error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

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
      
      // Send webhook after successful creation with full event details
      await sendEventWebhook(transformedData);
      
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
      // Send the webhook after successful update
      await sendEventUpdateWebhook(transformedData);

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
      console.log('=== STARTING EVENT REGISTRATION ===');
      console.log('Event ID:', eventId);
      console.log('User Name:', userName);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Authenticated User ID:', user.id);
      console.log('Authenticated User Email:', user.email);

      // First, add registration with user_id
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_name: userName,
          user_id: user.id
        }]);

      if (registrationError) {
        console.error('Registration error:', registrationError);
        throw registrationError;
      }

      console.log('✅ Registration added to database successfully');

      // Then update the event's registered count and users list
      const event = events.find(e => e.id === eventId);
      if (event) {
        console.log('Event found for webhook:', event.title);
        const newRegisteredUsers = [...(event.registered_users || []), userName];
        await updateEvent(eventId, {
          registered: event.registered + 1,
          registered_users: newRegisteredUsers
        });

        console.log('✅ Event updated, now sending registration webhook...');
        
        // Send registration webhook after successful registration
        await sendRegistrationWebhook(event, userName, user.id, user.email ?? null);
      } else {
        console.error('❌ Event not found in local state for webhook');
      }

      toast({
        title: "Success",
        description: "Successfully registered for event",
      });
    } catch (error: any) {
      console.error('❌ Error registering for event:', error);
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
