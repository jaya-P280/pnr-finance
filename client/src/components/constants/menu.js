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
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BusinessIcon from "@mui/icons-material/Business";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

const ROLE_ACCESS = {
  SUPER_ADMIN: ["/users", "/profile", "/settings"],
  ADMIN: [
    "/dashboard",
    "/users",
    "/roles",
    "/permissions",
    "/branches",
    "/customer-documents",
    "/loan-products",
    "/loans",
    "/collections",
    "/cash-book",
    "/expenses",
    "/income",
    "/loan-reports",
    "/collection-reports",
    "/customer-reports",
    "/profile",
    "/settings",
  ],
  BRANCH_MANAGER: [
    "/dashboard",
    "/groups",
    "/customers",
    "/customer-documents",
    "/loan-products",
    "/loans",
    "/collections",
    "/loan-reports",
    "/collection-reports",
    "/customer-reports",
    "/profile",
    "/settings",
  ],
  FIELD_OFFICER: [
    "/dashboard",
    "/customers",
    "/customer-documents",
    "/groups",
    "/loan-applications",
    "/collections",
    "/profile",
    "/settings",
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
  CUSTOMER: [
    "/customer/dashboard",
    "/customer/profile",
    "/customer/applications",
    "/customer/apply-loan",
    "/customer/loans",
    "/customer/ekyc",
    "/customer/settings",
  ],
};

export function getFilteredMenu(userRole) {
  const allowedPaths = ROLE_ACCESS[userRole] || ROLE_ACCESS.FIELD_OFFICER;

  function filterItems(items) {
    return items
      .map((item) => {
        if (!item.children) return item;

        return {
          ...item,
          children: filterItems(item.children),
        };
      })
      .filter((item) => {
      if (item.children) {
        return item.children.length > 0;
      }
      return item.path ? allowedPaths.includes(item.path) : true;
      });
  }

  if (userRole === "SUPER_ADMIN") {
    return [
      {
        section: "Administration",
        items: [
          {
            title: "Users",
            icon: PeopleIcon,
            path: "/users",
          },
        ],
      },
      {
        section: "My Account",
        items: [
          {
            title: "My Profile",
            icon: PersonIcon,
            path: "/profile",
          },
          {
            title: "Settings",
            icon: SettingsIcon,
            path: "/settings",
          },
        ],
      },
    ];
  }

  if (userRole === "CUSTOMER") {
    return [
      {
        section: "Overview",
        items: [
          {
            title: "Dashboard",
            icon: DashboardIcon,
            path: "/customer/dashboard",
          },
        ],
      },
      {
        section: "My Account",
        items: [
          {
            title: "Profile",
            icon: PersonIcon,
            path: "/customer/profile",
          },
          {
            title: "e-KYC Status",
            icon: VerifiedUserIcon,
            path: "/customer/ekyc",
          },
          {
            title: "Settings",
            icon: SettingsIcon,
            path: "/customer/settings",
          },
        ],
      },
      {
        section: "Loans",
        items: [
          {
            title: "My Applications",
            icon: AssignmentIndIcon,
            path: "/customer/applications",
          },
          {
            title: "Apply for Loan",
            icon: FolderOpenIcon,
            path: "/customer/apply-loan",
          },
          {
            title: "Active Loans",
            icon: AccountBalanceWalletIcon,
            path: "/customer/loans",
          },
        ],
      },
    ];
  }

  const menu = [
    {
      section: "Dashboard",
      items: [
        {
          title: "Dashboard",
          icon: DashboardIcon,
          path: "/dashboard",
        },
      ],
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
          title: "Groups & Branches",
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
            { title: "eKYC Verification", path: "/customer-documents" },
          ],
        },
      ],
    },
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
        {
          title: "Loans",
          icon: BusinessIcon,
          path: "/loans",
        },
        {
          title: "Collections",
          icon: ReceiptLongIcon,
          path: "/collections",
        },
      ],
    },
    {
      section: "Finance",
      items: [
        {
          title: "Cash Book",
          icon: PaidIcon,
          path: "/cash-book",
        },
        {
          title: "Expenses",
          icon: PaidIcon,
          path: "/expenses",
        },
        {
          title: "Income",
          icon: PaidIcon,
          path: "/income",
        },
      ],
    },
    {
      section: "Reports",
      items: [
        {
          title: "Loan Reports",
          icon: AssessmentIcon,
          path: "/loan-reports",
        },
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
      section: "My Account",
      items: [
        {
          title: "My Profile",
          icon: PersonIcon,
          path: "/profile",
        },
        {
          title: "Settings",
          icon: SettingsIcon,
          path: "/settings",
        },
      ],
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
