
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

const XPExplanationModal = ({ open, onOpenChange }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>🎯 Cách tính điểm XP</DialogTitle>
        <DialogDescription>
          <div className="space-y-2 text-sm text-slate-300 mt-2">
            <p><b>• Like:</b> +100 XP</p>
            <p><b>• Comment:</b> +200 XP</p>
            <p><b>• Share:</b> +300 XP</p>
            <p><b>• Xem hết khóa học:</b> +400 XP</p>
            <p><b>• Viết bài viết:</b> +350 XP</p>
            <p><b>• Truy cập mỗi ngày:</b> +100 XP</p>
            <p><b>• Online mỗi giờ:</b> +20 XP</p>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            💡 Tích lũy XP để thăng cấp, mở khóa huy hiệu và giữ vững streak mỗi ngày nhé!
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

export default XPExplanationModal;
