import {
  Book,
  BuildingOne,
  Grid,
  Ticket,
  UsersGroup,
} from "@mynaui/icons-react";

export const InstituteMembers: {
  id: number;
  name: string;
  role: "admin" | "staff" | "crew";
  email: string;
}[] = [
  {
    id: 1,
    name: "John Smith",
    role: "admin",
    email: "john.smith@institute.com",
  },
  {
    id: 2,
    name: "Kate Moore",
    role: "admin",
    email: "kate.moore@institute.com",
  },
  {
    id: 3,
    name: "Alex Johnson",
    role: "staff",
    email: "alex.johnson@institute.com",
  },
  {
    id: 4,
    name: "Sarah Davis",
    role: "staff",
    email: "sarah.davis@institute.com",
  },
  {
    id: 5,
    name: "Mike Wilson",
    role: "crew",
    email: "mike.wilson@institute.com",
  },
  {
    id: 6,
    name: "Lisa Brown",
    role: "crew",
    email: "lisa.brown@institute.com",
  },
  {
    id: 7,
    name: "David Lee",
    role: "staff",
    email: "david.lee@institute.com",
  },
  {
    id: 8,
    name: "Emma Garcia",
    role: "admin",
    email: "emma.garcia@institute.com",
  },
];

export const Tasks: {
  id: number;
  assignees: number[]; // references InstituteMembers ids
  title: string;
  description: string;
  status: string;
}[] = [
  {
    id: 1,
    assignees: [1, 3, 4],
    title: "Attend Test",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse laudantium vel harum sunt, quasi sequi asperiores qui suscipit.",
    status: "done",
  },
  {
    id: 2,
    assignees: [2, 7],
    title: "Review Course Materials",
    description:
      "Prepare and review all course materials for upcoming semester. Coordinate with admin team for distribution.",
    status: "none",
  },
  {
    id: 3,
    assignees: [5, 6],
    title: "Setup Classroom Equipment",
    description:
      "Install projectors, computers, and audio systems in all classrooms. Test connectivity and functionality.",
    status: "done",
  },
  {
    id: 4,
    assignees: [1, 8],
    title: "Student Registration Portal",
    description:
      "Deploy updated registration portal with improved UX. Includes payment integration and document upload.",
    status: "done",
  },
  {
    id: 5,
    assignees: [3],
    title: "Weekly Progress Report",
    description:
      "Compile weekly progress reports for all departments. Include metrics, achievements, and upcoming milestones.",
    status: "none",
  },
  {
    id: 6,
    assignees: [4, 6],
    title: "Library Inventory Audit",
    description:
      "Conduct full inventory audit of library resources. Update catalog system and identify missing items.",
    status: "done",
  },
  {
    id: 7,
    assignees: [2, 5, 7],
    title: "Faculty Training Workshop",
    description:
      "Organize 2-day workshop on new LMS platform. Cover admin features, grading, and student communication.",
    status: "none",
  },
  {
    id: 8,
    assignees: [8],
    title: "Budget Planning Q2",
    description:
      "Prepare Q2 budget proposal including staff salaries, equipment purchases, and facility maintenance.",
    status: "none",
  },
];

