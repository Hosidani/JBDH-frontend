// Unified mock job data for all pages
export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  workType: string;
  postedDate?: string;
  lastApplicationDate?: string;
  matchPercentage: number;
  isActionItem: boolean;
  saved: boolean;
  description?: string;
  competencies?: string[];
}

export const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Fullstackutvecklare',
    company: 'High Tech AB',
    location: 'Stockholm',
    workType: 'Heltid',
    postedDate: '2025-12-23',
    lastApplicationDate: '2025-11-19',
    matchPercentage: 92,
    isActionItem: false,
    saved: false,
    description: 'Vi söker en erfaren fullstackutvecklare för att bygga nästa generation av vår plattform.',
    competencies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
  },
  {
    id: 2,
    title: 'Tech Lead',
    company: 'Futuristica',
    location: 'Göteborg',
    workType: 'Heltid',
    postedDate: '2025-11-19',
    lastApplicationDate: '2025-12-23',
    matchPercentage: 87,
    isActionItem: false,
    saved: true,
    description: 'Leda ett team av utvecklare och forma teknisk vision för våra framtidsprojekt.',
    competencies: ['Leadership', 'Architecture', 'React', 'Node.js', 'AWS'],
  },
  {
    id: 3,
    title: 'Frontendutvecklare i Angular',
    company: 'Wyswwigg AB',
    location: 'Göteborg',
    workType: 'Heltid',
    postedDate: '2025-11-19',
    lastApplicationDate: '2025-11-19',
    matchPercentage: 95,
    isActionItem: true,
    saved: false,
    description: 'Utveckla moderna webbgränssnitt med Angular för våra företagsklienter.',
    competencies: ['Angular', 'TypeScript', 'RxJS', 'CSS', 'Material Design'],
  },
  {
    id: 4,
    title: 'Backend Developer',
    company: 'HighTechComp',
    location: 'Stockholm',
    workType: 'Heltid',
    postedDate: '2025-12-23',
    lastApplicationDate: '2025-12-23',
    matchPercentage: 78,
    isActionItem: false,
    saved: true,
    description: 'Bygga robusta API:er och backends för vår växande tjänst.',
    competencies: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Kubernetes'],
  },
  {
    id: 5,
    title: 'UX/UI Designer',
    company: 'Creative Studio',
    location: 'Malmö',
    workType: 'Heltid',
    postedDate: '2025-11-19',
    lastApplicationDate: '2025-11-19',
    matchPercentage: 65,
    isActionItem: false,
    saved: false,
    description: 'Designa användarupplevelser för nästa generations appar.',
    competencies: ['Figma', 'User Research', 'Prototyping', 'Accessibility', 'Design Systems'],
  },
];

export const getJobById = (id: number): Job | undefined => {
  return mockJobs.find(job => job.id === id);
};

export const getMatchingJobs = (): Job[] => {
  return mockJobs;
};

export const getSavedJobs = (): Job[] => {
  return mockJobs.filter(job => job.saved);
};
