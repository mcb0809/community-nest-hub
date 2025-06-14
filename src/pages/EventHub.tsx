
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Video, Plus, Filter } from 'lucide-react';

const EventHub = () => {
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingEvents = [
    {
      id: 1,
      title: 'React Performance Optimization Workshop',
      description: 'Learn advanced techniques to optimize your React applications for better performance.',
      type: 'workshop',
      format: 'online',
      date: '2024-06-20',
      time: '14:00',
      duration: 120,
      instructor: 'John Smith',
      maxAttendees: 50,
      registered: 32,
      registeredUsers: ['You', 'Sarah J.', 'Mike D.', '+29 others'],
      tags: ['React', 'Performance', 'Advanced'],
      meetingLink: 'https://zoom.us/j/123456789',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Monthly Community Meetup',
      description: 'Join our monthly meetup to network with fellow developers and share knowledge.',
      type: 'meetup',
      format: 'offline',
      date: '2024-06-25',
      time: '18:30',
      duration: 180,
      location: 'Tech Hub, District 1, Ho Chi Minh City',
      maxAttendees: 80,
      registered: 65,
      registeredUsers: ['You', 'Emily C.', 'Alex R.', '+62 others'],
      tags: ['Networking', 'Community', 'Social'],
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Database Design Masterclass',
      description: 'Deep dive into database design principles and best practices.',
      type: 'masterclass',
      format: 'online',
      date: '2024-06-28',
      time: '20:00',
      duration: 90,
      instructor: 'Dr. Maria Garcia',
      maxAttendees: 100,
      registered: 78,
      registeredUsers: ['David L.', 'Anna K.', 'Tom W.', '+75 others'],
      tags: ['Database', 'SQL', 'Design'],
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      status: 'upcoming'
    },
  ];

  const pastEvents = [
    {
      id: 4,
      title: 'Introduction to Next.js 14',
      description: 'Explore the new features and improvements in Next.js 14.',
      type: 'webinar',
      format: 'online',
      date: '2024-06-10',
      time: '19:00',
      duration: 60,
      instructor: 'Jane Doe',
      maxAttendees: 200,
      registered: 156,
      tags: ['Next.js', 'React', 'Framework'],
      status: 'completed',
      recording: 'https://youtube.com/watch?v=example'
    },
  ];

  const events = view === 'upcoming' ? upcomingEvents : pastEvents;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Event Hub</h1>
          <p className="text-slate-600 dark:text-slate-400">Join our community events and workshops</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
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
        {events.map((event) => (
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
                  {event.registered}/{event.maxAttendees} registered
                </div>
                <div className="text-xs text-slate-500">
                  {Math.round((event.registered / event.maxAttendees) * 100)}% full
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(event.registered / event.maxAttendees) * 100}%` }}
                ></div>
              </div>

              {/* Registered Users */}
              {event.registeredUsers && (
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Registered:</span> {event.registeredUsers.join(', ')}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {event.status === 'upcoming' ? (
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Register Now
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

      {events.length === 0 && (
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
