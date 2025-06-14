
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    role: string; // for future, currently not used
    isPublic?: boolean;
  } | null;
  onSave: (data: { id: string; name: string; description: string; icon: string }) => void;
}

const availableIcons = [
  "Hash", "Volume2", "Zap"
  // Thêm tên các icon ở đây nếu muốn mở rộng
];

const EditChannelModal: React.FC<EditChannelModalProps> = ({ open, onOpenChange, initialData, onSave }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [icon, setIcon] = useState(initialData?.icon || "Hash");

  // Khi initialData đổi thì update các trường
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
      icon 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa kênh</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <Label htmlFor="channel-name">Tên kênh</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="channel-description">Mô tả kênh</Label>
            <Input
              id="channel-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Chọn icon</Label>
            <div className="flex gap-2 mt-1">
              {availableIcons.map(ic => {
                const Icon = icons[ic];
                return (
                  <Button
                    key={ic}
                    type="button"
                    size="icon"
                    variant={icon === ic ? "default" : "outline"}
                    className={`transition border ${icon === ic ? "border-purple-500" : ""}`}
                    onClick={() => setIcon(ic)}
                  >
                    <Icon className="w-5 h-5"/>
                  </Button>
                );
              })}
            </div>
          </div>
          <DialogFooter className="mt-4 flex gap-2 items-center justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Hủy</Button>
            </DialogClose>
            <Button type="submit">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChannelModal;

