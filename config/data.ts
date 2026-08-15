import {
  Book,
  BuildingOne,
  Grid,
  Ticket,
  UsersGroup,
  ChatMessages,
  Api,
  AsteriskOctagon,
  CheckSquareOne,
  Mail,
  Album,
  Box,
  LineChartSquare
} from "@mynaui/icons-react";


export function getMenuItems(selected?: string | null) {

  return [
    { icon: ChatMessages, title: "Assistance", url: "/assistant" },
    { icon: Album, title: "Repositories", url: "/repositories" },
    // { icon: AsteriskOctagon, title: "Automation", url: "/automations" },
    { icon: Box, title: "Activity", url: "/packages" },
    { icon: LineChartSquare, title: "Insights", url: "/insights" },
    // {icon: Ticket, title: "Expenses", url: expensesUrl},
  ];
}
