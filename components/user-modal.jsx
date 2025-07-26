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
// import { data } from "autoprefixer";

const userSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be a 10-digit number"),
    role: z.string().min(1, "Please select a role"),
    region: z.string().optional(),
    district: z.string().optional(),
    status: z.enum(["active", "inactive"], {
      required_error: "Please select a status",
    }),
  })
  .refine((val) => ROLES.includes(val.role), {
    message: "Please select a valid role",
    path: ["role"],
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
    })
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
  // console.log("regions data", regions)

 
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
  // Move role and selectedRegion declarations here, before any useEffect or hook that uses them
  const role = watch("role");
  const selectedRegion = watch("region");
  const { data: districts, isLoading: districtsLoading } = useDistricts(selectedRegion); // fetch all districts
  
  console.log(selectedRegion, "regionid")

  // Ensure component is mounted on client before running effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Don't run during SSR

    if (open) {
      if (editingUser) {
        // Edit mode - populate form with user data
        console.log("Editing user data:", editingUser);
        const regionValue = editingUser.profile?.region ||
          editingUser.region ||
          editingUser.assignedRegion?.id ||
          "";
        const districtValue = editingUser.profile?.district ||
          editingUser.district ||
          editingUser.assignedDistrict?.id ||
          "";
        // Handle cases where region/district might be objects with id properties
        const getRegionId = (region) => {
          if (typeof region === 'string') return region;
          if (region && typeof region === 'object' && region.id) return region.id;
          return "";
        };
        
        const getDistrictId = (district) => {
          if (typeof district === 'string') return district;
          if (district && typeof district === 'object' && district.id) return district.id;
          return "";
        };
        
        const finalRegionValue = getRegionId(regionValue);
        const finalDistrictValue = getDistrictId(districtValue);
        console.log("Setting region to:", regionValue);
        console.log("Setting district to:", districtValue);
        console.log("Final region ID:", finalRegionValue);
        console.log("Final district ID:", finalDistrictValue);
        reset({
          fullName:
            editingUser.profile?.full_name ||
            editingUser.name ||
            editingUser.fullName ||
            "",
          email: editingUser.email || "",
          phone: editingUser.profile?.phone_number || editingUser.phone || "",
          role: editingUser.role || "",
          region: finalRegionValue,
          district: finalDistrictValue,
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
              : currentUserRole === "district_officer"
              ? currentUserRegionId
              : "",
          district:
            currentUserRole === "district_officer"
              ? currentUserDistrictId
              : "",
          password: "",
          status: "active",
        });
      }
    }
  }, [open, editingUser, reset, mounted, currentUserRole, currentUserRegionId, currentUserDistrictId]);

  // Ensure region/district are set in form state for regional/district officer
  useEffect(() => {
    if (!mounted || !open) return;
    if (currentUserRole === "regional_officer") {
      setValue("region", currentUserRegionId);
    }
    if (currentUserRole === "district_officer") {
      setValue("region", currentUserRegionId);
      setValue("district", currentUserDistrictId);
    }
  }, [mounted, open, currentUserRole, currentUserRegionId, currentUserDistrictId, setValue]);

  // Reset district when region changes
  useEffect(() => {
    if (mounted) {
      // Only reset district when adding a new user, not when editing
      if (!editingUser) {
        setValue("district", "");
      }
    }
  }, [selectedRegion, setValue, mounted, editingUser]);

  useEffect(() => {
    if (!mounted || !open) return;
    if (currentUserRole === "district_officer" && role === "reporter") {
      setValue("region", currentUserRegionId);
      setValue("district", currentUserDistrictId);
    }
  }, [mounted, open, currentUserRole, currentUserRegionId, currentUserDistrictId, role, setValue]);

  const onSubmit = async (data) => {
    // Use only IDs for region and district in profile
    const profile = {
      full_name: data.fullName,
      phone_number: data.phone,
      region_id: data.region, // region ID only
    };
    if ((data.role === "district_officer" || data.role === "reporter") && data.district) {
      profile.district_id = data.district; 
    } else {
      profile.district_id = null;
    }

    // Add User Payload (flat, no profile)
    const addPayload = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: data.status, // or is_active: data.status === "active" if needed
      region: data.region,
    };
    if ((data.role === "district_officer" || data.role === "reporter") && data.district) {
      addPayload.district = data.district;
    }

    // Update User Payload (now with only IDs for region and district)
    const updatePayload = {
      email: data.email,
      role: data.role,
      is_staff: data.role !== "reporter",
      is_active: data.status === "active",
      profile,
    };

    try {
      if (editingUser) {
        await updateUser(editingUser.id, updatePayload);
      } else {
        await addUser(addPayload);
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

  const isLoading = addUserLoading || updateUserLoading;

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    const role = (currentUserRole || "").toLowerCase();
    if (role === "admin") {
      // Remove 'admin' from the dropdown for admin users
      return ROLES.filter(r => r !== "admin");
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
            // console.log("Form submitted with data:", data);
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
                      {/* Always show the current value if editing, even if not in availableRoles */}
                      {editingUser && field.value && !availableRoles.includes(field.value) && (
                        <SelectItem key={field.value} value={field.value}>
                          {(() => {
                            const roleLabels = {
                              admin: "Admin",
                              regional_officer: "Regional Officer",
                              district_officer: "District Officer",
                              reporter: "Field Reporter",
                            };
                            return roleLabels[field.value] || field.value;
                          })()}
                        </SelectItem>
                      )}
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
          {/* Only admin sees region and district selects */}
          {currentUserRole === "admin" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region Select */}
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Controller
                  name="region"
                  control={control}
                  render={({ field }) => {
                    const selectedRegion = regions?.find((r) => r.id === field.value);
                    // If editing and the current region is not in the list, add it
                    const regionOptions = regions ? [...regions] : [];
                    if (editingUser && field.value && !regionOptions.some(r => r.id === field.value)) {
                      regionOptions.unshift({
                        id: field.value,
                        name: (selectedRegion && typeof selectedRegion.name === 'string')
                          ? selectedRegion.name
                          : (typeof field.value === 'string' ? field.value : String(field.value))
                      });
                    }
                    return (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region">
                            {selectedRegion && typeof selectedRegion.name === 'string' ? selectedRegion.name : (typeof field.value === 'string' ? field.value : "")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {regionOptions && regionOptions.length > 0 ? (
                            regionOptions.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                {typeof region.name === 'string' ? region.name : (typeof region.id === 'string' ? region.id : "")}
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
              {/* District Select */}
              {(role === "district_officer" || role === "reporter") && (
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => {
                      const selectedDistrict = districts?.find((d) => d.id === field.value);
                      // If editing and the current district is not in the list, add it
                      const districtOptions = districts ? [...districts] : [];
                      if (editingUser && field.value && !districtOptions.some(d => d.id === field.value)) {
                        districtOptions.unshift({
                          id: field.value,
                          name: (selectedDistrict && typeof selectedDistrict.name === 'string')
                            ? selectedDistrict.name
                            : (typeof field.value === 'string' ? field.value : String(field.value))
                        });
                      }
                      return (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoading || districtsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select district">
                              {selectedDistrict && typeof selectedDistrict.name === 'string' ? selectedDistrict.name : (typeof field.value === 'string' ? field.value : "")}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {districtsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading districts...
                              </SelectItem>
                            ) : districtOptions && districtOptions.length > 0 ? (
                              districtOptions.map((district) => (
                                <SelectItem
                                  key={district.id}
                                  value={district.id}
                                >
                                  {typeof district.name === 'string' ? district.name : (typeof district.id === 'string' ? district.id : "")}
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

          {/* For regional officer, hide selects and set region in form state */}
          {currentUserRole === "regional_officer" && (
            <input type="hidden" {...register("region")} value={currentUserRegionId} />
          )}
          {/* For district officer, hide selects and set region and district in form state */}
          {currentUserRole === "district_officer" && (
            <>
              <input type="hidden" {...register("region")} value={currentUserRegionId} />
              <input type="hidden" {...register("district")} value={currentUserDistrictId} />
            </>
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
        {/* Debug: List all loaded districts for developer visibility */}
        {/* {districts && !districtsLoading && (
          <div className="mt-8 p-4 bg-gray-100 rounded">
            <h4 className="font-bold mb-2">Loaded Districts ({districts.length}):</h4>
            <ul className="max-h-40 overflow-y-auto text-sm">
              {districts.map((d) => (
                <li key={d.id}>
                  {d?.name} <span className="text-gray-500">({d?.region?.name})</span>
                </li>
              ))}
            </ul>
          </div>
        )} */}
      </DialogContent>
    </Dialog>
  );
}
