import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-user-profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ReporterSettings() {
  const { profile, isProfileLoading, profileError, updateProfile, isUpdating } = useProfile();
  const [editForm, setEditForm] = useState({
    phone_number: "",
    region: { id: "", name: "" },
    district: { id: "", name: "", region: { id: "", name: "" } },
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        phone_number: profile.phone_number || "",
        region: profile.region || { id: "", name: "" },
        district: profile.district || { id: "", name: "", region: { id: "", name: "" } },
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(editForm);
    setIsEditing(false);
  };

  if (isProfileLoading) {
    return <div className="py-8 text-center">Loading profile...</div>;
  }
  if (profileError) {
    return <div className="py-8 text-center text-red-600">Failed to load profile: {profileError.message}</div>;
  }
  if (!profile) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Profile Settings</span>
        </CardTitle>
        <CardDescription>Update your contact information and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={profile.full_name || ""} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email || ""} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={editForm.phone_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              name="region"
              value={editForm.region?.name || ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, region: { ...prev.region, name: e.target.value } }))}
              placeholder="Enter your region"
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              name="district"
              value={editForm.district?.name || ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, district: { ...prev.district, name: e.target.value, region: prev.region } }))}
              placeholder="Enter your district"
              disabled={isUpdating}
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" disabled={isUpdating} className="flex-1">
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
        <Separator />
      </CardContent>
    </Card>
  );
} 