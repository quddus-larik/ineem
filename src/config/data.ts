export type InvoiceGroup = "Overdue" | "Viewed";

export type InvoiceItem = {
  id: string;
  name: string;
  fallback: string;
  invoice: string;
  amount: string;
  due: string;
  group: InvoiceGroup;
  status: string;
  email: string;
  company: string;
  description: string;
};

export type InvoiceRowProps = {
  item: InvoiceItem;
  onPress?: () => void;
  showDivider?: boolean;
};

export const OVERDUE_DATA: InvoiceItem[] = [
  {
    id: "overdue-akram-100024",
    name: "Akram",
    fallback: "AK",
    invoice: "#100024",
    amount: "$295",
    due: "Due 15 days ago",
    group: "Overdue",
    status: "Overdue",
    email: "akram@company.com",
    company: "Northstar Labs",
    description: "Payment reminder sent twice with no response yet.",
  },
  {
    id: "overdue-rehan-100023",
    name: "Rehan",
    fallback: "RH",
    invoice: "#100023",
    amount: "$290",
    due: "Due 15 days ago",
    group: "Overdue",
    status: "Overdue",
    email: "rehan@company.com",
    company: "Atlas Studio",
    description: "Outstanding balance pending approval from finance.",
  },
  {
    id: "overdue-sara-100022",
    name: "Sara",
    fallback: "SA",
    invoice: "#100022",
    amount: "$150",
    due: "Due 20 days ago",
    group: "Overdue",
    status: "Overdue",
    email: "sara@company.com",
    company: "Blueleaf Partners",
    description: "Awaiting payment after the final billing cycle.",
  },
];

export const VIEWED_DATA: InvoiceItem[] = [
  {
    id: "viewed-akram-100024",
    name: "Akram",
    fallback: "AK",
    invoice: "#100024",
    amount: "$295",
    due: "Due 15 days ago",
    group: "Viewed",
    status: "Viewed",
    email: "akram@company.com",
    company: "Northstar Labs",
    description: "Invoice opened yesterday and viewed from mobile.",
  },
  {
    id: "viewed-rehan-100023",
    name: "Rehan",
    fallback: "RH",
    invoice: "#100023",
    amount: "$290",
    due: "Due 15 days ago",
    group: "Viewed",
    status: "Viewed",
    email: "rehan@company.com",
    company: "Atlas Studio",
    description: "Recently reviewed by the customer success team.",
  },
  {
    id: "viewed-ali-100021",
    name: "Ali",
    fallback: "AL",
    invoice: "#100021",
    amount: "$420",
    due: "Due in 2 days",
    group: "Viewed",
    status: "Viewed",
    email: "ali@company.com",
    company: "Mosaic Health",
    description: "Confirmed receipt and asked for a copy of the receipt.",
  },
  {
    id: "viewed-zain-100020",
    name: "Zain",
    fallback: "ZN",
    invoice: "#100020",
    amount: "$110",
    due: "Due in 5 days",
    group: "Viewed",
    status: "Viewed",
    email: "zain@company.com",
    company: "Elevate Commerce",
    description: "Opened invoice from the latest billing email.",
  },
  {
    id: "viewed-sana-100019",
    name: "Sana",
    fallback: "SN",
    invoice: "#100019",
    amount: "$350",
    due: "Due in 6 days",
    group: "Viewed",
    status: "Viewed",
    email: "sana@company.com",
    company: "Harbor Digital",
    description: "Viewed before a payment discussion with the finance team.",
  },
  {
    id: "viewed-umer-100018",
    name: "Umer",
    fallback: "UM",
    invoice: "#100018",
    amount: "$95",
    due: "Due in 7 days",
    group: "Viewed",
    status: "Viewed",
    email: "umer@company.com",
    company: "Northwind Builders",
    description: "Opened from the shared billing link.",
  },
  {
    id: "viewed-hamza-100017",
    name: "Hamza",
    fallback: "HZ",
    invoice: "#100017",
    amount: "$75",
    due: "Due in 12 days",
    group: "Viewed",
    status: "Viewed",
    email: "hamza@company.com",
    company: "Peak Commerce",
    description: "Viewed from the last monthly statement.",
  },
  {
    id: "viewed-bilal-100016",
    name: "Bilal",
    fallback: "BL",
    invoice: "#100016",
    amount: "$210",
    due: "Due in 14 days",
    group: "Viewed",
    status: "Viewed",
    email: "bilal@company.com",
    company: "Meridian Works",
    description: "Recently checked while reconciling accounts.",
  },
];

export const ALL_INVOICES = [...OVERDUE_DATA, ...VIEWED_DATA];

export const getInvoiceById = (id: string) =>
  ALL_INVOICES.find((invoice) => invoice.id === id);
