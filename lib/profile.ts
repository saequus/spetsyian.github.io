export const PROFILE = {
  name: 'Viachaslau Spetsyian',
  shortName: 'Slava Spetsyian',
  handle: 'saequus',
  title: 'Senior Software & AI Engineer',
  headline: 'AI Engineer — LLM applications, agents, RAG & LLMOps',
  location: 'Warsaw, Poland',
  email: 'slava@spetsyian.com',
  tagline:
    'I build production LLM systems — agentic workflows, retrieval-augmented generation and evaluation-driven LLMOps — on top of solid Python backends and cloud architecture.',
  about:
    'Senior Software & AI Engineer with years of production Python behind me and a track record of deploying ML models to production. Today my focus is LLM applications: agentic workflows, retrieval-augmented generation (RAG), evaluation-driven development and LLMOps. I pair strong backend and cloud architecture with a business and finance background, and I have led and mentored engineering teams. Fluent in Polish, English and Russian.',
  languages: ['Polish', 'English', 'Russian'],
  interests: ['agentic AI systems', 'distributed systems', 'financial markets'],
  linkedIn: 'https://www.linkedin.com/in/spetsyian/',
  github: 'https://github.com/saequus',
  x: 'https://x.com/slava_saequus',
  leetcode: 'https://leetcode.com/saequus/',
  hackerRank: 'https://www.hackerrank.com/saequus',
  medium: 'https://medium.com/saequus',
  telegram: 'https://t.me/spetsyian',
  cv: '/assets/Slava_Spetsyian_CV.pdf',
  coursera: {
    title: 'Algorithmic Toolbox',
    url: 'https://www.coursera.org/account/accomplishments/verify/8DZFVTMY7GQS',
  },
} as const

/** Focus areas shown on the home page (all backed by the CV). */
export const FOCUS_AREAS = [
  {
    title: 'LLM agents & tool calling',
    body: 'Agentic workflows with LangGraph, Pydantic AI and the Model Context Protocol (MCP): tool calling, structured outputs and guardrails.',
  },
  {
    title: 'RAG & vector search',
    body: 'Retrieval pipelines on pgvector and Qdrant — embeddings, hybrid search and reranking, built to be measured rather than guessed.',
  },
  {
    title: 'Evals & LLMOps',
    body: 'Evaluation-driven development with Ragas, DeepEval, Langfuse and LangSmith: prompt versioning, tracing, regression gates.',
  },
  {
    title: 'ML serving & backends',
    body: 'Model serving, monitoring and deployment pipelines (MLflow, TorchServe, Grafana, Terraform) behind FastAPI services on GCP and AWS.',
  },
] as const

/** Key achievements, verbatim facts from the CV. */
export const HIGHLIGHTS = [
  'Led and mentored a team of 5 middle and junior engineers, improving code quality by 30% and cutting onboarding time by 80%.',
  'Deployed production ML models that cut latency by 40%, lifted accuracy by 25% and boosted adoption by 35%.',
  'Led backend development of key features that reduced average response time from 4.2s to 0.9s.',
  'Architected microservices on Google Cloud, improving scalability and reducing infrastructure costs by 25%.',
] as const

export const IDENTITY = [
  {
    label: 'Enneagram',
    value: 'Type 7 — THE ENTHUSIAST',
  },
  {
    label: 'Human Design',
    value: 'Generator (Profile 3/5)',
  },
] as const

export type VentureEntry = {
  name: string
  href: string
  description: string
}

export type WorkEntry = {
  company: string
  role: string
  period: string
  /** ISO year-month, used for machine-readable <time> elements. */
  start: string
  end?: string
  href?: string
  stack?: string
  summary: string
  ventures?: VentureEntry[]
}