export const Students: {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  age: number;
  class_id: number;
  attendancePresent: number;
  attendanceTotal: number;
  joinedAt: string;
}[] = [
  {
    id: 1,
    slug: "alex-walker-1",
    firstName: "Alex",
    lastName: "Walker",
    age: 12,
    class_id: 4,
    attendancePresent: 124,
    attendanceTotal: 360,
    joinedAt: "2026-07-21",
  },
  {
    id: 2,
    slug: "sara-hughes-2",
    firstName: "Sara",
    lastName: "Hughes",
    age: 13,
    class_id: 3,
    attendancePresent: 302,
    attendanceTotal: 360,
    joinedAt: "2026-06-18",
  },
  {
    id: 3,
    slug: "noah-khan-3",
    firstName: "Noah",
    lastName: "Khan",
    age: 11,
    class_id: 1,
    attendancePresent: 336,
    attendanceTotal: 360,
    joinedAt: "2026-08-04",
  },
  {
    id: 4,
    slug: "emily-reed-4",
    firstName: "Emily",
    lastName: "Reed",
    age: 14,
    class_id: 4,
    attendancePresent: 190,
    attendanceTotal: 360,
    joinedAt: "2026-05-29",
  },
  {
    id: 5,
    slug: "omar-farooq-5",
    firstName: "Omar",
    lastName: "Farooq",
    age: 12,
    class_id: 2,
    attendancePresent: 348,
    attendanceTotal: 360,
    joinedAt: "2026-03-11",
  },
  {
    id: 6,
    slug: "lina-ashraf-6",
    firstName: "Lina",
    lastName: "Ashraf",
    age: 13,
    class_id: 3,
    attendancePresent: 274,
    attendanceTotal: 360,
    joinedAt: "2026-02-22",
  },
  {
    id: 7,
    slug: "adam-cole-7",
    firstName: "Adam",
    lastName: "Cole",
    age: 11,
    class_id: 1,
    attendancePresent: 158,
    attendanceTotal: 360,
    joinedAt: "2026-09-01",
  },
  {
    id: 8,
    slug: "maya-iqbal-8",
    firstName: "Maya",
    lastName: "Iqbal",
    age: 12,
    class_id: 4,
    attendancePresent: 320,
    attendanceTotal: 360,
    joinedAt: "2026-01-15",
  },
  {
    id: 9,
    slug: "ibrahim-shah-9",
    firstName: "Ibrahim",
    lastName: "Shah",
    age: 12,
    class_id: 2,
    attendancePresent: 301,
    attendanceTotal: 360,
    joinedAt: "2026-04-12",
  },
  {
    id: 10,
    slug: "zara-nadeem-10",
    firstName: "Zara",
    lastName: "Nadeem",
    age: 11,
    class_id: 1,
    attendancePresent: 284,
    attendanceTotal: 360,
    joinedAt: "2026-03-28",
  },
  {
    id: 11,
    slug: "hamza-ali-11",
    firstName: "Hamza",
    lastName: "Ali",
    age: 13,
    class_id: 3,
    attendancePresent: 332,
    attendanceTotal: 360,
    joinedAt: "2026-01-22",
  },
  {
    id: 12,
    slug: "aisha-raza-12",
    firstName: "Aisha",
    lastName: "Raza",
    age: 14,
    class_id: 4,
    attendancePresent: 341,
    attendanceTotal: 360,
    joinedAt: "2026-02-14",
  },
  {
    id: 13,
    slug: "bilal-sheikh-13",
    firstName: "Bilal",
    lastName: "Sheikh",
    age: 12,
    class_id: 2,
    attendancePresent: 268,
    attendanceTotal: 360,
    joinedAt: "2026-05-06",
  },
  {
    id: 14,
    slug: "fatima-yousaf-14",
    firstName: "Fatima",
    lastName: "Yousaf",
    age: 11,
    class_id: 1,
    attendancePresent: 315,
    attendanceTotal: 360,
    joinedAt: "2026-04-19",
  },
  {
    id: 15,
    slug: "rehan-kazmi-15",
    firstName: "Rehan",
    lastName: "Kazmi",
    age: 13,
    class_id: 3,
    attendancePresent: 287,
    attendanceTotal: 360,
    joinedAt: "2026-06-02",
  },
  {
    id: 16,
    slug: "hina-javed-16",
    firstName: "Hina",
    lastName: "Javed",
    age: 14,
    class_id: 4,
    attendancePresent: 254,
    attendanceTotal: 360,
    joinedAt: "2026-07-08",
  },
  {
    id: 17,
    slug: "saad-majeed-17",
    firstName: "Saad",
    lastName: "Majeed",
    age: 12,
    class_id: 5,
    attendancePresent: 229,
    attendanceTotal: 360,
    joinedAt: "2026-08-10",
  },
  {
    id: 18,
    slug: "kiran-zafar-18",
    firstName: "Kiran",
    lastName: "Zafar",
    age: 13,
    class_id: 5,
    attendancePresent: 309,
    attendanceTotal: 360,
    joinedAt: "2026-03-03",
  },
  {
    id: 19,
    slug: "danish-akram-19",
    firstName: "Danish",
    lastName: "Akram",
    age: 12,
    class_id: 5,
    attendancePresent: 172,
    attendanceTotal: 360,
    joinedAt: "2026-09-14",
  },
  {
    id: 20,
    slug: "nida-qasim-20",
    firstName: "Nida",
    lastName: "Qasim",
    age: 14,
    class_id: 6,
    attendancePresent: 333,
    attendanceTotal: 360,
    joinedAt: "2026-01-30",
  },
  {
    id: 21,
    slug: "yaseen-siddiqi-21",
    firstName: "Yaseen",
    lastName: "Siddiqi",
    age: 13,
    class_id: 6,
    attendancePresent: 297,
    attendanceTotal: 360,
    joinedAt: "2026-05-20",
  },
];

