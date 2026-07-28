import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

// Role-based access mapping: which roles can see which paths
const ROLE_ACCESS = {
  SUPER_ADMIN: [
    "/dashboard", "/users", "/roles", "/permissions",
    "/branches", "/groups",
    "/customers", "/customer-documents",
    "/loan-products", "/loan-applications", "/loans", "/collections",
    "/cash-book", "/expenses", "/income",
    "/loan-reports", "/collection-reports", "/customer-reports",
    "/settings", "/profile",
  ],
  BRANCH_MANAGER: [
    "/dashboard", "/branches", "/groups",
    "/customers", "/customer-documents",
    "/loan-products", "/loan-applications", "/loans", "/collections",
    "/loan-reports", "/collection-reports", "/customer-reports",
    "/profile",
  ],
  FIELD_OFFICER: [
    "/dashboard",
    "/customers", "/customer-documents",
    "/loan-applications", "/collections",
    "/profile",
  ],
  ACCOUNTANT: [
    "/dashboard",
    "/collections",
    "/cash-book", "/expenses", "/income",
    "/loan-reports", "/collection-reports", "/customer-reports",
    "/profile",
  ],
};

export function getFilteredMenu(userRole) {
  const allowedPaths = ROLE_ACCESS[userRole] || ROLE_ACCESS.FIELD_OFFICER;

  function filterItems(items) {
    return items.filter((item) => {
      if (item.children) {
        const filteredChildren = filterItems(item.children);
        item.children = filteredChildren;
        return filteredChildren.length > 0;
      }
      return item.path ? allowedPaths.includes(item.path) : true;
    });
  }

  const menu = [
    {
      section: "Dashboard",
      items: [{ title: "Dashboard", icon: DashboardIcon, path: "/dashboard" }],
    },
    {
      section: "Master",
      items: [
        {
          title: "User Management", icon: PeopleIcon,
          children: [
            { title: "Users", path: "/users" },
            { title: "Roles", path: "/roles" },
            { title: "Permissions", path: "/permissions" },
          ],
        },
        {
          title: "Organization", icon: ApartmentIcon,
          children: [
            { title: "Branches", path: "/branches" },
            { title: "Groups", path: "/groups" },
          ],
        },
        {
          title: "Customer", icon: PersonIcon,
          children: [
            { title: "Customers", path: "/customers" },
            { title: "Documents", path: "/customer-documents" },
          ],
        },
      ],
    },
    {
      section: "Loans",
      items: [{
        title: "Loan Management", icon: AccountBalanceWalletIcon,
        children: [
          { title: "Loan Products", path: "/loan-products" },
          { title: "Loan Applications", path: "/loan-applications" },
          { title: "Loans", path: "/loans" },
          { title: "Collections", path: "/collections" },
        ],
      }],
    },
    {
      section: "Finance",
      items: [{
        title: "Accounting", icon: PaidIcon,
        children: [
          { title: "Cash Book", path: "/cash-book" },
          { title: "Expenses", path: "/expenses" },
          { title: "Income", path: "/income" },
        ],
      }],
    },
    {
      section: "Reports",
      items: [{
        title: "Reports", icon: AssessmentIcon,
        children: [
          { title: "Loan Reports", path: "/loan-reports" },
          { title: "Collection Reports", path: "/collection-reports" },
          { title: "Customer Reports", path: "/customer-reports" },
        ],
      }],
    },
    {
      section: "System",
      items: [{ title: "Settings", icon: SettingsIcon, path: "/settings" }],
    },
  ];

  // Filter each section's items
  return menu
    .map((section) => ({
      ...section,
      items: filterItems(section.items),
    }))
    .filter((section) => section.items.length > 0);
}

export default getFilteredMenu;