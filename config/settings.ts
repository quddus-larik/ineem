export const settings = [
  {
    title: "Account",
    description: "Manage your account settings and set e-mail preferences.",
    menu: [
      {
        title: "Profile",
        description: "Update your photo and personal details.",
        href: "/settings/profile",
      },
      {
        title: "Security",
        description: "Update your password and secure your account.",
        href: "/settings/security",
      },
      {
        title: "Notifications",
        description: "Manage your notification preferences.",
        href: "/settings/notifications",
      },
      {
        title: "Billing",
        description: "Manage your billing information and view invoices.",
        href: "/settings/billing",
      },
    ],
  },
  {
    title: "Appearance",
    description: "Customize the look and feel of your application.",
    menu: [
      {
        title: "Themes",
        description:
          "Choose from a variety of themes to personalize your experience.",
        href: "/settings/themes",
      },
    ],
  },
  {
    title: "Danger Zone",
    description: "Manage your account settings and set e-mail preferences.",
    menu: [
      {
        title: "Delete Account",
        description: "Permanently delete your account and all associated data.",
        href: "/settings/delete-account",
      },
      {
        title: "Deactivate Account",
        description:
          "Temporarily deactivate your account and hide your profile.",
        href: "/settings/deactivate-account",
      },
      {
        title: "Delete Switched Institute",
        description:
          "Permanently delete your switched institute and all associated data.",
        href: "/settings/delete-switched-institute",
      },
    ],
  },
];
