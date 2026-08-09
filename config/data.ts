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
    const subjectsUrl = selected
        ? `/institutes/${selected}/subjects`
        : "/institutes";
    const instituteUrl = selected ? `/institutes/${selected}` : "/institutes";
    const classesUrl = selected
        ? `/institutes/${selected}/classes`
        : "/institutes";
    const studentsUrl = selected
        ? `/institutes/${selected}/students`
        : "/institutes";
    const expensesUrl = selected
        ? `/institutes/${selected}/expense`
        : "/institutes";
    const attendanceUrl = selected
        ? `/institutes/${selected}/attendance`
        : "/institutes";

    return [
        {icon: Mail, title: "Mails", url: "/emails"},
        {icon: ChatMessages, title: "Assistance", url: "/assistant"},
        {icon: AsteriskOctagon, title: "Automation", url: "/automations"},
        {icon: CheckSquareOne, title: "Tasks", url: "/tasks"},
        {icon: UsersGroup, title: "Contacts", url: "/contacts"},
        // {icon: Ticket, title: "Expenses", url: expensesUrl},
    ];
}

export function getExpenseClassUrl(instituteSlug: string, classSlug: string) {
    return `/institutes/${instituteSlug}/expense/${classSlug}`;
}
