
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<FileAttachment | null> => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return {
        id: crypto.randomUUID(),
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: publicUrl
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadVoiceMessage = async (audioBlob: Blob): Promise<FileAttachment | null> => {
    setUploading(true);
    try {
      const fileName = `voice_${Date.now()}.webm`;
      const filePath = `voice/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return {
        id: crypto.randomUUID(),
        file_name: fileName,
        file_type: 'audio/webm',
        file_size: audioBlob.size,
        file_url: publicUrl
      };
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload voice message",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploadVoiceMessage,
    uploading
  };
};
