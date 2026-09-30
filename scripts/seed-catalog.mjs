import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const catalog = [
  {
    name: 'Mathematics',
    description: 'Pure and applied mathematics pathway',
    color: '#108571',
    units: [
      {
        code: 'MATH101', name: 'Calculus I', credits: 3, color: '#108571',
        description: 'Limits, derivatives, and integrals with applications',
        assignments: [
          { title: 'Limits & Continuity Problem Set', description: 'Exercises on limits, continuity, and intermediate value theorem', dueInDays: 5, type: 'assignment', priority: 'medium' },
          { title: 'Derivatives & Applications Quiz', description: 'Differentiation rules and optimization problems', dueInDays: 12, type: 'quiz', priority: 'medium' },
          { title: 'Integration Techniques Homework', description: 'Substitution, parts, and partial fractions', dueInDays: 19, type: 'assignment', priority: 'high' },
          { title: 'Midterm Exam: Differentiation & Integration', dueInDays: 26, type: 'exam', priority: 'high' },
        ],
      },
      {
        code: 'MATH102', name: 'Linear Algebra', credits: 2, color: '#108571',
        description: 'Vectors, matrices, and linear transformations',
        assignments: [
          { title: 'Vector Spaces Problem Set', description: 'Basis, span, and linear independence', dueInDays: 7, type: 'assignment', priority: 'medium' },
          { title: 'Matrix Operations Quiz', dueInDays: 14, type: 'quiz', priority: 'medium' },
          { title: 'Eigenvalues Project Report', description: 'Diagonalization and applications', dueInDays: 24, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'MATH103', name: 'Probability & Statistics', credits: 2, color: '#108571',
        description: 'Probability theory and statistical inference',
        assignments: [
          { title: 'Descriptive Statistics Homework', dueInDays: 6, type: 'assignment', priority: 'low' },
          { title: 'Probability Distributions Quiz', description: 'Binomial, normal, and Poisson distributions', dueInDays: 13, type: 'quiz', priority: 'medium' },
          { title: 'Statistical Analysis Project', description: 'Collect data, test a hypothesis, and write it up', dueInDays: 25, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'MATH104', name: 'Discrete Mathematics', credits: 2, color: '#108571',
        description: 'Logic, proof techniques, graphs, and combinatorics',
        assignments: [
          { title: 'Logic & Proofs Problem Set', dueInDays: 5, type: 'assignment', priority: 'medium' },
          { title: 'Graph Theory Homework', description: 'Trees, connectivity, and coloring', dueInDays: 12, type: 'assignment', priority: 'medium' },
          { title: 'Combinatorics Quiz', dueInDays: 20, type: 'quiz', priority: 'medium' },
        ],
      },
      {
        code: 'MATH105', name: 'Mathematical Study Skills', credits: 1, color: '#108571',
        description: 'Problem-solving strategies and mathematical writing',
        assignments: [
          { title: 'Mathematical Writing Assignment', dueInDays: 8, type: 'assignment', priority: 'low' },
          { title: 'Study Skills Reflection', dueInDays: 15, type: 'assignment', priority: 'low' },
        ],
      },
      {
        code: 'MATH201', name: 'Differential Equations', credits: 3, color: '#108571',
        description: 'ODEs, series solutions, and Laplace transforms',
        assignments: [
          { title: 'First-Order ODEs Problem Set', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Laplace Transforms Homework', dueInDays: 13, type: 'assignment', priority: 'high' },
          { title: 'Systems of ODEs Project', description: 'Model a real-world dynamic system', dueInDays: 24, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'MATH202', name: 'Real Analysis', credits: 3, color: '#108571',
        description: 'Rigorous treatment of sequences, limits, and continuity',
        assignments: [
          { title: 'Sequences & Limits Problem Set', dueInDays: 6, type: 'assignment', priority: 'high' },
          { title: 'Continuity & Differentiability Essay', dueInDays: 14, type: 'assignment', priority: 'medium' },
          { title: 'Midterm Exam', dueInDays: 25, type: 'exam', priority: 'high' },
        ],
      },
      {
        code: 'MATH203', name: 'Number Theory', credits: 1, color: '#108571',
        description: 'Divisibility, primes, and cryptographic applications',
        assignments: [
          { title: 'Modular Arithmetic Exercises', dueInDays: 9, type: 'assignment', priority: 'low' },
          { title: 'Cryptography Connections Reflection', dueInDays: 17, type: 'assignment', priority: 'low' },
        ],
      },
    ],
  },
  {
    name: 'Technology',
    description: 'Programming, IT, and software construction pathway',
    color: '#4F46E5',
    units: [
      {
        code: 'COMP101', name: 'Programming Fundamentals', credits: 3, color: '#4F46E5',
        description: 'Variables, control flow, functions, and problem solving',
        assignments: [
          { title: 'Variables & Control Flow Lab', dueInDays: 5, type: 'assignment', priority: 'medium' },
          { title: 'Functions & Arrays Homework', dueInDays: 12, type: 'assignment', priority: 'medium' },
          { title: 'Mini Console Application Project', description: 'Build a small command-line tool combining the semester topics', dueInDays: 25, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'COMP102', name: 'Data Structures', credits: 3, color: '#4F46E5',
        description: 'Lists, stacks, queues, trees, and hash tables',
        assignments: [
          { title: 'Linked Lists & Stacks Lab', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Trees & Traversals Homework', dueInDays: 13, type: 'assignment', priority: 'high' },
          { title: 'Data Structures Implementation Project', dueInDays: 26, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'COMP103', name: 'Software Design', credits: 2, color: '#4F46E5',
        description: 'UML, design patterns, and architectural thinking',
        assignments: [
          { title: 'UML Class Diagrams Assignment', dueInDays: 7, type: 'assignment', priority: 'medium' },
          { title: 'Design Patterns Quiz', dueInDays: 14, type: 'quiz', priority: 'medium' },
          { title: 'Architecture Design Document', description: 'Propose the architecture for a small product', dueInDays: 24, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'COMP104', name: 'Web Development', credits: 2, color: '#4F46E5',
        description: 'HTML, CSS, JavaScript, and full-stack fundamentals',
        assignments: [
          { title: 'HTML/CSS Landing Page Lab', dueInDays: 5, type: 'assignment', priority: 'low' },
          { title: 'JavaScript Interactivity Homework', dueInDays: 12, type: 'assignment', priority: 'medium' },
          { title: 'Full-Stack Web App Project', dueInDays: 26, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'COMP105', name: 'Databases', credits: 2, color: '#4F46E5',
        description: 'Relational modeling, SQL, and normalization',
        assignments: [
          { title: 'SQL Queries Homework', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Schema Design Assignment', dueInDays: 13, type: 'assignment', priority: 'high' },
          { title: 'Normalization Quiz', dueInDays: 20, type: 'quiz', priority: 'medium' },
        ],
      },
      {
        code: 'COMP106', name: 'Version Control & Collaboration', credits: 1, color: '#4F46E5',
        description: 'Git workflows and team collaboration practices',
        assignments: [
          { title: 'Git Workflow Lab', description: 'Branching, merging, and resolving conflicts', dueInDays: 7, type: 'assignment', priority: 'low' },
          { title: 'Pull Request Review Exercise', dueInDays: 14, type: 'assignment', priority: 'low' },
        ],
      },
      {
        code: 'COMP107', name: 'Software Testing', credits: 1, color: '#4F46E5',
        description: 'Unit tests, test plans, and quality assurance',
        assignments: [
          { title: 'Unit Testing Assignment', dueInDays: 8, type: 'assignment', priority: 'medium' },
          { title: 'Test Plan Writing Exercise', dueInDays: 15, type: 'assignment', priority: 'low' },
        ],
      },
      {
        code: 'COMP108', name: 'Algorithms', credits: 3, color: '#4F46E5',
        description: 'Sorting, searching, graphs, and complexity analysis',
        assignments: [
          { title: 'Sorting & Searching Homework', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Algorithm Analysis Quiz', dueInDays: 13, type: 'quiz', priority: 'medium' },
          { title: 'Graph Algorithms Project', dueInDays: 25, type: 'project', priority: 'high' },
        ],
      },
    ],
  },
  {
    name: 'Business',
    description: 'Management, finance, marketing, and entrepreneurship pathway',
    color: '#0369A1',
    units: [
      {
        code: 'BUS101', name: 'Principles of Management', credits: 3, color: '#0369A1',
        description: 'Planning, organizing, leading, and controlling organizations',
        assignments: [
          { title: 'Management Theories Case Study', dueInDays: 5, type: 'assignment', priority: 'medium' },
          { title: 'Organizational Structures Quiz', dueInDays: 12, type: 'quiz', priority: 'medium' },
          { title: 'Leadership Reflection Report', dueInDays: 22, type: 'assignment', priority: 'medium' },
        ],
      },
      {
        code: 'BUS102', name: 'Financial Accounting', credits: 3, color: '#0369A1',
        description: 'Journal entries, ledgers, and financial statements',
        assignments: [
          { title: 'Journal Entries Homework', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Financial Statements Quiz', dueInDays: 13, type: 'quiz', priority: 'high' },
          { title: 'Balance Sheet Project', description: 'Prepare complete statements from a mock company dataset', dueInDays: 24, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'BUS103', name: 'Business Communication', credits: 2, color: '#0369A1',
        description: 'Professional writing, email, reports, and presentations',
        assignments: [
          { title: 'Email & Memo Writing Exercise', dueInDays: 5, type: 'assignment', priority: 'low' },
          { title: 'Presentation Skills Assessment', dueInDays: 14, type: 'project', priority: 'medium' },
          { title: 'Formal Report Writing Assignment', dueInDays: 22, type: 'assignment', priority: 'medium' },
        ],
      },
      {
        code: 'BUS104', name: 'Marketing Fundamentals', credits: 2, color: '#0369A1',
        description: 'Consumer behavior, branding, and the marketing mix',
        assignments: [
          { title: 'Consumer Behavior Analysis', dueInDays: 7, type: 'assignment', priority: 'medium' },
          { title: 'Marketing Mix Quiz', dueInDays: 14, type: 'quiz', priority: 'medium' },
          { title: 'Mini Marketing Campaign', description: 'Design a campaign for a local business', dueInDays: 25, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'BUS105', name: 'Microeconomics', credits: 2, color: '#0369A1',
        description: 'Supply, demand, market structures, and pricing',
        assignments: [
          { title: 'Supply & Demand Problem Set', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Market Structures Homework', dueInDays: 13, type: 'assignment', priority: 'high' },
          { title: 'Midterm Exam', dueInDays: 24, type: 'exam', priority: 'high' },
        ],
      },
      {
        code: 'BUS106', name: 'Entrepreneurship', credits: 1, color: '#0369A1',
        description: 'Idea validation, business models, and startups',
        assignments: [
          { title: 'Business Model Canvas', dueInDays: 8, type: 'assignment', priority: 'medium' },
          { title: 'Startup Pitch Reflection', dueInDays: 16, type: 'assignment', priority: 'low' },
        ],
      },
      {
        code: 'BUS107', name: 'Organizational Behavior', credits: 2, color: '#0369A1',
        description: 'Motivation, teamwork, and workplace culture',
        assignments: [
          { title: 'Motivation Theories Essay', dueInDays: 7, type: 'assignment', priority: 'medium' },
          { title: 'Team Dynamics Case Study', dueInDays: 14, type: 'assignment', priority: 'medium' },
          { title: 'Organizational Behavior Quiz', dueInDays: 21, type: 'quiz', priority: 'low' },
        ],
      },
      {
        code: 'BUS108', name: 'Business Statistics', credits: 2, color: '#0369A1',
        description: 'Descriptive stats, probability, and forecasting for business',
        assignments: [
          { title: 'Descriptive Statistics Homework', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Probability & Forecasting Assignment', dueInDays: 13, type: 'assignment', priority: 'high' },
          { title: 'Business Data Project', dueInDays: 25, type: 'project', priority: 'medium' },
        ],
      },
    ],
  },
  {
    name: 'Health Sciences',
    description: 'Healthcare, public health, and human wellness pathway',
    color: '#E11D48',
    units: [
      {
        code: 'HLT101', name: 'Anatomy & Physiology', credits: 3, color: '#E11D48',
        description: 'Structure and function of the human body systems',
        assignments: [
          { title: 'Skeletal & Muscular Systems Assignment', dueInDays: 5, type: 'assignment', priority: 'medium' },
          { title: 'Homeostasis Quiz', dueInDays: 12, type: 'quiz', priority: 'medium' },
          { title: 'Organ Systems Project', description: 'Build an integrated report on three body systems', dueInDays: 24, type: 'project', priority: 'high' },
        ],
      },
      {
        code: 'HLT102', name: 'Introduction to Public Health', credits: 2, color: '#E11D48',
        description: 'Epidemiology basics, health policy, and community health',
        assignments: [
          { title: 'Epidemiology Terms Quiz', dueInDays: 6, type: 'quiz', priority: 'medium' },
          { title: 'Community Health Case Study', dueInDays: 14, type: 'assignment', priority: 'medium' },
          { title: 'Health Policy Essay', dueInDays: 22, type: 'assignment', priority: 'high' },
        ],
      },
      {
        code: 'HLT103', name: 'Nutrition Fundamentals', credits: 2, color: '#E11D48',
        description: 'Macronutrients, micronutrients, and healthy eating patterns',
        assignments: [
          { title: 'Macronutrients Homework', dueInDays: 5, type: 'assignment', priority: 'low' },
          { title: 'Diet Analysis Project', dueInDays: 15, type: 'project', priority: 'high' },
          { title: 'Nutrition Quiz', dueInDays: 21, type: 'quiz', priority: 'medium' },
        ],
      },
      {
        code: 'HLT104', name: 'Medical Terminology', credits: 1, color: '#E11D48',
        description: 'Prefixes, suffixes, roots, and clinical vocabulary',
        assignments: [
          { title: 'Prefixes & Suffixes Quiz', dueInDays: 7, type: 'quiz', priority: 'medium' },
          { title: 'Terminology Flashcards Assignment', dueInDays: 14, type: 'assignment', priority: 'low' },
        ],
      },
      {
        code: 'HLT105', name: 'Psychology Foundations', credits: 2, color: '#E11D48',
        description: 'Learning, cognition, development, and mental health',
        assignments: [
          { title: 'Classical Conditioning Essay', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Psychological Disorders Quiz', dueInDays: 13, type: 'quiz', priority: 'high' },
          { title: 'Research Summary Paper', dueInDays: 23, type: 'assignment', priority: 'medium' },
        ],
      },
      {
        code: 'HLT106', name: 'First Aid & Emergency Care', credits: 1, color: '#E11D48',
        description: 'CPR, injury response, and emergency preparedness',
        assignments: [
          { title: 'CPR & Choking Scenario Quiz', dueInDays: 8, type: 'quiz', priority: 'medium' },
          { title: 'Emergency Response Plan', dueInDays: 15, type: 'assignment', priority: 'medium' },
        ],
      },
      {
        code: 'HLT107', name: 'Research in Health Sciences', credits: 2, color: '#E11D48',
        description: 'Study design, literature appraisal, and ethics',
        assignments: [
          { title: 'Literature Appraisal', dueInDays: 7, type: 'assignment', priority: 'high' },
          { title: 'Research Proposal', dueInDays: 15, type: 'assignment', priority: 'high' },
          { title: 'Methods Quiz', dueInDays: 22, type: 'quiz', priority: 'medium' },
        ],
      },
      {
        code: 'HLT108', name: 'Epidemiology Basics', credits: 2, color: '#E11D48',
        description: 'Disease transmission, surveillance, and outbreak response',
        assignments: [
          { title: 'Disease Transmission Homework', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Outbreak Investigation Case Study', dueInDays: 15, type: 'project', priority: 'high' },
          { title: 'Midterm Exam', dueInDays: 25, type: 'exam', priority: 'high' },
        ],
      },
    ],
  },
  {
    name: 'All Courses',
    description: 'General education across writing, communication, research, and more',
    color: '#F59E0B',
    units: [
      {
        code: 'GEN101', name: 'Academic Writing', credits: 2, color: '#F59E0B',
        description: 'Essay structure, argumentation, and research writing',
        assignments: [
          { title: 'Thesis Statement Workshop', dueInDays: 5, type: 'assignment', priority: 'medium' },
          { title: 'Research Paper Outline', dueInDays: 12, type: 'assignment', priority: 'medium' },
          { title: 'Final Essay Submission', dueInDays: 25, type: 'assignment', priority: 'high' },
        ],
      },
      {
        code: 'GEN102', name: 'Communication Skills', credits: 2, color: '#F59E0B',
        description: 'Public speaking, presentations, and group communication',
        assignments: [
          { title: 'Persuasive Speech Outline', dueInDays: 7, type: 'assignment', priority: 'medium' },
          { title: 'Group Presentation', dueInDays: 15, type: 'project', priority: 'high' },
          { title: 'Communication Reflection', dueInDays: 22, type: 'assignment', priority: 'low' },
        ],
      },
      {
        code: 'GEN103', name: 'Critical Thinking', credits: 2, color: '#F59E0B',
        description: 'Argument analysis, fallacies, and logical reasoning',
        assignments: [
          { title: 'Logical Fallacies Analysis', dueInDays: 6, type: 'assignment', priority: 'medium' },
          { title: 'Argument Mapping Assignment', dueInDays: 13, type: 'assignment', priority: 'medium' },
          { title: 'Case Study Response', dueInDays: 23, type: 'assignment', priority: 'high' },
        ],
      },
      {
        code: 'GEN104', name: 'Research Methods', credits: 2, color: '#F59E0B',
        description: 'Finding, evaluating, and synthesizing sources',
        assignments: [
          { title: 'Literature Review', dueInDays: 7, type: 'assignment', priority: 'high' },
          { title: 'Research Proposal', dueInDays: 14, type: 'assignment', priority: 'high' },
          { title: 'Methods Quiz', dueInDays: 21, type: 'quiz', priority: 'medium' },
        ],
      },
      {
        code: 'GEN105', name: 'Ethics', credits: 1, color: '#F59E0B',
        description: 'Moral reasoning applied to real-world dilemmas',
        assignments: [
          { title: 'Ethics Case Study', dueInDays: 9, type: 'assignment', priority: 'medium' },
          { title: 'Moral Reasoning Essay', dueInDays: 17, type: 'assignment', priority: 'medium' },
        ],
      },
      {
        code: 'GEN106', name: 'Presentation Skills', credits: 1, color: '#F59E0B',
        description: 'Slide design and confident delivery',
        assignments: [
          { title: 'Slide Deck Design Assignment', dueInDays: 8, type: 'assignment', priority: 'low' },
          { title: 'Presentation Delivery', dueInDays: 15, type: 'project', priority: 'medium' },
        ],
      },
      {
        code: 'GEN107', name: 'Digital Literacy', credits: 2, color: '#F59E0B',
        description: 'Productive, safe, and critical use of digital tools',
        assignments: [
          { title: 'Online Safety Quiz', dueInDays: 6, type: 'quiz', priority: 'low' },
          { title: 'Digital Tools Assignment', dueInDays: 13, type: 'assignment', priority: 'medium' },
          { title: 'Data Privacy Reflection', dueInDays: 20, type: 'assignment', priority: 'medium' },
        ],
      },
      {
        code: 'GEN108', name: 'Career Development', credits: 1, color: '#F59E0B',
        description: 'Resume writing, interviewing, and career planning',
        assignments: [
          { title: 'Resume Writing Assignment', dueInDays: 7, type: 'assignment', priority: 'medium' },
          { title: 'Mock Interview Reflection', dueInDays: 14, type: 'assignment', priority: 'low' },
        ],
      },
    ],
  },
];

const LESSONS = {
  MATH101: 'Lesson: Calculus I — Limits, Derivatives & Integrals\n\nCalculus studies continuous change. A limit describes what a function approaches; the derivative is the instantaneous rate of change; the integral accumulates change. The Fundamental Theorem of Calculus connects differentiation and integration.\n\nKey concepts: limit laws and continuity, differentiation rules (power, product, quotient, chain), optimization, related rates, Riemann sums and antiderivatives.\n\nStudy tip: sketch f, f′, and f″ together for every example — if the story of the three graphs makes sense, the mechanics will follow.',
  MATH102: 'Lesson: Linear Algebra — Vectors, Matrices & Transformations\n\nLinear algebra gives the language of systems of equations and geometric transformations. Vectors live in spaces; matrices act on vectors; solving Ax = b means finding which inputs produce a given output.\n\nKey concepts: vector spaces, span and basis, linear independence, matrix operations and inverses, determinants, eigenvalues and eigenvectors, diagonalization.\n\nStudy tip: always tie the algebra to a picture — a matrix multiplication is a transformation of the plane (or space), and eigenvectors are the directions that only stretch.',
  MATH103: 'Lesson: Probability & Statistics — Data, Chance & Inference\n\nProbability quantifies uncertainty; statistics uses samples to learn about populations. Descriptive statistics summarizes data, probability models random behaviour, and inferential statistics turns evidence into conclusions with stated confidence.\n\nKey concepts: sample spaces and conditional probability, common distributions (binomial, normal, Poisson), expectation and variance, sampling, confidence intervals, hypothesis testing.\n\nStudy tip: before computing, write down the population, the sample, and the variable — most mistakes are setup mistakes, not arithmetic ones.',
  MATH104: 'Lesson: Discrete Mathematics — Logic, Proofs, Graphs & Counting\n\nDiscrete mathematics is the math of distinct objects: statements, sequences, graphs, and finite sets. It is the foundation of computer science — every algorithm rests on these ideas.\n\nKey concepts: propositional logic, proof techniques (direct, contrapositive, induction, contradiction), sets and functions, basic combinatorics, graphs, trees, and counting arguments.\n\nStudy tip: for induction, write the base case and the inductive step in words first; the algebra of the proof is usually the easy part.',
  MATH105: 'Lesson: Mathematical Study Skills — Solving Problems & Writing Math Well\n\nStrong mathematicians are made by method, not talent. Break unfamiliar problems into smaller pieces, work backwards from what you want, and always check whether your answer is reasonable.\n\nKey concepts: Polya’s four-step method (understand, plan, execute, reflect), clear mathematical writing, organizing notes, exam preparation strategies, and learning from mistakes.\n\nStudy tip: keep an error log — for every problem you get wrong, write one sentence about WHY. Patterns in that log are your real syllabus.',
  MATH201: 'Lesson: Differential Equations — Modelling Change\n\nDifferential equations express how a quantity changes in terms of itself and time. They model populations, circuits, motion, heat, and finance — anywhere the rate of change depends on the current state.\n\nKey concepts: first-order ODEs (separation, integrating factors), existence and uniqueness, higher-order linear ODEs, Laplace transforms, systems of ODEs and phase planes.\n\nStudy tip: know the shape of solutions before solving — exponential decay vs growth vs oscillation tells you which method should emerge before you compute anything.',
  MATH202: 'Lesson: Real Analysis — The Rigorous Calculus\n\nAnalysis rebuilds calculus on solid logical ground: what a limit REALLY means (the epsilon-delta definition), why continuity behaves as it does, and how infinite sequences and series converge.\n\nKey concepts: completeness of the reals, sequences and limits, open/closed sets, continuity and uniform continuity, differentiation and the mean value theorem, sequences of functions.\n\nStudy tip: practice negating definitions — "not continuous" or "not uniformly continuous" exercises reveal exactly what the quantifiers mean.',
  MATH203: 'Lesson: Number Theory — Primes, Divisibility & Cryptography\n\nNumber theory studies the properties of integers, especially primes — the building blocks of arithmetic. Modern cryptography (RSA) rests directly on how hard it is to factor large numbers.\n\nKey concepts: divisibility and the Euclidean algorithm, congruences and modular arithmetic, Fermat’s little theorem, primitive roots, prime distribution, and an introduction to RSA.\n\nStudy tip: compute small modular examples by hand until residues feel intuitive — modular arithmetic stops being confusing the moment it becomes familiar.',

  COMP101: 'Lesson: Programming Fundamentals — Thinking in Code\n\nProgramming is problem-solving made executable. Break a task into steps, represent data in variables, choose between repetition and selection, and package repeated steps into functions.\n\nKey concepts: variables and types, control flow (if/else, loops), functions and parameters, arrays/lists, input/output, debugging strategies, and reading error messages carefully.\n\nStudy tip: write pseudocode for five lines of logic before typing code; and when stuck, explain the bug aloud — rubber-duck debugging works because narration exposes hidden assumptions.',
  COMP102: 'Lesson: Data Structures — Organizing Data Efficiently\n\nData structures determine how fast your program runs. Choosing the right container for the job (array vs linked list vs tree vs hash table) is often worth more than micro-optimizing code.\n\nKey concepts: dynamic arrays, linked lists, stacks and queues, binary trees and traversals, hash tables and collision handling, and Big-O analysis of each operation.\n\nStudy tip: draw the structure in memory before implementing — pointer diagrams make insert/delete logic obvious and off-by-one errors visible.',
  COMP103: 'Lesson: Software Design — Patterns Before Code\n\nGood design makes change cheap. UML diagrams communicate structure, design patterns capture proven solutions to recurring problems, and architectural decisions set the boundaries everything else respects.\n\nKey concepts: use-case and class diagrams, SOLID principles, creational patterns (factory, singleton), structural patterns (adapter, decorator), behavioural patterns (observer, strategy), layered architectures.\n\nStudy tip: for every pattern, learn the PROBLEM it solves, not just the shape — patterns are answers; you need to recognize the questions.',
  COMP104: 'Lesson: Web Development — From Markup to Full Stack\n\nThe web is a request-response system: the browser asks, the server answers with HTML, CSS styles it, JavaScript makes it interactive, and APIs connect front end to back end.\n\nKey concepts: semantic HTML, CSS box model and flexbox/grid, DOM manipulation and events, fetch and REST APIs, client-server flow, sessions and authentication basics.\n\nStudy tip: use the browser dev tools constantly — the elements panel and network tab turn invisible behaviour into something you can inspect and understand.',
  COMP105: 'Lesson: Databases — Modeling & Querying Data\n\nRelational databases store data in tables with enforced structure, so integrity survives years of change. Good schema design (normalization) eliminates redundancy; SQL retrieves exactly what you need.\n\nKey concepts: entity-relationship modeling, primary and foreign keys, SELECT with joins/grouping/aggregation, normalization (1NF–3NF), indexes, and transactions (ACID).\n\nStudy tip: sketch the tables and relationships on paper before writing SQL — most query problems are design problems wearing a different hat.',
  COMP106: 'Lesson: Version Control — Git Workflows for Teams\n\nGit tracks every change to your code, lets you experiment safely in branches, and makes collaboration possible without overwriting each other. History is a feature, not clutter.\n\nKey concepts: working tree / staging area / commits, branching and merging, resolving conflicts, rebase vs merge, pull requests and code review, .gitignore and meaningful commit messages.\n\nStudy tip: commit early with messages that explain WHY (not what) — your future self and your reviewers will thank you.',
  COMP107: 'Lesson: Software Testing — Proving It Works\n\nTesting is structured doubt: you write code whose only job is to break your code. Small, fast unit tests catch most regressions before users ever see them.\n\nKey concepts: the test pyramid, arrange-act-assert structure, test doubles (mocks, stubs), boundary and edge cases, test coverage vs test quality, and writing testable code.\n\nStudy tip: write the test BEFORE fixing a bug — a failing test that reproduces the bug proves the fix and prevents its return.',
  COMP108: 'Lesson: Algorithms — Doing More with Less\n\nAlgorithms are precise recipes for computation; analysis tells you how they scale. The right algorithm turns a problem that would take days into one that takes milliseconds.\n\nKey concepts: asymptotic notation (Big-O), sorting (merge, quick, heap), searching and binary search, hash-based techniques, graph traversal (BFS/DFS), shortest paths, greedy methods, dynamic programming.\n\nStudy tip: practice stating the time AND space cost of every function you write — automatic complexity estimation is the habit that separates strong engineers.',

  BUS101: 'Lesson: Principles of Management — Planning, Leading, Controlling\n\nManagement is getting things done through people. Managers set direction (planning), organize resources (organizing), motivate people (leading), and measure results (controlling) — the four functions that repeat at every level.\n\nKey concepts: the four functions of management, management levels, Mintzberg’s managerial roles, leadership vs management, delegation, and classic theories (Fayol, Weber, Taylor).\n\nStudy tip: for case studies, identify which management function is FAILING before proposing solutions — most organizational problems are breakdowns in one of the four.',
  BUS102: 'Lesson: Financial Accounting — Recording & Reporting\n\nAccounting is the language of business performance. Transactions are recorded as journal entries, posted to ledgers, and summarized into the financial statements that investors and managers rely on.\n\nKey concepts: the accounting equation (Assets = Liabilities + Equity), debits and credits, the full accounting cycle, income statement, balance sheet, cash flow statement, and accrual vs cash basis.\n\nStudy tip: never memorize "debit = left." Instead, ask what the transaction DOES to the account — understanding the equation makes the entries automatic.',
  BUS103: 'Lesson: Business Communication — Writing & Speaking with Impact\n\nProfessional communication is judged by whether the audience acts on it. Clarity, structure, and tone matter more than length — in emails, reports, and presentations alike.\n\nKey concepts: audience analysis, the BLUF structure (bottom line up front), active voice and plain language, email and memo conventions, data storytelling, and adapting message to channel.\n\nStudy tip: rewrite every important message twice: once for completeness, then cut 30% — the second version is always the better one.',
  BUS104: 'Lesson: Marketing Fundamentals — Reaching the Right Customer\n\nMarketing matches what you offer to what people need — profitably. Strategy flows from segmentation and targeting into the four Ps: product, price, place, and promotion.\n\nKey concepts: STP (segmentation, targeting, positioning), the marketing mix (4Ps), consumer behaviour and the buying process, brand equity, and measuring campaigns (KPIs, ROI).\n\nStudy tip: whenever you analyse a brand, name its target segment FIRST — every other marketing decision follows from who it is for.',
  BUS105: 'Lesson: Microeconomics — Choices, Markets & Prices\n\nMicroeconomics explains how individuals and firms make decisions under scarcity, and how prices emerge from the interaction of supply and demand in markets.\n\nKey concepts: opportunity cost, supply and demand and elasticity, consumer and producer surplus, market structures (competition, monopoly, oligopoly), externalities, and government intervention.\n\nStudy tip: draw every model before answering — demand/supply shifts, cost curves, and marginal analysis are almost impossible to reason about without a diagram.',
  BUS106: 'Lesson: Entrepreneurship — From Idea to Business\n\nEntrepreneurship is structured experimentation: find a real problem, test that people will pay for your solution, and build a repeatable business around it before running out of resources.\n\nKey concepts: opportunity recognition, customer discovery and interviews, value proposition, business model canvas, lean startup (build-measure-learn), funding stages, and pitch fundamentals.\n\nStudy tip: talk to ten potential customers before writing a single line of code or a single page of a plan — evidence beats assumptions.',
  BUS107: 'Lesson: Organizational Behavior — People at Work\n\nOrganizational behaviour explains why people act the way they do at work — how motivation, personality, teams, and culture shape performance and satisfaction.\n\nKey concepts: motivation theories (Maslow, Herzberg, expectancy), personality and attitudes, group dynamics and roles, communication, leadership styles, org culture, and conflict resolution.\n\nStudy tip: when diagnosing a workplace scenario, separate INDIVIDUAL causes from SYSTEM causes — the right fix depends on which one you are looking at.',
  BUS108: 'Lesson: Business Statistics — Deciding with Data\n\nBusiness statistics turns raw numbers into decisions: describe what happened, predict what might happen, and quantify how confident you can be in either.\n\nKey concepts: descriptive statistics and visualization, probability for business, sampling and estimation, correlation vs causation, regression basics, forecasting, and hypothesis testing for A/B decisions.\n\nStudy tip: always ask "compared to what?" — a number becomes information only when benchmarked against a baseline, a target, or a competitor.',

  HLT101: 'Lesson: Anatomy & Physiology — The Body as a System\n\nThe body is a set of interconnected systems, each with a structure (anatomy) that explains its function (physiology). Homeostasis — stable internal conditions — is the thread linking all of them.\n\nKey concepts: cell and tissue levels of organization, the integumentary, skeletal, muscular, cardiovascular, respiratory, nervous, and endocrine systems, and homeostatic feedback loops.\n\nStudy tip: learn each system as INPUT → PROCESS → OUTPUT (e.g., lungs: oxygen in, gas exchange, oxygen out) — function sentences then come easily in exams.',
  HLT102: 'Lesson: Public Health — Protecting Populations\n\nPublic health works at the population level: preventing disease, prolonging life, and promoting health through organized societal effort rather than individual clinical care.\n\nKey concepts: epidemiology fundamentals (incidence, prevalence), determinants of health, the ecological model, health promotion and prevention tiers, health policy and systems, and global health challenges.\n\nStudy tip: distinguish INDIVIDUAL risk from POPULATION burden — the two often point in different directions, and confusing them is the classic public health error.',
  HLT103: 'Lesson: Nutrition Fundamentals — Fueling the Body\n\nNutrition is the science of how food becomes energy and tissue. Macronutrients provide fuel and structure; micronutrients enable the reactions; balance and variety keep the system running.\n\nKey concepts: carbohydrates, proteins, and fats (energy values and roles), vitamins and minerals, digestion and absorption, dietary guidelines and MyPlate, energy balance and body weight, and reading nutrition labels.\n\nStudy tip: practice calculating macros from real food labels — label literacy outlasts memorizing any single recommended intake value.',
  HLT104: 'Lesson: Medical Terminology — The Language of Medicine\n\nMedical language is built from Greek and Latin parts: a prefix, a root, and a suffix. Decode the parts and even unfamiliar terms become readable.\n\nKey concepts: roots for body systems, common prefixes (hyper-, hypo-, brady-, tachy-) and suffixes (-itis, -ectomy, -osis, -algia), word construction, and correct pronunciation and spelling.\n\nStudy tip: build word families — learn root cardio- once, then cardiology, cardiac, tachycardia, and cardiomyopathy come for free.',
  HLT105: 'Lesson: Psychology Foundations — Mind & Behaviour\n\nPsychology is the scientific study of behaviour and mental processes. It spans biological mechanisms, learning, memory, development, social influence, and mental disorders.\n\nKey concepts: research methods and ethics, major perspectives (biological, cognitive, behavioural, sociocultural), classical and operant conditioning, memory and cognition, developmental stages, and psychological disorders with their treatments.\n\nStudy tip: for famous experiments, memorize the PROCEDURE, FINDING, and CRITICISM as three bullets — explanations built from that structure always score well.',
  HLT106: 'Lesson: First Aid & Emergency Care — Staying Calm and Effective\n\nFirst aid is immediate, temporary care given before professional help arrives. The priorities are scene safety, calling for help, then addressing life threats in order: breathing, bleeding, circulation.\n\nKey concepts: the emergency response sequence, CPR and AED use, choking response for adults and infants, bleeding control and shock, burns, fractures and sprains, and when to call emergency services.\n\nStudy tip: practise the steps of CPR aloud until they are automatic — in a real emergency, stress removes your ability to read instructions.',
  HLT107: 'Lesson: Research in Health Sciences — Evidence You Can Trust\n\nHealth research is a disciplined search for answers: form a clear question, choose a design that can actually answer it, analyze honestly, and report transparently.\n\nKey concepts: formulating PICO questions, study designs (RCT, cohort, case-control), bias and confounding, sampling and power, literature appraisal, research ethics and informed consent, and writing a proposal.\n\nStudy tip: when reading any study, ask "what else could explain this result?" — that single question is the core of critical appraisal.',
  HLT108: 'Lesson: Epidemiology Basics — Patterns of Disease\n\nEpidemiology watches how disease spreads through populations: who gets sick, where, when, and why — so that outbreaks can be prevented and controlled.\n\nKey concepts: the epidemiologic triad (agent-host-environment), chains of transmission, incidence and prevalence measures, surveillance and outbreak investigation, study designs in action, and prevention levels (primary, secondary, tertiary).\n\nStudy tip: for outbreak scenarios, work the timeline: exposure → incubation → onset → detection → response. The timeline reveals where intervention should have happened.',

  GEN101: 'Lesson: Academic Writing — Argument, Evidence & Structure\n\nAcademic writing makes a claim, supports it with evidence, and anticipates counterargument. A clear thesis drives every paragraph; structure is the reader’s map.\n\nKey concepts: thesis statements, paragraph structure (topic sentence, evidence, analysis), source integration and paraphrasing, citation and avoiding plagiarism, coherence and transitions, and revision strategies.\n\nStudy tip: write your thesis LAST — a thesis that states exactly what the finished essay proves is worth ten drafted before reading your evidence.',
  GEN102: 'Lesson: Communication Skills — Speaking So People Listen\n\nEffective communication adapts message, medium, and delivery to the audience. Whether across a table or on a stage, clarity and confidence are trainable skills.\n\nKey concepts: audience analysis, verbal and non-verbal communication, active listening, presentation structure (hook–message–close), group communication and roles, and giving constructive feedback.\n\nStudy tip: record one practice run of any presentation — the gaps between how you THINK you sound and how you actually sound are exactly what to fix.',
  GEN103: 'Lesson: Critical Thinking — Analysing Arguments Fairly\n\nCritical thinking is disciplined thinking that is clear, accurate, and fair. It means reconstructing an argument at its strongest before judging it, and testing your own beliefs the same way.\n\nKey concepts: identifying premises and conclusions, argument mapping, formal and informal fallacies, evidence quality and credibility, cognitive biases, and steelmanning opposing views.\n\nStudy tip: when you encounter a bad argument, first state it so its defender would say "exactly" — only then respond to it.',
  GEN104: 'Lesson: Research Methods — Finding & Evaluating Sources\n\nResearch is a conversation among scholars. Your job is to find the right voices, evaluate what they say, and position your own contribution within that conversation.\n\nKey concepts: scholarly vs popular sources, database searching and keywords, reading abstracts efficiently, evaluating credibility and recency, literature reviews, synthesis matrices, and annotated bibliographies.\n\nStudy tip: search in rounds — broaden first to learn the vocabulary of the field, then narrow using the terms the experts actually use.',
  GEN105: 'Lesson: Ethics — Reasoning About Right & Wrong\n\nEthics gives us frameworks for thinking about obligations, consequences, and character. Applied ethics takes those frameworks into real dilemmas where good people legitimately disagree.\n\nKey concepts: utilitarianism, deontology, virtue ethics, care ethics, rights-based reasoning, applying frameworks to cases, distinguishing facts from values, and moral responsibility.\n\nStudy tip: run each dilemma through TWO frameworks before concluding — where they disagree is usually where the interesting ethical question actually lives.',
  GEN106: 'Lesson: Presentation Skills — Slides That Support, Not Compete\n\nSlides are visual aids, not scripts. One idea per slide, minimal text, and deliberate delivery turn a presentation from a reading exercise into a persuasive experience.\n\nKey concepts: slide design principles (contrast, alignment, white space), the rule of one-idea-per-slide, chart selection, rehearsal techniques, managing nerves, and handling questions with poise.\n\nStudy tip: design for the BACK ROW: if your audience cannot read it from there, it does not belong on the slide.',
  GEN107: 'Lesson: Digital Literacy — Working Safely Online\n\nDigital literacy is the confident, critical, and safe use of technology — evaluating what you find, protecting what you have, and participating responsibly.\n\nKey concepts: search evaluation and misinformation detection, strong authentication and passwords, phishing and social engineering, privacy settings and data footprints, file management, and digital citizenship.\n\nStudy tip: apply the SIFT method online — Stop, Investigate the source, Find better coverage, Trace claims to the original — before you share anything.',
  GEN108: 'Lesson: Career Development — Planning Your Next Step\n\nCareers are built deliberately: know yourself, know the market, and position yourself where your strengths meet opportunity — then keep iterating.\n\nKey concepts: self-assessment (skills, values, interests), resume and cover-letter writing, interview preparation and STAR answers, networking and LinkedIn, job-search strategy, and professional development planning.\n',
};

const POINTS_BY_TYPE = { assignment: 15, quiz: 10, exam: 25, project: 20 };

async function main() {
  let unitCount = 0;
  let templateCount = 0;

  for (const cat of catalog) {
    const category = await db.studyCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description, color: cat.color },
      create: { name: cat.name, description: cat.description, color: cat.color },
    });

    for (const u of cat.units) {
      const unit = await db.courseUnit.upsert({
        where: { code: u.code },
        update: { name: u.name, credits: u.credits, description: u.description, color: u.color, categoryId: category.id },
        create: {
          code: u.code,
          name: u.name,
          credits: u.credits,
          description: u.description,
          color: u.color,
          categoryId: category.id,
        },
      });
      unitCount++;

      await db.assignmentTemplate.deleteMany({ where: { courseUnitId: unit.id } });
      for (const a of u.assignments) {
        await db.assignmentTemplate.create({
          data: { ...a, points: POINTS_BY_TYPE[a.type] ?? 10, content: LESSONS[u.code] ?? null, courseUnitId: unit.id },
        });
        templateCount++;
      }
    }
  }

  await db.studyCategory.deleteMany({ where: { name: { notIn: catalog.map((c) => c.name) } } });

  console.log(`Seeded ${catalog.length} categories, ${unitCount} course units, ${templateCount} assignment templates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
