export const PROFILE = {
  name: 'Slava Saequus',
  title: 'Senior Software Engineer & Team Lead',
  location: 'Warsaw, Poland',
  tagline:
    'I lead teams, build platforms, and own delivery end to end. Fluent in Polish, English, and Russian.',
  interests: ['engineering', 'financial markets', 'somatic work'],
  linkedIn: 'https://www.linkedin.com/in/spetsyian/',
  github: 'https://github.com/saequus',
  x: 'https://x.com/slava_saequus',
  leetcode: 'https://leetcode.com/saequus/',
  hackerRank: 'https://www.hackerrank.com/saequus',
  medium: 'https://medium.com/saequus',
  cv: '/assets/Slava_Spetsyian_CV.pdf',
  coursera: {
    title: 'Algorithmic Toolbox',
    url: 'https://www.coursera.org/account/accomplishments/verify/8DZFVTMY7GQS',
  },
} as const

export type VentureEntry = {
  name: string
  href: string
  description: string
}

export type WorkEntry = {
  company: string
  role: string
  period: string
  href?: string
  stack?: string
  summary: string
  ventures?: VentureEntry[]
}

export const SERPENTARIA = {
  href: 'https://www.serpentaria.eu/',
  ventures: [
    {
      name: 'SalesAmplifier',
      href: 'https://salesamplifier.pl/',
      description:
        'Analytics workspace for Allegro sellers — upload XLSX reports, track sales and visits across multiple accounts, and visualize Allegro Ads performance. Read-only integration; no listing or campaign edits.',
    },
  ],
} as const

export const WORK_HISTORY: WorkEntry[] = [
  {
    company: 'Serpentaria Capital',
    role: 'Founding Engineer',
    period: '2024 — Present',
    href: SERPENTARIA.href,
    stack: 'TypeScript, Next.js, Python, Railway',
    summary:
      'Working on product ventures at the intersection of engineering and commerce — platforms, APIs, and internal systems.',
    ventures: [...SERPENTARIA.ventures],
  },
  {
    company: 'Razor Labs',
    role: 'Senior Software Engineer',
    period: '2024 — Mar 2026',
    href: 'https://il.linkedin.com/company/razor-technologies-inc',
    stack:
      'Python, GCP, Grafana, Kafka, Elasticsearch, Kubernetes, AI platforms',
    summary:
      'Built AI-driven industrial platforms. Led engineering on predictive maintenance and sensor-fusion systems with event streaming and observability at scale.',
  },
  {
    company: 'ZAGENO',
    role: 'Senior Software Engineer',
    period: 'Nov 2021 — Jan 2024',
    href: 'https://zageno.com/',
    stack: 'Python, Google Cloud, Kubernetes, FastAPI, PostgreSQL, Django',
    summary:
      'Designed integration solutions that unified multiple services into one platform, shipped killer features, and improved pricing algorithms.',
  },
  {
    company: 'ING Tech',
    role: 'Senior Developer',
    period: 'Jun 2020 — Oct 2021',
    stack: 'Python, Pandas, NumPy',
    summary:
      'Built libraries and API interfaces for bank workers to simplify credit-risk estimation workflows.',
  },
  {
    company: 'Emerging Travel Group',
    role: 'Growth Engineer',
    period: 'Oct 2019 — Jun 2020',
    href: 'https://www.emergingtravel.com/',
    stack: 'Python, JavaScript, Node.js, DRF, PostgreSQL, Nginx',
    summary:
      'Ran growth experiments across backend and frontend, instrumenting everything with analytics to validate product hypotheses for B2B travel.',
  },
]

export type ProjectEntry = {
  name: string
  href: string
  image: string
  description: string
}

export const PROJECTS: ProjectEntry[] = [
  {
    name: 'SalesAmplifier',
    href: SERPENTARIA.ventures[0].href,
    image: '/assets/img/ogImage',
    description:
      'Allegro seller analytics — upload XLSX reports, track sales across accounts, and visualize Ads performance in one workspace.',
  },
  {
    name: 'Serpentaria Capital',
    href: SERPENTARIA.href,
    image: '/assets/img/ogImage',
    description: 'Engineering and product work at the intersection of markets and technology.',
  },
  {
    name: 'ZAGENO',
    href: 'https://zageno.com/',
    image: '/assets/img/projects/zageno-project-img',
    description: 'Life-science marketplace connecting labs with suppliers worldwide.',
  },
  {
    name: 'Zenhotels',
    href: 'https://www.zenhotels.com/',
    image: '/assets/img/projects/zenhotels-project-img',
    description: 'Global hotel booking platform — growth engineering and product analytics.',
  },
  {
    name: 'Lift Vertical',
    href: 'https://liftvertical.com/',
    image: '/assets/img/projects/lift-vertical-project-img',
    description: 'AI technologies for social welfare and public-sector impact.',
  },
  {
    name: 'Neuro Postęp',
    href: 'https://neuropostep.pl/',
    image: '/assets/img/projects/neuro-postep-project-img',
    description:
      'Medical practice focused on autoimmune and neurodegenerative disease treatment.',
  },
]

export const EDUCATION = {
  school: 'University of Economics and Human Sciences in Warsaw',
  degree: 'BSc in Business Administration and Service Management',
  period: '2013 — 2016',
  note: 'CGPA 4.39/5.00',
} as const

export const SKILLS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Rust',
  'Shell',
  'Next.js',
  'React',
  'Node.js',
  'Tailwind CSS',
  'FastAPI',
  'Django',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'Kafka',
  'Kubernetes',
  'Docker',
  'AWS',
  'GCP',
  'Grafana',
  'Nginx',
  'Vercel',
] as const