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
    Mail
} from "@mynaui/icons-react";


export function getMenuItems(selected?: string | null) {

    return [
        {icon: Mail, title: "Mails", url: "/emails"},
        {icon: ChatMessages, title: "Assistance", url: "/assistant"},
        {icon: AsteriskOctagon, title: "Automation", url: "/automations"},
        {icon: CheckSquareOne, title: "Tasks", url: "/tasks"},
        {icon: UsersGroup, title: "Contacts", url: "/contacts"},
        // {icon: Ticket, title: "Expenses", url: expensesUrl},
    ];
}
