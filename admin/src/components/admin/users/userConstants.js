// src/components/admin/users/userConstants.js
//
// SINGLE SOURCE OF TRUTH for staff role & account status vocabulary.
// Mirrors models/User.js enums — keep in sync if the schema changes.
//   role:   admin (owner, full power) | staff (orders, phone orders,
//           pre-bookings, inquiries, stock, customer list). No customer
//           accounts: "user" only exists on old records and is not listed.
//   status: active | suspended | inactive

export const ROLES = [
    { value: "staff", label: "Staff", badge: "bg-gray-100 text-gray-700" },
    { value: "admin", label: "Admin", badge: "bg-blue-100 text-blue-700" },
];

export const STATUSES = [
    { value: "active", label: "Active", badge: "bg-green-100 text-green-700" },
    { value: "suspended", label: "Suspended", badge: "bg-red-100 text-red-700" },
    { value: "inactive", label: "Inactive", badge: "bg-gray-100 text-gray-500" },
];

export const roleMeta = (value) => ROLES.find((r) => r.value === value) || ROLES[0];
export const statusMeta = (value) => STATUSES.find((s) => s.value === value) || STATUSES[0];

// Only the admin reaches this page (API: admin only), and may set either role.
export const assignableRoles = () => ROLES;

export const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "?";
