
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { icons } from "lucide-react";

interface EditChannelModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialData: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    role: string;
    isPublic?: boolean;
  } | null;
  onSave: (data: { id: string; name: string; description: string; icon: string; permissions: any }) => void;
}

const availableIcons = [
  "Hash", "Volume2", "Zap", "Users", "Settings", "Lock", "Globe", "Heart", "Star", "MessageCircle"
];

const channelRoles = [
  { value: "public", label: "Public", description: "Everyone can see and join" },
  { value: "private", label: "Private", description: "Invite only" },
  { value: "admin-only", label: "Admin Only", description: "Only admins can access" }
];

const EditChannelModal: React.FC<EditChannelModalProps> = ({ open, onOpenChange, initialData, onSave }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [icon, setIcon] = useState(initialData?.icon || "Hash");
  const [channelType, setChannelType] = useState("public");
  const [allowedRoles, setAllowedRoles] = useState<string[]>(["admin", "mod", "user"]);

  React.useEffect(() => {
    setName(initialData?.name || "");
    setDescription(initialData?.description || "");
    setIcon(initialData?.icon || "Hash");
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) return;
    
    onSave({ 
      id: initialData.id, 
      name: name.trim(), 
      description: description, 
      icon,
      permissions: {
        type: channelType,
        allowedRoles: allowedRoles
      }
    });
    onOpenChange(false);
  };

  const toggleRole = (role: string) => {
    setAllowedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <Label htmlFor="channel-name" className="text-slate-300">Channel Name</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="mt-1 bg-slate-800/50 border-slate-600/50 text-white"
              placeholder="Enter channel name"
            />
          </div>
          
          <div>
            <Label htmlFor="channel-description" className="text-slate-300">Description</Label>
            <Input
              id="channel-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1 bg-slate-800/50 border-slate-600/50 text-white"
              placeholder="Channel description (optional)"
            />
          </div>
          
          <div>
            <Label className="text-slate-300">Channel Icon</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableIcons.map(ic => {
                const Icon = icons[ic as keyof typeof icons];
                return (
                  <Button
                    key={ic}
                    type="button"
                    size="sm"
                    variant={icon === ic ? "default" : "outline"}
                    className={`h-10 w-10 p-0 transition border ${
                      icon === ic 
                        ? "border-purple-500 bg-purple-500 text-white" 
                        : "border-slate-600 hover:border-purple-400"
                    }`}
                    onClick={() => setIcon(ic)}
                  >
                    <Icon className="w-5 h-5"/>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Channel Privacy</Label>
            <Select value={channelType} onValueChange={setChannelType}>
              <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Select channel type" />
              </SelectTrigger>
              <SelectContent>
                {channelRoles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span>{role.label}</span>
                      <span className="text-xs text-slate-400">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-300">Allowed Roles</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {["admin", "mod", "user"].map(role => (
                <Badge
                  key={role}
                  variant={allowedRoles.includes(role) ? "default" : "outline"}
                  className={`cursor-pointer transition ${
                    allowedRoles.includes(role)
                      ? "bg-purple-500 text-white"
                      : "border-slate-600 text-slate-400 hover:border-purple-400"
                  }`}
                  onClick={() => toggleRole(role)}
                >
                  {role}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Click to toggle role permissions for this channel
            </p>
          </div>

          <DialogFooter className="mt-4 flex gap-2 items-center justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChannelModal;
