"use client"

import { useState } from "react"
import { NadmoLayout } from "@/components/layout/nadmo-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useDeleteUser } from "@/hooks/use-delete-user"
import { Users, UserPlus, Edit, Trash2, Search, Shield, Mail, Phone, MapPin, Key, Eye, EyeOff } from "lucide-react"

import {useUsers} from "@/hooks/use-users"
// import {useRegions} from "@/hooks/use-regions"
import UserModal from "@/components/user-modal"


export default function UserManagementPage() {
  const { user, system } = useAuth()
  const { isPending, users, error } = useUsers(system)
  const deleteUserMutation = useDeleteUser()

  console.log("user", users)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null })
  const { toast } = useToast()
  
  if (isPending) {
    return (
      <NadmoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </NadmoLayout>
    )
  }

  // Check if current user has permission to access user management
  const canAccessUserManagement = ["admin", "GES_REGIONAL_OFFICER", "GES_DISTRICT_OFFICER"].includes(user?.role)
  
  if (!canAccessUserManagement) {
    return (
      <NadmoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to access user management.</p>
          </div>
        </div>
      </NadmoLayout>
    )
  }

  // Filter users based on role-based access control
  const filteredUsers = users?.filter((userItem) => {
    // Search and status filters
    const matchesSearch =
      (userItem.profile?.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase())
    // Fix role filter to use actual role values
    const matchesRole = filterRole === "all" || userItem.role === filterRole
    // Fix status filter to compare string to boolean
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && userItem.is_active === true) ||
      (filterStatus === "inactive" && userItem.is_active === false);

    // Role-based access control
    let hasAccess = true
    
    if (user?.role === "GES_REGIONAL_OFFICER") {
      // Regional Officer can see district officers and reporters in their assigned region
      hasAccess = userItem.profile?.region === user.profile?.region && 
                  (userItem.role === "GES_DISTRICT_OFFICER" || userItem.role === "reporter")
    }
    else if (user?.role === "GES_DISTRICT_OFFICER") {
      // District Officer can only see reporters in their assigned district
      hasAccess = userItem.profile?.district === user.profile?.district && 
                  userItem.role === "reporter"
    }
    // Admin can see all users except other admins (for deletion purposes)
    else if (user?.role === "admin") {
      // Show all users except other admins in the delete context
      hasAccess = userItem.role !== "admin" || userItem.id === user.id
    }

    return matchesSearch && matchesRole && matchesStatus && hasAccess
  })

  const handleEditUser = (userData) => {
    setEditingUser(userData)
    setIsAddUserOpen(true)
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setIsAddUserOpen(true)
  }

  const handleModalSuccess = (data, action) => {
    // Handle successful form submission
    // You can add additional logic here like refreshing the users list
    console.log(`${action} user:`, data)
  }

  const handleDeleteUser = (userData) => {
    setDeleteDialog({ open: true, user: userData })
  }

  const confirmDelete = () => {
    if (deleteDialog.user) {
      deleteUserMutation.mutate(deleteDialog.user.id)
      setDeleteDialog({ open: false, user: null })
    }
  }

  const cancelDelete = () => {
    setDeleteDialog({ open: false, user: null })
  }

  const canDeleteUser = (targetUser) => {
    // Users cannot delete themselves
    if (targetUser.id === user?.id) {
      return false
    }

    // Admin can delete regional officers, district officers, and reporters
    if (user?.role === "admin") {
      // Cannot delete other admins
      if (targetUser.role === "admin") {
        return false
      }
      return true
    }

    // Regional Officer can delete district officers and reporters in their region
    if (user?.role === "GES_REGIONAL_OFFICER") {
      // Can only delete users in their assigned region
      if (targetUser.profile?.region !== user.profile?.region) {
        return false
      }
      // Can only delete district officers and reporters
      if (targetUser.role !== "GES_DISTRICT_OFFICER" && targetUser.role !== "reporter") {
        return false
      }
      return true
    }

    // District Officer can delete reporters in their district
    if (user?.role === "GES_DISTRICT_OFFICER") {
      // Can only delete users in their assigned district
      if (targetUser.profile?.district !== user.profile?.district) {
        return false
      }
      // Can only delete reporters
      if (targetUser.role !== "reporter") {
        return false
      }
      return true
    }

    return false
  }

  const handleResetPassword = (userId, userName) => {
    if (confirm(`Reset password for ${userName}? They will receive an email with a new temporary password.`)) {
      toast({
        title: "Password reset",
        description: `Password reset email sent to ${userName}.`,
      })
    }
  }

  const getRoleBadge = (role) => {
    const variants = {
      admin: "default",
      GES_REGIONAL_OFFICER: "secondary",
      GES_DISTRICT_OFFICER: "outline",
      reporter: "destructive",
    }

    const labels = {
      admin: "Admin",
      GES_REGIONAL_OFFICER: "Regional Officer",
      GES_DISTRICT_OFFICER: "District Officer",
      reporter: "Field Reporter",
    }

    return <Badge variant={variants[role]}>{labels[role]}</Badge>
  }

  const getStatusBadge = (status) => {
    return (
      <Badge variant={status === true ? "default" : "secondary"}>
        {status === true ? "Active" : "Inactive"}
      </Badge>
    )
  }

  return (
    <NadmoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">
              {user?.role === "GES_ADMIN" ? "Manage regional officers and district officers" :
               user?.role === "GES_REGIONAL_OFFICER" ? "Manage district officers in your assigned region" :
               "Manage users in your assigned district"}
            </p>
          </div>
          <Button className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700" onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredUsers?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredUsers?.filter((u) => u.is_active).length || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredUsers?.filter((u) => u.role === "admin").length || 0}
                  </p>
                </div>
                <Key className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regional Officers</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredUsers?.filter((u) => u.role === "GES_REGIONAL_OFFICER").length || 0}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>Manage all user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="GES_REGIONAL_OFFICER">Regional Officer</SelectItem>
                  <SelectItem value="GES_DISTRICT_OFFICER">District Officer</SelectItem>
                  <SelectItem value="reporter">Field Reporter</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.profile?.full_name || user.name}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user?.role)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.profile?.region && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {user.profile?.region?.name}
                            </div>
                          )}
                          {user.profile?.district && <div className="text-gray-500 ml-4">{user.profile?.district?.name}</div>}
                          {user.role === "reporter" && user.assignedCommunity && (
                            <div className="text-gray-500 ml-4">{user.assignedCommunity.name}</div>
                          )}
                          {!user.profile?.region?.name && !user.profile?.district?.name && <span className="text-gray-400">Global</span>}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{new Date(user.last_login).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                         
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={!canDeleteUser(user)}
                            className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                            title={!canDeleteUser(user) ? "You don't have permission to delete this user" : "Delete user"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>No users found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* User Modal - moved outside main content */}
      <UserModal
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        editingUser={editingUser}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSuccess={handleModalSuccess}
        currentUserRole={user?.role}
        currentUserRegionId={user?.profile?.region?.id}
        currentUserDistrictId={user?.profile?.district?.id}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.user?.profile?.full_name || deleteDialog.user?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NadmoLayout>
  )
}