export const SERPENTARIA = {
  href: 'https://serpentaria.eu/',
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
    role: 'Founder & AI Engineer',
    period: 'Oct 2025 — Present',
    start: '2025-10',
    href: SERPENTARIA.href,
    stack: 'LangGraph, MCP, pgvector, Langfuse, FastAPI',
    summary:
      'Founded Serpentaria Capital Sp. z o.o. Building LLM agents and RAG pipelines for finance and research use cases, with tool calling, structured outputs, automated evals and tracing.',
    ventures: [...SERPENTARIA.ventures],
  },
  {
    company: 'Razor Labs',
    role: 'Senior Software Engineer',
    period: 'Jan 2024 — Mar 2026',
    start: '2024-01',
    end: '2026-03',
    href: 'https://il.linkedin.com/company/razor-technologies-inc',
    stack: 'MLflow, TorchServe, Grafana, Terraform, GCP, FastAPI, PostgreSQL, MongoDB',
    summary:
      'Led a team of 5 engineers delivering ML-powered product features. Owned model serving, monitoring and deployment pipelines for production-grade ML models. Bridged research algorithms and real-world products, reducing processing time by 40%, improving prediction accuracy by 25% and increasing user adoption by 35%.',
  },
  {
    company: 'ZAGENO',
    role: 'Senior Software Engineer',
    period: 'Nov 2021 — Jan 2024',
    start: '2021-11',
    end: '2024-01',
    href: 'https://zageno.com/',
    stack: 'Python, GCP, AWS, Kubernetes, FastAPI, PostgreSQL, Django',
    summary:
      'Designed integration solutions consolidating multiple services into a unified platform. Built high-impact product features and improved pricing algorithms.',
  },
  {
    company: 'Emerging Travel Group',
    role: 'Backend Developer',
    period: 'Oct 2019 — Oct 2021',
    start: '2019-10',
    end: '2021-10',
    href: 'https://www.emergingtravel.com/',
    stack: 'Python, Go, Django, TypeScript, Express.js, Kubernetes, PostgreSQL, Redis',
    summary:
      'Built REST API integrations in Go and Python, developed and operated microservices, improved CI/CD flows and built a backend-for-frontend layer in TypeScript.',
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
    image: '/assets/img/projects/salesamplifier-og',
    description:
      'Allegro seller analytics — upload XLSX reports, track sales across accounts, and visualize Ads performance in one workspace.',
  },
  {
    name: 'Serpentaria Capital',
    href: SERPENTARIA.href,
    image: 'https://coreprojects.blob.core.windows.net/serpentariacapital/web/assets/img/other/ogimage-thumbnail-jellyfish-pl.jpg',
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
    description: 'Global hotel booking platform (Emerging Travel Group) — backend API integrations and microservices.',
  },
  {
    name: 'Lift Vertical',
    href: 'https://liftvertical.com/',
    image: '/assets/img/projects/lift-vertical-og',
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
  school: 'University of Finance and Management in Warsaw',
  degree: 'BSc in Business Administration and Service Management',
  department: 'Management Department',
  period: 'Graduated September 2016',
  note: 'CGPA 4.39/5.00',
} as const

/** Grouped exactly as in the CV. */
export const SKILL_GROUPS: { label: string; items: string[] }[] = [
  {
    label: 'LLM & Agents',
    items: [
      'OpenAI / Anthropic / Gemini APIs',
      'LangGraph',
      'LangChain',
      'LlamaIndex',
      'Pydantic AI',
      'Model Context Protocol (MCP)',
      'Tool calling',
      'Structured outputs',
    ],
  },
  {
    label: 'RAG & Vector Search',
    items: ['pgvector', 'Qdrant', 'Embeddings', 'Hybrid search', 'Reranking'],
  },
  {
    label: 'LLMOps & Evals',
    items: ['Langfuse', 'LangSmith', 'Ragas', 'DeepEval', 'Prompt versioning', 'Guardrails'],
  },
  {
    label: 'ML & Serving',
    items: ['MLflow', 'TorchServe', 'PyTorch', 'Hugging Face', 'vLLM', 'Ollama'],
  },
  { label: 'AI Dev Tools', items: ['Cursor', 'Claude Code', 'GitHub Copilot'] },
  {
    label: 'Cloud',
    items: ['AWS', 'Google Cloud Platform (Vertex AI)', 'Microsoft Azure'],
  },
  { label: 'Languages', items: ['Python', 'Go', 'Rust', 'TypeScript / JavaScript'] },
  { label: 'Databases', items: ['PostgreSQL', 'MongoDB', 'Redis'] },
  {
    label: 'Frameworks',
    items: ['FastAPI', 'Django', 'React', 'Vue', 'Node', 'Express', 'pandas', 'NumPy', 'Matplotlib'],
  },
  {
    label: 'DevOps',
    items: ['Kubernetes', 'Docker', 'Terraform', 'Grafana', 'Nginx', 'CI/CD'],
  },
]
