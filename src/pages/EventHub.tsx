import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Video, Filter } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';

const EventHub = () => {
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
  const { events, loading, registerForEvent } = useEvents();
  const { userProfile } = useAuth();

  // Filter events based on status and view
  const upcomingEvents = events.filter(event => 
    event.status === 'upcoming' && new Date(event.date) >= new Date()
  );
  
  const pastEvents = events.filter(event => 
    event.status === 'completed' || new Date(event.date) < new Date()
  );

  const displayEvents = view === 'upcoming' ? upcomingEvents : pastEvents;

  const getEventTypeColor = (type: string) => {
    const colors = {
      workshop: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      meetup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      masterclass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      webinar: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRegister = async (eventId: string) => {
    if (!userProfile) {
      alert('Please login to register for events');
      return;
    }

    try {
      await registerForEvent(eventId, userProfile.display_name);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const isUserRegistered = (event: any) => {
    return event.registered_users?.includes(userProfile?.display_name);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Event Hub</h1>
          <p className="text-slate-600 dark:text-slate-400">Join our community events and workshops</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={view === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setView('upcoming')}
            className={view === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}
          >
            Upcoming Events ({upcomingEvents.length})
          </Button>
          <Button
            variant={view === 'past' ? 'default' : 'outline'}
            onClick={() => setView('past')}
            className={view === 'past' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}
          >
            Past Events ({pastEvents.length})
          </Button>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayEvents.map((event) => (
          <Card key={event.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </Badge>
                <Badge variant={event.format === 'online' ? 'default' : 'secondary'}>
                  {event.format === 'online' ? (
                    <><Video className="w-3 h-3 mr-1" />Online</>
                  ) : (
                    <><MapPin className="w-3 h-3 mr-1" />Offline</>
                  )}
                </Badge>
              </div>
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{event.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Event Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 mr-2" />
                  {event.time} ({event.duration}min)
                </div>
              </div>

              {/* Location/Link */}
              {event.format === 'offline' && event.location && (
                <div className="flex items-start text-slate-600 dark:text-slate-400 text-sm">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {event.location}
                </div>
              )}

              {/* Instructor */}
              {event.instructor && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Instructor:</span> {event.instructor}
                </div>
              )}

              {/* Attendees */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  {event.registered}/{event.max_attendees} registered
                </div>
                <div className="text-xs text-slate-500">
                  {Math.round((event.registered / event.max_attendees) * 100)}% full
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(event.registered / event.max_attendees) * 100}%` }}
                ></div>
              </div>

              {/* Registered Users */}
              {event.registered_users && event.registered_users.length > 0 && (
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Registered:</span> {event.registered_users.slice(0, 3).join(', ')}
                  {event.registered_users.length > 3 && ` +${event.registered_users.length - 3} others`}
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                {event.status === 'upcoming' ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => handleRegister(event.id)}
                    disabled={isUserRegistered(event) || event.registered >= event.max_attendees}
                  >
                    {isUserRegistered(event) 
                      ? 'Already Registered' 
                      : event.registered >= event.max_attendees 
                        ? 'Event Full' 
                        : 'Register Now'}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    {event.recording && (
                      <Button variant="outline" className="flex-1">
                        Watch Recording
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No {view} events
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {view === 'upcoming' ? 'Check back later for new events!' : 'No past events to display.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventHub;
