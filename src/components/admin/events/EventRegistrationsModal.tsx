import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Mail, Calendar, X } from 'lucide-react';
import { Event } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';

interface EventRegistrationsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RegistrationData {
  user_name: string;
  registered_at: string;
  user_email?: string;
}

const EventRegistrationsModal: React.FC<EventRegistrationsModalProps> = ({ 
  event, 
  isOpen, 
  onClose 
}) => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      fetchRegistrations();
    }
  }, [event, isOpen]);

  const fetchRegistrations = async () => {
    if (!event) return;

    try {
      setLoading(true);
      
      console.log('Fetching registrations for event:', event.id);
      
      // First, get the registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('user_name, registered_at, user_id')
        .eq('event_id', event.id)
        .order('registered_at', { ascending: true });

      if (registrationsError) throw registrationsError;

      console.log('Raw registrations data:', registrationsData);

      // Then, get user emails for each registration
      const transformedData: RegistrationData[] = [];
      
      for (const registration of registrationsData || []) {
        let userEmail = 'N/A';
        
        console.log('Processing registration:', registration);
        
        if (registration.user_id) {
          console.log('Looking up email for user_id:', registration.user_id);
          
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', registration.user_id)
            .single();
          
          console.log('Profile lookup result:', { profileData, profileError });
          
          if (!profileError && profileData?.email) {
            userEmail = profileData.email;
          }
        } else {
          // If user_id is null, try to find the user by name (fallback for old registrations)
          console.log('user_id is null, trying to find by name:', registration.user_name);
          
          const { data: profileByName, error: nameError } = await supabase
            .from('user_profiles')
            .select('email')
            .ilike('display_name', registration.user_name)
            .single();
          
          console.log('Profile lookup by name result:', { profileByName, nameError });
          
          if (!nameError && profileByName?.email) {
            userEmail = profileByName.email;
          }
        }

        transformedData.push({
          user_name: registration.user_name,
          registered_at: registration.registered_at,
          user_email: userEmail
        });
      }

      console.log('Final transformed data:', transformedData);
      setRegistrations(transformedData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRegistrationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border-red-500/20 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Danh sách người tham gia
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Info */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">{event.title}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(event.date)} lúc {event.time}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {registrations.length}/{event.max_attendees} người tham gia
              </div>
            </div>
          </div>

          {/* Registrations List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">
                Người đã đăng ký ({registrations.length})
              </h4>
              <Badge 
                variant={registrations.length >= event.max_attendees ? "destructive" : "default"}
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                {registrations.length >= event.max_attendees ? 'Đã đầy' : 'Còn chỗ'}
              </Badge>
            </div>

            {loading ? (
              <div className="text-center py-8 text-slate-400">
                Đang tải...
              </div>
            ) : registrations.length > 0 ? (
              <div className="border border-slate-700 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">STT</TableHead>
                      <TableHead className="text-slate-300">Tên người tham gia</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Ngày đăng ký</TableHead>
                      <TableHead className="text-slate-300">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration, index) => (
                      <TableRow key={index} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="text-slate-300">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {registration.user_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white">{registration.user_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-slate-300">
                            <Mail className="w-3 h-3" />
                            <span>{registration.user_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-300">
                            {formatRegistrationDate(registration.registered_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Đã đăng ký
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 bg-slate-700/30 rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                <p>Chưa có ai đăng ký sự kiện này</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationsModal;