export const Classes: {
  id: number;
  slug: string;
  code: string;
  title: string;
  description: string;
  students: number[];
  subjects: number[];
}[] = [
  {
    id: 1,
    slug: "ssc-ii-1",
    code: "SSC-II",
    title: "Secondary School Certificate II",
    description: "Final-year SSC class with focus on board exam preparation.",
    students: [3, 7, 10, 14],
    subjects: [1, 2, 3, 6, 7, 8],
  },
  {
    id: 2,
    slug: "ssc-i-2",
    code: "SSC-I",
    title: "Secondary School Certificate I",
    description: "Core SSC curriculum for first-year secondary students.",
    students: [5, 9, 13],
    subjects: [1, 2, 3, 7, 8],
  },
  {
    id: 3,
    slug: "hssc-i-3",
    code: "HSSC-I",
    title: "Higher Secondary School Certificate I",
    description: "Intermediate first-year class with science and commerce tracks.",
    students: [2, 6, 11, 15],
    subjects: [3, 4, 5],
  },
  {
    id: 4,
    slug: "hssc-ii-4",
    code: "HSSC-II",
    title: "Higher Secondary School Certificate II",
    description: "Intermediate final-year class focused on entry tests and boards.",
    students: [1, 4, 8, 12, 16],
    subjects: [1, 2, 3, 4, 5, 6, 8],
  },
  {
    id: 5,
    slug: "cs-found-5",
    code: "CS-FOUND",
    title: "Computer Science Foundation",
    description: "Skill-focused class for programming basics and digital literacy.",
    students: [17, 18, 19],
    subjects: [1, 2, 6],
  },
  {
    id: 6,
    slug: "math-adv-6",
    code: "MATH-ADV",
    title: "Advanced Mathematics",
    description: "Higher-level mathematics class for competitive exams.",
    students: [20, 21],
    subjects: [3],
  },
];

export const organizations = [
  {
    id: 1,
    name: "Acme Inc",
    description: "A computer science research company",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlhthkE1qWPdzA3HWzdIifMnqqtuwEY_47Bw&s",
    website: "https://acme.com",
    category: "Information Technology",
    location: "Islamabad, G-11",
  },
  {
    id: 2,
    name: "TechNova",
    logo: "https://cdn.dribbble.com/userupload/26694182/file/original-dc8c625e7aadcaec7cc34cd02b6ea171.jpg?format=webp&resize=400x300&vertical=center",
    description: "AI and cloud solutions",
    website: "https://technova.com",
    category: "Artificial Intelligence",
    location: "Islamabad, G-11",
  },
  {
    id: 3,
    name: "DevHub",
    logo: "https://cdn.dribbble.com/userupload/43761307/file/original-720c2a63362bf463692b662538e1bf78.png?format=webp&resize=400x300&vertical=center",
    description: "Developer community and tools",
    website: "https://devhub.com",
    category: "Software",
    location: "Islamabad, G-11",
  },
  {
    id: 4,
    logo: "https://images-platform.99static.com//7wYjfbypjySr9H_-VguhTcjPukg=/720x1171:1223x1674/fit-in/500x500/99designs-contests-attachments/115/115106/attachment_115106589",
    name: "InnoSoft",
    description: "Startup building SaaS products",
    website: "https://innosoft.com",
    category: "SaaS",
    location: "Islamabad, G-11",
  },
];

