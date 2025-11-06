"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, MapPin, Plus, Edit, Trash2, Eye, ChevronDown, ChevronRight, Info, User, Shield, Users, Building } from "lucide-react"
import { toast } from "sonner"
import { signup } from "@/lib/action/auth"
import { CreateUser } from "@/lib/action/createUser"
import { createClient } from "@/lib/supabase/client"
import { PagePermissionSelector } from "@/components/ui/page-permission-selector"
import { PageActionSelector } from "@/components/ui/page-action-selector"
import { DEFAULT_ROLE_PERMISSIONS, Permission, PAGES, ACTIONS } from "@/lib/permissions/permissions"

interface User {
    id: string
    email: string
    role: string
    created_at: string
    tech_admin: boolean
    first_login: boolean
    permissions: any
    energyrite: boolean
    cost_code: string
    company: string
}

interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
}

interface SystemSetting {
    id: string
    category: string
    name: string
    value: string
    description: string
    type: "text" | "number" | "boolean" | "select"
    options?: string[]
}

export default function SettingsPage() {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [settings, setSettings] = useState<SystemSetting[]>([])
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const supabase = createClient();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
    const [isPermissionOpen, setIsPermissionOpen] = useState(false);
    
    // Add user form states
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserRole, setNewUserRole] = useState("");
    const [newUserPermissions, setNewUserPermissions] = useState<Permission[]>([]);
    const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

    // Form states:
    const [editEmail, setEditEmail] = useState("");
    const [editRole, setEditRole] = useState("");

    // Handlers:
    function openEditDialog(user: User) {
        setEditingUser(user as any);
        setEditEmail(user.email);
        setEditRole(user.role ?? "");
        setIsEditOpen(true);
    }

    function closeEditDialog() {
        setIsEditOpen(false);
        setEditingUser(null);
        setEditEmail("");
        setEditRole("");
    }

    async function submitUserUpdate() {
        if (!editingUser) return;

        const { error } = await supabase
            .from("users")
            .update({ email: editEmail, role: editRole })
            .eq("id", (editingUser as { id: string }).id);

        console.log("Update user : " + editEmail + " " + editRole);

        if (error) {
            alert("Failed to update user: " + error.message);
            return;
        }
        await fetchUsers();
        toast.success("User updated successfully");
        alert("User updated successfully");
        closeEditDialog();
    }


    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
            
            if (error) {
                console.error('Error fetching users:', error);
                setUsers([]);
                return;
            }
            
            setUsers(data || []);
        } catch (err) {
            console.error('Error in fetchUsers:', err);
            setUsers([]);
        }
    }

    useEffect(() => {
        fetchUsers();

        setRoles([
            {
                id: "1",
                name: "Administrator",
                description: "Full system access and configuration",
                permissions: ["dashboard", "user management", "drivers", "vehicles", "inspections", "fuel"],
            },
            {
                id: "2",
                name: "Fleet Manager",
                description: "Manage vehicles, drivers, and approve jobs",
                permissions: ["dashboard", "drivers", "vehicles", "inspections", "fuel"],
            },
            {
                id: "3",
                name: "FC",
                description: "Fleet Controller with read-only dashboard access",
                permissions: ["dashboard (read-only)"],
            },
            {
                id: "4",
                name: "External",
                description: "External customer access to fleet services",
                permissions: ["drivers", "vehicles", "inspections", "fuel", "financials"],
            },
        ])

        setSettings([
            {
                id: "1",
                category: "General",
                name: "Company Name",
                value: "Fleet Management Solutions",
                description: "The name of your company",
                type: "text",
            },
            {
                id: "2",
                category: "General",
                name: "Default Location",
                value: "Johannesburg, South Africa",
                description: "Default location for new breakdowns",
                type: "text",
            },
            {
                id: "3",
                category: "Notifications",
                name: "Email Notifications",
                value: "true",
                description: "Enable email notifications for breakdowns",
                type: "boolean",
            },
            {
                id: "4",
                category: "Notifications",
                name: "SMS Notifications",
                value: "false",
                description: "Enable SMS notifications for urgent breakdowns",
                type: "boolean",
            },
            {
                id: "5",
                category: "System",
                name: "Auto-assign Technicians",
                value: "true",
                description: "Automatically assign nearest available technician",
                type: "boolean",
            },
            {
                id: "6",
                category: "System",
                name: "Breakdown Timeout",
                value: "30",
                description: "Minutes before escalating unassigned breakdowns",
                type: "number",
            },
        ])
    }, [])

    const handleToggleUserStatus = (userId: string) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user,
            ),
        )
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-purple-100 text-purple-800"
            case "fleet-manager":
                return "bg-blue-100 text-blue-800"
            case "call-center":
                return "bg-green-100 text-green-800"
            case "cost-center":
                return "bg-orange-100 text-orange-800"
            case "customer":
                return "bg-gray-100 text-gray-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const groupedSettings = settings.reduce(
        (acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = []
            }
            acc[setting.category].push(setting)
            return acc
        },
        {} as Record<string, SystemSetting[]>,
    )

    async function handleDeleteUser(userId: string) {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) {
                toast.error('Failed to delete user: ' + error.message);
                return;
            }

            // Update UI immediately
            setUsers(prev => prev.filter(user => user.id !== userId));
            toast.success('User deleted successfully');
        } catch (err) {
            console.error('Error deleting user:', err);
            toast.error('Failed to delete user');
        }
    }


    return (
        <>
            <div className="flex-1 space-y-4 p-4 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Settings & Administration</h2>
                </div>

                <Tabs defaultValue="users" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        {/* <TabsTrigger value="system">System Settings</TabsTrigger>
                        <TabsTrigger value="locations">Locations</TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">User Management</h3>
                            <Dialog open={isAddUserOpen} onOpenChange={(open) => {
                                setIsAddUserOpen(open);
                                if (!open) {
                                    setNewUserEmail('');
                                    setNewUserRole('');
                                    setNewUserPermissions([]);
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="!max-w-none w-[80vw] max-h-[90vh] overflow-y-auto sm:!max-w-none">
                                    <DialogHeader className="pb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <DialogTitle className="text-xl">Add New User</DialogTitle>
                                                <DialogDescription className="text-sm text-gray-600">
                                                    Create a new user account with appropriate role and permissions
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>
                                    <TooltipProvider>
                                        <form action={CreateUser} className="space-y-8">
                                            <input type="hidden" name="email" value={newUserEmail} />
                                            <input type="hidden" name="role" value={newUserRole} />
                                            <input type="hidden" name="permissions" value={JSON.stringify(newUserPermissions)} />
                                            
                                            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    User Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                                            Email Address
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Info className="h-4 w-4 text-gray-400" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>User will receive login credentials at this email</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </Label>
                                                        <Input 
                                                            id="email" 
                                                            type="email" 
                                                            placeholder="user@company.com"
                                                            required 
                                                            value={newUserEmail}
                                                            onChange={(e) => setNewUserEmail(e.target.value)}
                                                            className="h-11"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="role" className="text-sm font-medium flex items-center gap-2">
                                                            User Role
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Info className="h-4 w-4 text-gray-400" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Role determines default permissions and access level</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </Label>
                                                        <Select 
                                                            value={newUserRole} 
                                                            onValueChange={(value) => {
                                                                setNewUserRole(value);
                                                                setNewUserPermissions(DEFAULT_ROLE_PERMISSIONS[value] || []);
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-11">
                                                                <SelectValue placeholder="Choose user role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="admin">
                                                                    <div className="flex items-center gap-2">
                                                                        <Shield className="h-4 w-4 text-red-500" />
                                                                        <div>
                                                                            <div className="font-medium">Administrator</div>
                                                                            <div className="text-xs text-gray-500">Full system access and user management</div>
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="fleet manager">
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4 text-blue-500" />
                                                                        <div>
                                                                            <div className="font-medium">Fleet Manager</div>
                                                                            <div className="text-xs text-gray-500">Manage vehicles, drivers, and operations</div>
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="fc">
                                                                    <div className="flex items-center gap-2">
                                                                        <Eye className="h-4 w-4 text-green-500" />
                                                                        <div>
                                                                            <div className="font-medium">Fleet Controller</div>
                                                                            <div className="text-xs text-gray-500">Monitor and track fleet operations</div>
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="customer">
                                                                    <div className="flex items-center gap-2">
                                                                        <Building className="h-4 w-4 text-orange-500" />
                                                                        <div>
                                                                            <div className="font-medium">External User</div>
                                                                            <div className="text-xs text-gray-500">Limited access for external partners</div>
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        
                                            {newUserRole && (
                                                <div className="bg-white border rounded-lg p-6 space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                            <Shield className="h-5 w-5" />
                                                            Permissions Configuration
                                                        </h3>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Info className="h-4 w-4 text-gray-400" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Customize what this user can access and modify</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                                                        Configure specific permissions for <strong>{newUserEmail || 'the new user'}</strong>. 
                                                        Default permissions are set based on the selected role.
                                                    </div>
                                                    
                                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                                        <h4 className="font-semibold text-sm text-gray-900 mb-3">Action Descriptions:</h4>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Eye className="h-4 w-4 text-blue-500" />
                                                                <span><strong>View:</strong> See page content and data</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Plus className="h-4 w-4 text-green-500" />
                                                                <span><strong>Create:</strong> Add new records or items</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Edit className="h-4 w-4 text-orange-500" />
                                                                <span><strong>Edit:</strong> Modify existing records</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                                <span><strong>Delete:</strong> Remove records permanently</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        {Object.entries(PAGES).map(([pageKey, pageInfo]) => {
                                                            const pagePermission = newUserPermissions.find(p => p.page === pageKey);
                                                            const hasPage = !!pagePermission;
                                                            const isExpanded = expandedPages.has(pageKey);
                                                            return (
                                                                <div key={pageKey} className={`border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 ${hasPage ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-100' : 'border-gray-200'}`}>
                                                                    <div className="flex items-center space-x-3 p-3">
                                                                        <Checkbox
                                                                            checked={hasPage}
                                                                            onCheckedChange={(checked) => {
                                                                                if (checked) {
                                                                                    setNewUserPermissions(prev => [...prev.filter(p => p.page !== pageKey), { page: pageKey as any, actions: ['view'] }]);
                                                                                    setExpandedPages(prev => new Set([...prev, pageKey]));
                                                                                } else {
                                                                                    setNewUserPermissions(prev => prev.filter(p => p.page !== pageKey));
                                                                                    setExpandedPages(prev => {
                                                                                        const newSet = new Set(prev);
                                                                                        newSet.delete(pageKey);
                                                                                        return newSet;
                                                                                    });
                                                                                }
                                                                            }}
                                                                        />
                                                                        <div className="flex items-center gap-2 flex-1">
                                                                            <span className="font-semibold text-gray-900">{pageInfo.name}</span>
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <Info className="h-4 w-4 text-gray-400" />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>{pageInfo.description}</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </div>
                                                                        {hasPage && (
                                                                            <>
                                                                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                                                                    {pagePermission?.actions.length} permissions
                                                                                </Badge>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        setExpandedPages(prev => {
                                                                                            const newSet = new Set(prev);
                                                                                            if (newSet.has(pageKey)) {
                                                                                                newSet.delete(pageKey);
                                                                                            } else {
                                                                                                newSet.add(pageKey);
                                                                                            }
                                                                                            return newSet;
                                                                                        });
                                                                                    }}
                                                                                    className="p-1 h-6 w-6"
                                                                                >
                                                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {hasPage && isExpanded && (
                                                                        <div className="px-3 pb-3">
                                                                            <div className="ml-6 grid grid-cols-2 gap-3">
                                                                                {Object.entries(ACTIONS).map(([actionKey, actionName]) => {
                                                                                    const isChecked = pagePermission?.actions.includes(actionKey as any) || false;
                                                                                    const actionDescriptions = {
                                                                                        view: 'See page content and data',
                                                                                        create: 'Add new records or items',
                                                                                        edit: 'Modify existing records',
                                                                                        delete: 'Remove records permanently'
                                                                                    };
                                                                                    const actionIcons = {
                                                                                        view: Eye,
                                                                                        create: Plus,
                                                                                        edit: Edit,
                                                                                        delete: Trash2
                                                                                    };
                                                                                    const ActionIcon = actionIcons[actionKey as keyof typeof actionIcons];
                                                                                    return (
                                                                                        <Tooltip key={actionKey}>
                                                                                            <TooltipTrigger asChild>
                                                                                                <label className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                                                                    isChecked ? 'bg-blue-100 border-blue-300 text-blue-900 shadow-sm' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                                                                                } ${actionKey === 'view' ? 'opacity-75' : ''}`}>
                                                                                                    <Checkbox
                                                                                                        checked={isChecked}
                                                                                                        onCheckedChange={(checked) => {
                                                                                                            setNewUserPermissions(prev => prev.map(p => {
                                                                                                                if (p.page === pageKey) {
                                                                                                                    const actions = checked 
                                                                                                                        ? [...p.actions.filter(a => a !== actionKey), actionKey as any]
                                                                                                                        : p.actions.filter(a => a !== actionKey);
                                                                                                                    return { ...p, actions: actions.length ? actions : ['view'] };
                                                                                                                }
                                                                                                                return p;
                                                                                                            }));
                                                                                                        }}
                                                                                                        disabled={actionKey === 'view'}
                                                                                                    />
                                                                                                    <ActionIcon className={`h-4 w-4 ${isChecked ? 'text-blue-600' : 'text-gray-500'}`} />
                                                                                                    <span className="text-sm font-medium">{actionName}</span>
                                                                                                </label>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                <p>{actionDescriptions[actionKey as keyof typeof actionDescriptions]}</p>
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                                                    <div className="text-sm">
                                                        <p className="font-medium text-amber-800">Account Setup</p>
                                                        <p className="text-amber-700 mt-1">
                                                            A temporary password will be generated and sent to the user's email address. 
                                                            They will be prompted to change it on first login.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-end gap-3 pt-6 border-t">
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={() => setIsAddUserOpen(false)}
                                                    className="px-6"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button 
                                                    type="submit" 
                                                    disabled={!newUserEmail || !newUserRole}
                                                    className="px-6 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Create User Account
                                                </Button>
                                            </div>
                                        </form>
                                    </TooltipProvider>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            {/* <TableHead>Status</TableHead> */}
                                            {/* <TableHead>Last Login</TableHead> */}
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.email}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge className={getRoleBadgeColor(user.role)}>
                                                        {user.role === 'customer' ? 'EXTERNAL' : user.role?.replace("-", " ").toUpperCase() || 'NO ROLE'}
                                                    </Badge>
                                                </TableCell>
                                                {/* <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={user.status === "active"}
                                                            onCheckedChange={() => handleToggleUserStatus(user.id)}
                                                        />
                                                        <span className={user.status === "active" ? "text-green-600" : "text-red-600"}>
                                                            {user.status}
                                                        </span>
                                                    </div>
                                                </TableCell> */}
                                                {/* <TableCell>{user.lastLogin}</TableCell> */}
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {/* <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button> */}
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => {
                                                                setEditingUser(user as any);
                                                                setUserPermissions(user.permissions || []);
                                                                setIsPermissionOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>



                    {/* <TabsContent value="system" className="space-y-4">
                        <h3 className="text-lg font-semibold">System Configuration</h3>
                        <div className="space-y-6">
                            {groupedSettings && Object.entries(groupedSettings).map(([category, categorySettings]) => (
                                <Card key={category}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{category} Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {categorySettings.map((setting) => (
                                            <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{setting.name}</h4>
                                                    <p className="text-sm text-gray-600">{setting.description}</p>
                                                </div>
                                                <div className="w-48">
                                                    {setting.type === "boolean" ? (
                                                        <Switch
                                                            checked={setting.value === "true"}
                                                            onCheckedChange={(checked) => handleUpdateSetting(setting.id, checked.toString())}
                                                        />
                                                    ) : setting.type === "select" && setting.options ? (
                                                        <Select
                                                            value={setting.value}
                                                            onValueChange={(value) => handleUpdateSetting(setting.id, value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {setting.options.map((option) => (
                                                                    <SelectItem key={option} value={option}>
                                                                        {option}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Input
                                                            type={setting.type === "number" ? "number" : "text"}
                                                            value={setting.value}
                                                            onChange={(e) => handleUpdateSetting(setting.id, e.target.value)}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="locations" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Location Management</h3>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Location
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center text-gray-500">
                                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>Location management interface will be implemented here</p>
                                    <p className="text-sm mt-2">Configure service areas, technician locations, and coverage zones</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent> */}
                </Tabs>


                {/* Edit User Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Update email and role for the user.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                submitUserUpdate();
                            }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="editEmail">Email Address</Label>
                                    <Input
                                        id="editEmail"
                                        name="editEmail"
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editRole">Role</Label>
                                    <Select value={editRole} onValueChange={setEditRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                            <SelectItem value="fleet manager">Fleet Manager</SelectItem>
                                            <SelectItem value="fc">FC</SelectItem>
                                            <SelectItem value="customer">External</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => closeEditDialog()}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* User Permissions Modal */}
                <Dialog open={isPermissionOpen} onOpenChange={setIsPermissionOpen}>
                    <DialogContent className="!max-w-none w-[70vw] max-h-[90vh] overflow-y-auto sm:!max-w-none">
                        <DialogHeader>
                            <DialogTitle>View User Permissions</DialogTitle>
                            <DialogDescription>
                                Current permissions for {editingUser?.email}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600">
                                Permissions assigned to <strong>{editingUser?.email}</strong>:
                            </div>
                            <PageActionSelector
                                initialPermissions={userPermissions}
                                readOnly={true}
                                onChange={() => {}}
                            />
                            <div className="flex justify-end pt-4">
                                <Button 
                                    onClick={() => {
                                        setIsPermissionOpen(false);
                                        setEditingUser(null);
                                        setUserPermissions([]);
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}
