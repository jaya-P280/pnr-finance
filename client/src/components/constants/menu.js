import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonIcon from "@mui/icons-material/Person";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DescriptionIcon from "@mui/icons-material/Description";
import PaidIcon from "@mui/icons-material/Paid";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

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
          {
            title: "Users",

            path: "/users",
          },

          {
            title: "Roles",

            path: "/roles",
          },

          {
            title: "Permissions",

            path: "/permissions",
          },
        ],
      },

      {
        title: "Organization",

        icon: ApartmentIcon,

        children: [
          {
            title: "Branches",

            path: "/branches",
          },

          {
            title: "Groups",

            path: "/groups",
          },
        ],
      },

      {
        title: "Customer",

        icon: PersonIcon,

        children: [
          {
            title: "Customers",

            path: "/customers",
          },

          {
            title: "Documents",

            path: "/customer-documents",
          },
        ],
      },
    ],
  },

  {
    section: "Loans",

    items: [
      {
        title: "Loan Management",

        icon: AccountBalanceWalletIcon,

        children: [
          {
            title: "Loan Products",

            path: "/loan-products",
          },

          {
            title: "Loan Applications",

            path: "/loan-applications",
          },

          {
            title: "Loans",

            path: "/loans",
          },

          {
            title: "Collections",

            path: "/collections",
          },
        ],
      },
    ],
  },

  {
    section: "Finance",

    items: [
      {
        title: "Accounting",

        icon: PaidIcon,

        children: [
          {
            title: "Cash Book",

            path: "/cash-book",
          },

          {
            title: "Expenses",

            path: "/expenses",
          },

          {
            title: "Income",

            path: "/income",
          },
        ],
      },
    ],
  },

  {
    section: "Reports",

    items: [
      {
        title: "Reports",

        icon: AssessmentIcon,

        children: [
          {
            title: "Loan Reports",

            path: "/loan-reports",
          },

          {
            title: "Collection Reports",

            path: "/collection-reports",
          },

          {
            title: "Customer Reports",

            path: "/customer-reports",
          },
        ],
      },
    ],
  },

  {
    section: "System",

    items: [
      {
        title: "Settings",

        icon: SettingsIcon,

        path: "/settings",
      },
    ],
  },
];

export default menu;
