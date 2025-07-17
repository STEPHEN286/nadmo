import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUpdateReportStatus } from "@/hooks/use-reports";

const DEFAULT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "fake", label: "Fake" },
];

export default function StatusUpdateModal({ open, onClose, reportId, status, page = 1, statusOptions }) {
  const [newStatus, setNewStatus] = useState(status || "");
  const updateStatusMutation = useUpdateReportStatus(page);

  useEffect(() => {
    setNewStatus(status || "");
  }, [status, open]);

  const handleSubmit = () => {
    if (!newStatus || !reportId) return;
    
    console.log("StatusUpdateModal - submitting status:", newStatus, "for report:", reportId);
    
    updateStatusMutation.mutate(
      { reportId, status: newStatus },
      {
        onSuccess: () => {
          console.log("Status update successful, closing modal");
          onClose();
        }
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
        <h3 className="text-lg font-semibold mb-4">Edit Report Status</h3>
        <div className="mb-4">
          <Label>Status</Label>
          <Select value={newStatus} onValueChange={(value) => {
            console.log("StatusUpdateModal - status selected:", value);
            setNewStatus(value);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {(statusOptions || DEFAULT_STATUS_OPTIONS).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={updateStatusMutation.isPending ? true : undefined}
            disabled={updateStatusMutation.isPending || !newStatus}
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
} 