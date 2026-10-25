// Career listings. Add, edit or remove objects to change the Careers page.
// "To be confirmed" values are placeholders: replace them once decided.
// Do not add salary, benefits or deadlines until they are confirmed.
const TBC = 'To be confirmed';

export const JOBS = [
  {
    id: 'frontend-react',
    title: 'Frontend Developer — React.js',
    employmentType: TBC,
    arrangement: TBC,
    description: 'Build responsive, accessible interfaces for client websites and web applications.',
    skills: ['React.js', 'JavaScript (ES6+)', 'HTML5 and CSS3', 'Responsive design', 'Git'],
    responsibilities: [
      'Turn designs into clean, reusable React components',
      'Make interfaces responsive and accessible',
      'Connect the frontend to REST APIs',
    ],
    preferred: ['React Router', 'Experience with Vite', 'A portfolio or public projects'],
  },
  {
    id: 'backend-node',
    title: 'Backend Developer — Node.js and Express.js',
    employmentType: TBC,
    arrangement: TBC,
    description: 'Design and build the APIs and server-side logic behind client products.',
    skills: ['Node.js', 'Express.js', 'REST API design', 'Input validation and security basics', 'Git'],
    responsibilities: [
      'Build and maintain REST APIs',
      'Integrate email, file handling and third-party services',
      'Write clear, maintainable server-side code',
    ],
    preferred: ['Experience deploying Node.js services', 'Familiarity with authentication concepts'],
  },
  {
    id: 'full-stack',
    title: 'Full-Stack Developer',
    employmentType: TBC,
    arrangement: TBC,
    description: 'Work across the frontend and backend to deliver complete features for clients.',
    skills: ['React.js', 'Node.js and Express.js', 'JavaScript', 'REST APIs', 'Git'],
    responsibilities: [
      'Build features from interface to API',
      'Review and improve existing code',
      'Communicate progress and questions clearly',
    ],
    preferred: ['Projects you have built end to end', 'Deployment experience'],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Designer',
    employmentType: TBC,
    arrangement: TBC,
    description: 'Design interfaces and user flows that make products clear and enjoyable to use.',
    skills: ['Wireframing and prototyping', 'Visual design', 'Design tools such as Figma', 'User-flow thinking'],
    responsibilities: [
      'Create wireframes, user flows and prototypes',
      'Design responsive layouts and components',
      'Work with developers to ship the design faithfully',
    ],
    preferred: ['A design portfolio', 'Basic understanding of HTML and CSS'],
  },
  {
    id: 'intern',
    title: 'Software Development Intern',
    employmentType: 'Internship',
    arrangement: TBC,
    description: 'Learn by working on real software projects alongside the founders.',
    skills: ['Programming fundamentals', 'Basic web development', 'Willingness to learn'],
    responsibilities: [
      'Help build and test project features',
      'Learn the team workflow, including Git',
      'Ask questions and share progress openly',
    ],
    preferred: ['Small personal or academic projects'],
  },
];

// Shown as a separate card for people who do not see a matching role.
export const GENERAL_APPLICATION = {
  id: 'general',
  title: 'General Application',
};
