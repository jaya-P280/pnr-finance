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
import AssignmentIcon from "@mui/icons-material/Assignment";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import DescriptionIcon from "@mui/icons-material/Description";

export const ROLE_ACCESS = {
  SUPER_ADMIN: [
    "/dashboard",
    "/users",
    "/profile",
  ],
  ADMIN: [
    "/dashboard",
    "/users",
    "/branches",
    "/customers",
    "/groups",
    "/customer-documents",
    "/roles",
    "/permissions",
    "/audit-logs",
    "/loan-products",
    "/loan-applications",
    "/loans",
    "/collections",
    "/cash-book",
    "/cashbook",
    "/expenses",
    "/income",
    "/loan-reports",
    "/collection-reports",
    "/customer-reports",
    "/profile",
    "/settings",
    "/tasks",
    "/attendance",
    "/letters",
    "/salary",
    "/customer/dashboard",
    "/customer/profile",
    "/customer/applications",
    "/customer/apply-loan",
    "/customer/loans",
    "/customer/ekyc",
    "/customer/settings",
  ],
  BRANCH_MANAGER: [
    "/dashboard",
    "/customers",
    "/groups",
    "/users",
    "/customer-documents",
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
    "/tasks",
    "/customers",
    "/groups",
    "/customer-documents",
    "/loan-applications",
    "/loans",
    "/collections",
    "/profile",
  ],
  ACCOUNTANT: [
    "/dashboard",
    "/cash-book",
    "/cashbook",
    "/expenses",
    "/income",
    "/collections",
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

export function getFilteredMenu(rawRole) {
  const userRole = (rawRole || "").toUpperCase().replace(/\s+/g, "_");

  if (userRole === "SUPER_ADMIN") {
    return [
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
        section: "Administration",
        items: [
          {
            title: "Administrator Management",
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
    ];
  }

  if (userRole === "ACCOUNTANT") {
    return [
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
        section: "Finance & Accounts",
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
          {
            title: "Collections",
            icon: ReceiptLongIcon,
            path: "/collections",
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
        ],
      },
    ];
  }

  if (userRole === "FIELD_OFFICER") {
    return [
      {
        section: "Dashboard",
        items: [
          {
            title: "Dashboard",
            icon: DashboardIcon,
            path: "/dashboard",
          },
          {
            title: "Field Tasks",
            icon: AssignmentIcon,
            path: "/tasks",
          },
        ],
      },
      {
        section: "Operations",
        items: [
          {
            title: "Assigned Customers",
            icon: PersonIcon,
            path: "/customers",
          },
          {
            title: "Assigned Groups",
            icon: ApartmentIcon,
            path: "/groups",
          },
          {
            title: "Customer Documents",
            icon: VerifiedUserIcon,
            path: "/customer-documents",
          },
        ],
      },
      {
        section: "Loans & Collections",
        items: [
          {
            title: "Loan Applications",
            icon: AssignmentIndIcon,
            path: "/loan-applications",
          },
          {
            title: "Active Loans",
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
        section: "My Account",
        items: [
          {
            title: "My Profile",
            icon: PersonIcon,
            path: "/profile",
          },
        ],
      },
    ];
  }

  if (userRole === "BRANCH_MANAGER") {
    return [
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
        section: "Branch Operations",
        items: [
          {
            title: "Branch Staff",
            icon: PeopleIcon,
            path: "/users",
          },
          {
            title: "Customers",
            icon: PersonIcon,
            path: "/customers",
          },
          {
            title: "Customer Groups",
            icon: ApartmentIcon,
            path: "/groups",
          },
          {
            title: "eKYC Verification",
            icon: VerifiedUserIcon,
            path: "/customer-documents",
          },
        ],
      },
      {
        section: "Loans & Collections",
        items: [
          {
            title: "Loan Applications",
            icon: AssignmentIndIcon,
            path: "/loan-applications",
          },
          {
            title: "Active Loans",
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
        ],
      },
    ];
  }

  // DEFAULT FOR ADMIN
  return [
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
      section: "Master & Operations",
      items: [
        {
          title: "Branches",
          icon: ApartmentIcon,
          path: "/branches",
        },
        {
          title: "Customers",
          icon: PersonIcon,
          path: "/customers",
        },
        {
          title: "Customer Groups",
          icon: ApartmentIcon,
          path: "/groups",
        },
        {
          title: "eKYC Verification",
          icon: VerifiedUserIcon,
          path: "/customer-documents",
        },
      ],
    },
    {
      section: "HR & Employee Management",
      items: [
        {
          title: "Employee Staff Users",
          icon: PeopleIcon,
          path: "/users",
        },
        {
          title: "Employee Attendance",
          icon: FingerprintIcon,
          path: "/attendance",
        },
        {
          title: "Employee Letters",
          icon: DescriptionIcon,
          path: "/letters",
        },
        {
          title: "Salary & Payroll",
          icon: PaidIcon,
          path: "/salary",
        },
        {
          title: "System Roles",
          icon: ShieldIcon,
          path: "/roles",
        },
        {
          title: "System Permissions",
          icon: LockIcon,
          path: "/permissions",
        },
        {
          title: "Audit Logs",
          icon: AssignmentIcon,
          path: "/audit-logs",
        },
      ],
    },
    {
      section: "Loan Operations",
      items: [
        {
          title: "Loan Products & Schemes",
          icon: AccountBalanceWalletIcon,
          path: "/loan-products",
        },
        {
          title: "Loan Applications",
          icon: AssignmentIndIcon,
          path: "/loan-applications",
        },
        {
          title: "Active Loans",
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
      section: "Finance & Accounts",
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
      section: "Reports & Analytics",
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
}

export default getFilteredMenu;
