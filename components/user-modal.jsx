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
import { ROLES } from "@/lib/constants";

const userSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be a 10-digit number"),
    role: z.enum(ROLES, {
      required_error: "Please select a role",
    }),
    region: z.string().optional(),
    district: z.string().optional(),
    status: z.enum(["active", "inactive"], {
      required_error: "Please select a status",
    }),
  })
  .refine(
    (data) => {
      // region required for all except admin
      if (ROLES.indexOf(data.role) > 0) {
        return !!data.region;
      }
      return true;
    },
    {
      message:
        "Region is required for Regional Officers, District Officers, and Field Reporters",
      path: ["region"],
    }
  )
  .refine(
    (data) => {
      // district required for district_officer and reporter
      if (ROLES.indexOf(data.role) > 1) {
        return !!data.district;
      }
      return true;
    },
    {
      message: "District is required for District Officers and Field Reporters",
      path: ["district"],
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
      region:
        currentUserRole === "GES_REGIONAL_OFFICER" ? currentUserRegionId : "",
      district: "",
      status: "active",
    },
  });
  // check the selected region
  const selectedRegion = watch("region");
  const { data: districts, isLoading: districtsLoading } = useDistricts(
    selectedRegion,
    currentUserRole,
    currentUserRegionId
  );

  // Ensure component is mounted on client before running effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Don't run during SSR

    if (open) {
      if (editingUser) {
        // Edit mode - populate form with user data
        reset({
          fullName:
            editingUser.profile?.full_name ||
            editingUser.name ||
            editingUser.fullName ||
            "",
          email: editingUser.email || "",
          phone: editingUser.profile?.phone_number || editingUser.phone || "",
          role: editingUser.role || "",
          region:
            editingUser.profile?.region ||
            editingUser.region ||
            editingUser.assignedRegion?.id ||
            "",
          district:
            editingUser.profile?.district ||
            editingUser.district ||
            editingUser.assignedDistrict?.id ||
            "",
          password: "",
          status:
            editingUser.status || editingUser.is_active ? "active" : "inactive",
        });
      } else {
        // Add mode - reset to default values
        reset({
          fullName: "",
          email: "",
          phone: "",
          role: "",
          region:
            currentUserRole === "GES_REGIONAL_OFFICER"
              ? currentUserRegionId
              : "",
          district: "",

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
    console.log("form data", data);

    // Transform to backend structure
    const payload = {
      email: data.email,
      role: data.role.toLowerCase(),
      profile: {
        full_name: data.fullName,
        phone_number: data.phone,
        region: data.region || "",
        district: data.district || "",
      },
      // Optionally add status or other fields if needed
    };

    try {
      if (editingUser) {
        await updateUser(editingUser.id, payload);
      } else {
        await addUser(payload);
      }
      if (onSuccess) {
        onSuccess(data, editingUser ? "update" : "add");
      }
      onOpenChange(false);
    } catch (error) {
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
    const role = (currentUserRole || "").toLowerCase();
    if (role === "admin") {
      return ROLES;
    } else if (role === "regional_officer") {
      return ["district_officer", "reporter"];
    } else if (role === "district_officer") {
      return ["reporter"];
    }
    return [];
  };

  const availableRoles = getAvailableRoles();
  // console.log(
  //   "currentUserRole:",
  //   currentUserRole,
  //   "availableRoles:",
  //   availableRoles
  // );

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

  console.log("Form errors:", errors);

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
        <form
          onSubmit={handleSubmit((data) => {
            console.log("Form submitted with data:", data);
            onSubmit(data);
          })}
          className="space-y-4 py-4"
        >
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
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
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
                          admin: "Admin",
                          regional_officer: "Regional Officer",
                          district_officer: "District Officer",
                          reporter: "Field Reporter",
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
          {(role === ROLES[1] ||
            role === ROLES[2] ||
            role === ROLES[3]) && (
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
              {(role === ROLES[2] || role === ROLES[3]) && (
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
              // onClick={() => console.log("Submit button clicked")}
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
