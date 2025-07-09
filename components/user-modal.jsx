"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useAddUser } from "@/hooks/use-add-user";
import { useDistricts } from "@/hooks/use-districts";
import { useRegions } from "@/hooks/use-regions";
// import CommunityAutocomplete from "@/components/community-autocomplete";

const userSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be a 10-digit number"),
    role: z.enum(
      ["ADMIN", "GES_REGIONAL_OFFICER", "GES_DISTRICT_OFFICER", "REPORTER"],
      {
        required_error: "Please select a role",
      }
    ),
    region: z.string().optional(),
    district: z.string().optional(),
    community: z.object({
      id: z.string(),
      name: z.string()
    }).optional(),
    status: z.enum(["active", "inactive"], {
      required_error: "Please select a status",
    }),
  })
  .refine(
    (data) => {
      if (
        data.role === "GES_REGIONAL_OFFICER" ||
        data.role === "GES_DISTRICT_OFFICER" ||
        data.role === "REPORTER"
      ) {
        return !!data.region;
      }
      return true;
    },
    {
      message: "Region is required for Regional Officers, District Officers, and Field Reporters",
      path: ["region"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "GES_DISTRICT_OFFICER" || data.role === "REPORTER") {
        return !!data.district;
      }
      return true;
    },
    {
      message: "District is required for District Officers and Field Reporters",
      path: ["district"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "REPORTER") {
        return !!data.community && !!data.community.id;
      }
      return true;
    },
    {
      message: "Community is required for Field Reporters",
      path: ["community"],
    }
  );

export default function UserModal({
  open,
  onOpenChange,
  editingUser,
  onSuccess,
  currentUserRole,
  currentUserRegionId,
  currentUserDistrictId,
}) {
  const { addUser, updateUser, addUserLoading, updateUserLoading } =
    useAddUser();
  const [mounted, setMounted] = useState(false);
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    control,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "",
      region: "",
      district: "",
      community: "",
      status: "active",
    },
  });
// check the selected region
  const selectedRegion = watch("region");
  const { data: districts, isLoading: districtsLoading } =
    useDistricts(selectedRegion, currentUserRole, currentUserRegionId);

  console.log("region", regions);

  // Ensure component is mounted on client before running effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when modal opens/closes or when editing user changes
  useEffect(() => {
    if (!mounted) return; // Don't run during SSR

    if (open) {
      if (editingUser) {
        // Edit mode - populate form with user data
        reset({
          fullName: editingUser.name || editingUser.fullName || "",
          email: editingUser.email || "",
          phone: editingUser.phone || "",
          role: editingUser.role || "",
          region: editingUser.region || editingUser.assignedRegion?.id || "",
          district:
            editingUser.district || editingUser.assignedDistrict?.id || "",
          community: editingUser.community || editingUser.assignedCommunity || null,
          password: "",
          status:
            editingUser.status || editingUser.isActive ? "active" : "inactive",
        });
      } else {
        // Add mode - reset to default values
        reset({
          fullName: "",
          email: "",
          phone: "",
          role: "",
          region: currentUserRole === "GES_REGIONAL_OFFICER" ? currentUserRegionId : "",
          district: "",
          community: null,
          password: "",
          status: "active",
        });
      }
    }
  }, [open, editingUser, reset, mounted, currentUserRole, currentUserRegionId]);

  // Reset district when region changes
  useEffect(() => {
    if (mounted) {
      setValue("district", "");
    }
  }, [selectedRegion, setValue, mounted]);

  const onSubmit = async (data) => {
    try {
      // Convert status string to boolean isActive
      // const { status, ...rest } = data;
      // const isActive = status === "active";
      // const payload = { ...rest, isActive };
      if (editingUser) {
        // Update user
        await updateUser(editingUser.id, data);
      } else {
        // Add user
        await addUser(data);
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data, editingUser ? "update" : "add");
      }

      // Close modal
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error("Form submission error:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const role = watch("role");
  const isLoading = addUserLoading || updateUserLoading;

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    if (currentUserRole === "ADMIN") {
      return ["ADMIN", "GES_REGIONAL_OFFICER", "GES_DISTRICT_OFFICER", "REPORTER"];
    } else if (currentUserRole === "GES_REGIONAL_OFFICER") {
      return ["GES_DISTRICT_OFFICER", "REPORTER"];
    } else if (currentUserRole === "GES_DISTRICT_OFFICER") {
      return ["REPORTER"];
    }
    return [];
  };

  const availableRoles = getAvailableRoles();

  // Don't render form content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user information and permissions"
                : "Create a new user account with appropriate role and permissions"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Update user information and permissions"
              : "Create a new user account with appropriate role and permissions"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Name *</Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Enter full name"
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="user@ges.gov.gh"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+233 XX XXX XXXX"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => {
                        const roleLabels = {
                          ADMIN: "Admin",
                          GES_REGIONAL_OFFICER: "Regional Officer",
                          GES_DISTRICT_OFFICER: "District Officer",
                          REPORTER: "Field Reporter"
                        };
                        return (
                          <SelectItem key={role} value={role}>
                            {roleLabels[role] || role}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>
          </div>
          {/* Location Assignment */}
          {(role === "GES_REGIONAL_OFFICER" || role === "GES_DISTRICT_OFFICER" || role === "REPORTER") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Controller
                  name="region"
                  control={control}
                  render={({ field }) => {
                    const selectedRegion = regions?.find(
                      (r) => r.id === field.value
                    );
                    return (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region">
                            {selectedRegion?.name || ""}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {regions && regions.length > 0 ? (
                            regions.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                {region?.name || ""}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              Loading regions...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.region && (
                  <p className="text-sm text-red-500">
                    {errors.region.message}
                  </p>
                )}
              </div>
              {(role === "GES_DISTRICT_OFFICER" || role === "REPORTER") && (
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => {
                      const selectedDistrict = districts?.find(
                        (d) => d.id === field.value
                      );
                      return (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoading || districtsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select district">
                              {selectedDistrict?.name || ""}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {districtsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading districts...
                              </SelectItem>
                            ) : districts && districts.length > 0 ? (
                              districts.map((district) => (
                                <SelectItem
                                  key={district.id}
                                  value={district.id}
                                >
                                  {district?.name || ""}
                                </SelectItem>
                              ))
                            ) : selectedRegion ? (
                              <SelectItem value="no-districts" disabled>
                                No districts found
                              </SelectItem>
                            ) : (
                              <SelectItem value="select-region-first" disabled>
                                Select a region first
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {errors.district && (
                    <p className="text-sm text-red-500">
                      {errors.district.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Community Field for REPORTER */}
          {/* {role === "REPORTER" && (
            <div className="space-y-2">
              <Label htmlFor="community">Community *</Label>
              <Controller
                name="community"
                control={control}
                render={({ field }) => (
                  <CommunityAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    districtId={watch("district")}
                    placeholder="Search or create community..."
                    disabled={isLoading || !watch("district")}
                  />
                )}
              />
              {errors.community && (
                <p className="text-sm text-red-500">{errors.community.message}</p>
              )}
            </div>
          )} */}
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {editingUser ? "Updating..." : "Adding..."}
                </>
              ) : editingUser ? (
                "Update User"
              ) : (
                "Add User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
