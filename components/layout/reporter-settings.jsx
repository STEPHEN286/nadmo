import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-user-profile";
import { useReporterAuth } from "@/hooks/use-reporter-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRegions } from "@/hooks/use-regions";
import { useDistricts } from "@/hooks/use-districts";

export default function ReporterSettings() {
  const { user } = useReporterAuth();
  const { profile, isProfileLoading, profileError, updateProfile, isUpdating } = useProfile();
  const { data: regions, isPending: regionsLoading } = useRegions();
  const [selectedRegion, setSelectedRegion] = useState(profile?.region?.id || "");
  const { data: districts, isLoading: districtsLoading } = useDistricts(selectedRegion);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone_number: profile?.phone_number || "",
    region: profile?.region?.id || "",
    district: profile?.district?.id || "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        region: profile.region?.id || "",
        district: profile.district?.id || "",
      });
      setSelectedRegion(profile.region?.id || "");
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (name === "region") {
      setSelectedRegion(value);
      setEditForm((prev) => ({ ...prev, district: "" }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (user?.id) {
      updateProfile({ userId: user.id, profileData: editForm });
    }
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
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={editForm.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={editForm.email}
             
            />
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
            <select
              id="region"
              name="region"
              value={editForm.region}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-2 py-2"
              disabled={regionsLoading || isUpdating}
            >
              <option value="">Select region</option>
              {regions && regions.length > 0 && regions.map((region) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <select
              id="district"
              name="district"
              value={editForm.district}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-2 py-2"
              disabled={districtsLoading || !editForm.region || isUpdating}
            >
              <option value="">Select district</option>
              {districts && districts.length > 0 && districts.map((district) => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
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