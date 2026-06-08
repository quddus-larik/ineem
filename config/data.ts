export type InvoiceItem = {
  id: string;
  name: string;
  fallback: string;
  invoice: string;
  amount: string;
  due: string;
};

export type InvoiceRowProps = {
  item?: InvoiceItem;
  onPress?: () => void;
  showDivider?: boolean;
};

export type InvoiceGroup = "Overdue" | "Viewed";

export const OVERDUE_DATA: InvoiceItem[] = [
  {
    id: "1",
    name: "Akram",
    fallback: "AK",
    invoice: "#100024",
    amount: "$295",
    due: "Due 15 days ago",
  },
  {
    id: "2",
    name: "Rehan",
    fallback: "RH",
    invoice: "#100023",
    amount: "$290",
    due: "Due 15 days ago",
  },
  {
    id: "3",
    name: "Sara",
    fallback: "SA",
    invoice: "#100022",
    amount: "$150",
    due: "Due 20 days ago",
  },
];

export const VIEWED_DATA: InvoiceItem[] = [
  {
    id: "1",
    name: "Akram",
    fallback: "AK",
    invoice: "#100024",
    amount: "$295",
    due: "Due 15 days ago",
  },
  {
    id: "2",
    name: "Rehan",
    fallback: "RH",
    invoice: "#100023",
    amount: "$290",
    due: "Due 15 days ago",
  },
  {
    id: "3",
    name: "Ali",
    fallback: "AL",
    invoice: "#100021",
    amount: "$420",
    due: "Due in 2 days",
  },
  {
    id: "4",
    name: "Zain",
    fallback: "ZN",
    invoice: "#100020",
    amount: "$110",
    due: "Due in 5 days",
  },
  {
    id: "5",
    name: "Sana",
    fallback: "SN",
    invoice: "#100019",
    amount: "$350",
    due: "Due in 6 days",
  },
  {
    id: "6",
    name: "Umer",
    fallback: "UM",
    invoice: "#100018",
    amount: "$95",
    due: "Due in 7 days",
  },
  {
    id: "7",
    name: "Hamza",
    fallback: "HZ",
    invoice: "#100017",
    amount: "$ Rail",
    due: "Due in 12 days",
  },
  {
    id: "8",
    name: "Bilal",
    fallback: "BL",
    invoice: "#100016",
    amount: "$210",
    due: "Due in 14 days",
  },
];

export function getInvoiceById(id: string | number){
  const result = VIEWED_DATA.filter((item)=> item.id === id);

  return result;
}