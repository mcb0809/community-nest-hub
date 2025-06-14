
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Users, Calendar, Clock } from 'lucide-react';
import { Event } from '@/hooks/useEvents';

interface EventsTableProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  loading?: boolean;
}

const EventsTable: React.FC<EventsTableProps> = ({ events, onEdit, onDelete, loading }) => {
  const getEventTypeColor = (type: string) => {
    const colors = {
      workshop: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      meetup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      masterclass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      webinar: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-red-500/20">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-red-500/20">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Events Management ({events.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No events found. Create your first event!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Event</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Date & Time</TableHead>
                  <TableHead className="text-slate-300">Attendees</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{event.title}</div>
                        <div className="text-sm text-slate-400">{event.description}</div>
                        {event.instructor && (
                          <div className="text-xs text-slate-500">Instructor: {event.instructor}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                      <div className="mt-1">
                        <Badge variant={event.format === 'online' ? 'default' : 'secondary'} className="text-xs">
                          {event.format}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Clock className="w-3 h-3" />
                        {event.time} ({event.duration}min)
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Users className="w-3 h-3" />
                        {event.registered}/{event.max_attendees}
                      </div>
                      <div className="text-xs text-slate-500">
                        {Math.round((event.registered / event.max_attendees) * 100)}% full
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => onEdit(event)}
                          size="sm"
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => onDelete(event.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsTable;
