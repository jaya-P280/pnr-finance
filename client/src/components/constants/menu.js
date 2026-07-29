import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

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
          icon: AccountBalanceWalletIcon,
          path: "/loan-applications",
        },
        { title: "Loans", icon: AccountBalanceWalletIcon, path: "/loans" },
        {
          title: "Collections",
          icon: AccountBalanceWalletIcon,
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
