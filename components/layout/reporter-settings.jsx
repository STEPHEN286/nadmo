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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileSchema } from "@/lib/utils";

export default function ReporterSettings() {
  const { user } = useReporterAuth();
  const { profile, isProfileLoading, profileError, updateProfile, isUpdating } = useProfile(user?.id);
  const { data: regions, isPending: regionsLoading } = useRegions();
  const [selectedRegion, setSelectedRegion] = useState(profile?.profile?.region?.id || "");
  const { data: districts, isLoading: districtsLoading } = useDistricts(selectedRegion);

  // Initialize React Hook Form with Zod resolver
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      region: "",
      district: "",
    },
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile) {
      // console.log("Setting form values from profile:", profile);
      const formData = {
        full_name: profile?.profile?.full_name || "",
        email: profile?.email || "",
        phone_number: profile?.profile?.phone_number || "",
        region: profile?.profile?.region?.id || "",
        district: profile?.profile?.district?.id || "",
      };
      // console.log("Form data to set:", formData);
      
      form.reset(formData);
      setSelectedRegion(profile?.profile?.region?.id || "");
      
     
    }
  }, [profile, form]);

  // Handle region change to reset district
  const handleRegionChange = (value) => {
    form.setValue("region", value);
    form.setValue("district", "");
    setSelectedRegion(value);
  };

  // Handle form submission
  const onSubmit = (data) => {
    const profileData = {
      email: data.email,
      profile: {
        full_name: data.full_name,
        phone_number: data.phone_number,
        region_id: data.region,
        district_id: data.district,
      }
    };
    if (user?.id) {
      updateProfile({ userId: user.id, profileData });
    }
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      disabled={isUpdating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      disabled={isUpdating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your phone number"
                      disabled={isUpdating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <Select
                    key={`region-${field.value}`}
                    disabled={regionsLoading || isUpdating}
                    onValueChange={handleRegionChange}
                    // defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions && regions.length > 0 && regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select
                    key={`district-${field.value}`}
                    disabled={districtsLoading || !selectedRegion || isUpdating}
                    onValueChange={field.onChange}
                    // defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {districts && districts.length > 0 && districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button type="submit" disabled={isUpdating} className="flex-1">
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
        <Separator />
      </CardContent>
    </Card>
  );
} 