export const Subjects = [
  {
    id: 1,
    slug: "eng-123",
    code: "ENG",
    title: "English",
    description: "Skill-focused class for english language basics and its grammar literacy.",
    marks: {
      theory: 65,
      practical: 0,
      total: 75,
    },
    classes: [1, 2, 4, 5],
  },
  {
    id: 2,
    slug: "urdu-123",
    code: "URDU",
    title: "Urdu",
    description: "Skill-focused class for Urdu language basics and its grammar literacy.",
    marks: {
      theory: 65,
      practical: 0,
      total: 75,
    },
    classes: [1, 2, 4, 5],
  },
  {
    id: 3,
    slug: "math-123",
    code: "MATH",
    title: "Mathematics",
    description: "Core subject for algebra, calculus, and geometry.",
    marks: {
      theory: 100,
      practical: 0,
      total: 100,
    },
    classes: [1, 2, 3, 4, 6],
  },
  {
    id: 4,
    slug: "phy-123",
    code: "PHY",
    title: "Physics",
    description: "Science subject covering mechanics, electromagnetism, and modern physics.",
    marks: {
      theory: 85,
      practical: 15,
      total: 100,
    },
    classes: [3, 4],
  },
  {
    id: 5,
    slug: "chem-123",
    code: "CHEM",
    title: "Chemistry",
    description: "Science subject covering organic, inorganic, and physical chemistry.",
    marks: {
      theory: 85,
      practical: 15,
      total: 100,
    },
    classes: [3, 4],
  },
  {
    id: 6,
    slug: "cs-123",
    code: "CS",
    title: "Computer Science",
    description: "Skill-focused class for programming basics and digital literacy.",
    marks: {
      theory: 65,
      practical: 10,
      total: 75,
    },
    classes: [1, 4, 5],
  },
  {
    id: 7,
    slug: "bio-123",
    code: "BIO",
    title: "Biology",
    description: "Science subject for life sciences and botany.",
    marks: {
      theory: 65,
      practical: 10,
      total: 75,
    },
    classes: [1, 2],
    optional: true,
  },
  {
    id: 8,
    slug: "pkst-123",
    code: "PKST",
    title: "Pakistan Studies",
    description: "Subject on history, geography, and culture of Pakistan.",
    marks: {
      theory: 50,
      practical: 0,
      total: 50,
    },
    classes: [1, 2, 4],
  },
];

