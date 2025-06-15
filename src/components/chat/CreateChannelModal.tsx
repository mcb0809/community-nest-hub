
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface CreateChannelModalProps {
  onCreateChannel: (name: string, description: string, icon: string) => void;
}

const CreateChannelModal = ({ onCreateChannel }: CreateChannelModalProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateChannel(name.trim(), description.trim(), 'Hash');
      setName('');
      setDescription('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 neon-purple transition-all duration-300"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-purple-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="gradient-web3-text">Create New Channel</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new channel for your community to discuss specific topics.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Channel Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. general, dev-talk"
              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the channel"
              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-cyan-500">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
