import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BusinessIcon from "@mui/icons-material/Business";
import ClassIcon from "@mui/icons-material/Class";
import SecurityIcon from "@mui/icons-material/Security";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

// Role-based menu access configuration
const ROLE_ACCESS = {
  // SUPER_ADMIN: Only create admin users + own profile/settings
  SUPER_ADMIN: ["/dashboard", "/users", "/settings", "/profile"],
  // ADMIN: Full system access
  ADMIN: [
    "/dashboard",
    "/users",
    "/roles",
    "/permissions",
    "/branches",
    "/groups",
    "/customers",
    "/customer-documents",
    "/loan-products",
    "/loan-applications",
    "/loans",
    "/collections",
    "/cash-book",
    "/expenses",
    "/income",
    "/loan-reports",
    "/collection-reports",
    "/customer-reports",
    "/settings",
    "/profile",
  ],
  BRANCH_MANAGER: [
    "/dashboard",
    "/branches",
    "/groups",
    "/customers",
    "/customer-documents",
    "/loan-products",
    "/loan-applications",
    "/loans",
    "/collections",
    "/loan-reports",
    "/collection-reports",
    "/customer-reports",
    "/profile",
  ],
  FIELD_OFFICER: [
    "/dashboard",
    "/customers",
    "/customer-documents",
    "/groups",
    "/loan-applications",
    "/collections",
    "/profile",
  ],
  ACCOUNTANT: [
    "/dashboard",
    "/collections",
    "/cash-book",
    "/expenses",
    "/income",
    "/loan-reports",
    "/collection-reports",
    "/customer-reports",
    "/profile",
  ],
  // CUSTOMER: Normal user portal - can manage own account, apply loans, view status
  CUSTOMER: [
    "/customer/dashboard",
    "/customer/profile",
    "/customer/applications",
    "/customer/apply-loan",
    "/customer/loans",
    "/customer/ekyc",
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

  // Customer Portal Menu
  if (userRole === 'CUSTOMER') {
    return [
      {
        section: "Overview",
        items: [
          { 
            title: "Dashboard", 
            icon: DashboardIcon, 
            path: "/customer/dashboard" 
          },
        ],
      },
      {
        section: "My Account",
        items: [
          { 
            title: "Profile", 
            icon: PersonIcon, 
            path: "/customer/profile" 
          },
          { 
            title: "e-KYC Status", 
            icon: VerifiedUserIcon, 
            path: "/customer/ekyc" 
          },
        ],
      },
      {
        section: "Loans",
        items: [
          { 
            title: "My Applications", 
            icon: AssignmentIndIcon, 
            path: "/customer/applications" 
          },
          { 
            title: "Apply for Loan", 
            icon: FolderOpenIcon, 
            path: "/customer/apply-loan" 
          },
          { 
            title: "Active Loans", 
            icon: AccountBalanceWalletIcon, 
            path: "/customer/loans" 
          },
        ],
      },
    ];
  }

  // Admin/Employee Portal Menu
  const menu = [
    {
      section: "Dashboard",
      items: [{ title: "Dashboard", icon: DashboardIcon, path: "/dashboard" }],
    },
    {
      section: "Master",
      items: [
        {
          title: "User Management",
          icon: PeopleIcon,
          children: [
            { title: "Users", path: "/users" },
            { title: "Roles", path: "/roles" },
            { title: "Permissions", path: "/permissions" },
          ],
        },
        {
          title: "Organization",
          icon: ApartmentIcon,
          children: [
            { title: "Branches", path: "/branches" },
            { title: "Groups", path: "/groups" },
          ],
        },
        {
          title: "Customer",
          icon: PersonIcon,
          children: [
            { title: "Customers", path: "/customers" },
            {
              title: "eKYC",
              icon: VerifiedUserIcon,
              path: "/customer-documents",
            },
          ],
        },
      ],
    },
    // FLATTENED: Loans section heading → direct items (no redundant wrapper)
    {
      section: "Loans",
      items: [
        {
          title: "Loan Products",
          icon: AccountBalanceWalletIcon,
          path: "/loan-products",
        },
        {
          title: "Loan Applications",
          icon: AssignmentIndIcon,
          path: "/loan-applications",
        },
        { title: "Loans", icon: BusinessIcon, path: "/loans" },
        {
          title: "Collections",
          icon: ReceiptLongIcon,
          path: "/collections",
        },
      ],
    },
    // FLATTENED: Finance section
    {
      section: "Finance",
      items: [
        { title: "Cash Book", icon: PaidIcon, path: "/cash-book" },
        { title: "Expenses", icon: PaidIcon, path: "/expenses" },
        { title: "Income", icon: PaidIcon, path: "/income" },
      ],
    },
    // FLATTENED: Reports section
    {
      section: "Reports",
      items: [
        { title: "Loan Reports", icon: AssessmentIcon, path: "/loan-reports" },
        {
          title: "Collection Reports",
          icon: AssessmentIcon,
          path: "/collection-reports",
        },
        {
          title: "Customer Reports",
          icon: AssessmentIcon,
          path: "/customer-reports",
        },
      ],
    },
    {
      section: "System",
      items: [{ title: "Settings", icon: SettingsIcon, path: "/settings" }],
    },
  ];

  return menu
    .map((section) => ({
      ...section,
      items: filterItems(section.items),
    }))
    .filter((section) => section.items.length > 0);
}

export default getFilteredMenu;