export const Schedule: {
  id: number;
  class_id: number;
  subjects_sched: {
    id: number;
    subject_id: number;
    assign_to: number;
    time_from: string;
    time_to: string;
  }[];
}[] = [
  {
    id: 1,
    class_id: 1,
    subjects_sched: [
      { id: 1, subject_id: 1, assign_to: 1, time_from: "08:00", time_to: "09:00" },
      { id: 2, subject_id: 2, assign_to: 2, time_from: "09:00", time_to: "10:00" },
      { id: 3, subject_id: 3, assign_to: 3, time_from: "10:15", time_to: "11:15" },
      { id: 4, subject_id: 6, assign_to: 4, time_from: "11:15", time_to: "12:15" },
      { id: 5, subject_id: 8, assign_to: 5, time_from: "13:00", time_to: "14:00" },
      { id: 6, subject_id: 7, assign_to: 6, time_from: "14:00", time_to: "15:00" },
    ],
  },
  {
    id: 2,
    class_id: 2,
    subjects_sched: [
      { id: 1, subject_id: 1, assign_to: 1, time_from: "08:00", time_to: "09:00" },
      { id: 2, subject_id: 2, assign_to: 2, time_from: "09:00", time_to: "10:00" },
      { id: 3, subject_id: 3, assign_to: 3, time_from: "10:15", time_to: "11:15" },
      { id: 4, subject_id: 8, assign_to: 4, time_from: "11:15", time_to: "12:15" },
      { id: 5, subject_id: 7, assign_to: 5, time_from: "13:00", time_to: "14:00" },
    ],
  },
  {
    id: 3,
    class_id: 3,
    subjects_sched: [
      { id: 1, subject_id: 3, assign_to: 1, time_from: "08:00", time_to: "09:30" },
      { id: 2, subject_id: 1, assign_to: 2, time_from: "09:30", time_to: "11:00" },
      { id: 3, subject_id: 2, assign_to: 3, time_from: "11:15", time_to: "12:45" },
      { id: 4, subject_id: 4, assign_to: 4, time_from: "12:45", time_to: "14:15" },
      { id: 5, subject_id: 5, assign_to: 5, time_from: "15:00", time_to: "16:30" },
    ],
  },
  {
    id: 4,
    class_id: 4,
    subjects_sched: [
      { id: 1, subject_id: 3, assign_to: 1, time_from: "08:00", time_to: "09:30" },
      { id: 2, subject_id: 1, assign_to: 2, time_from: "09:30", time_to: "11:00" },
      { id: 3, subject_id: 2, assign_to: 3, time_from: "11:15", time_to: "12:45" },
      { id: 4, subject_id: 4, assign_to: 4, time_from: "12:45", time_to: "14:15" },
      { id: 5, subject_id: 5, assign_to: 5, time_from: "15:00", time_to: "16:30" },
      { id: 6, subject_id: 6, assign_to: 6, time_from: "16:30", time_to: "18:00" },
      { id: 7, subject_id: 8, assign_to: 7, time_from: "08:00", time_to: "09:00" },
    ],
  },
];

export const Expenses: {
  id: number;
  class_id: number;
  student_id: number;
  amount: number;
  type: "educational" | "events" | "pick-and-drop";
  isPaid: boolean;
  date: string;
}[] = [
  { id: 1, class_id: 1, student_id: 3, amount: 15000, type: "educational", isPaid: true, date: "2026-01-15" },
  { id: 2, class_id: 1, student_id: 7, amount: 15000, type: "educational", isPaid: false, date: "" },
  { id: 3, class_id: 2, student_id: 5, amount: 12000, type: "educational", isPaid: true, date: "2026-02-01" },
  { id: 4, class_id: 3, student_id: 2, amount: 18000, type: "educational", isPaid: false, date: "" },
  { id: 5, class_id: 4, student_id: 1, amount: 20000, type: "educational", isPaid: true, date: "2026-03-01" },
  { id: 6, class_id: 1, student_id: 10, amount: 2500, type: "events", isPaid: true, date: "2026-04-20" },
  { id: 7, class_id: 3, student_id: 6, amount: 3000, type: "pick-and-drop", isPaid: false, date: "" },
  { id: 8, class_id: 4, student_id: 4, amount: 2500, type: "events", isPaid: true, date: "2026-04-20" },
];

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
    { icon: BuildingOne, title: "Institute", url: instituteUrl },
    { icon: Book, title: "Subjects", url: subjectsUrl },
    { icon: Grid, title: "Classes", url: classesUrl },
    { icon: UsersGroup, title: "Students", url: studentsUrl },
    { icon: Ticket, title: "Expenses", url: expensesUrl },
    // { icon: UserCheck , title: "Attendance", url: attendanceUrl },
  ];
}

export function getExpenseClassUrl(instituteSlug: string, classSlug: string) {
  return `/institutes/${instituteSlug}/expense/${classSlug}`;
}
