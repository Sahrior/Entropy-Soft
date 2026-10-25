import { Search, Wrench, MessageSquare, MessageCircle, Target, Cpu, Smartphone, Braces, Users } from 'lucide-react';

export const SITE = {
  name: 'Entropy Soft',
  email: 'entropysoft101@gmail.com',
  whatsappNumber: '8801880392004',
};

export const whatsappUrl = (message = "Hello Entropy Soft! I'm interested in discussing a software project.") =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;

// Add real profiles here only when they exist: { label: 'LinkedIn', url: 'https://...' }
// The footer shows social links only when this list is not empty.
export const SOCIAL_LINKS = [];

export const SERVICE_OPTIONS = [
  'Website Development',
  'Web Application',
  'Custom Software',
  'UI/UX Design',
  'Frontend Development',
  'Backend / API Development',
  'Other',
];

// Must match the list in backend/utils/validators.js
export const BUDGET_OPTIONS = [
  'Under $500',
  '$500 – $1,000',
  '$1,000 – $3,000',
  '$3,000 – $10,000',
  '$10,000+',
  'Not sure yet',
];

export const PRINCIPLES = [
  { icon: Search, title: 'Understand the need first', text: 'We ask questions before we write code, so we build the right thing.' },
  { icon: Wrench, title: 'Build practical, maintainable solutions', text: 'Clear structure and clean code that you or the next developer can work with.' },
  { icon: MessageSquare, title: 'Put usability and communication first', text: 'Interfaces people can use without a manual, and updates you can follow.' },
];

export const PROCESS_STEPS = [
  { number: '01', title: 'Discover', text: "Understand the client's goals, requirements, audience, and problems." },
  { number: '02', title: 'Plan and Design', text: 'Define the scope, structure, user experience, and technical approach.' },
  { number: '03', title: 'Develop', text: 'Build the solution with maintainable code, responsive interfaces, and appropriate testing.' },
  { number: '04', title: 'Deliver and Improve', text: 'Deploy the solution, collect feedback, fix issues, and provide any agreed follow-up support.' },
];

export const WHY_US = [
  { icon: MessageCircle, title: 'Direct communication', text: 'You talk to the developers building your product, not a layer of account managers.' },
  { icon: Target, title: 'Tailored to your requirements', text: 'We design around your workflow and goals instead of forcing a template.' },
  { icon: Cpu, title: 'Modern technologies', text: 'React, Node.js and Express, chosen for what fits the project.' },
  { icon: Smartphone, title: 'Responsive, user-focused interfaces', text: 'Layouts that work on phones, tablets and desktops.' },
  { icon: Braces, title: 'Code quality and maintainability', text: 'Readable, organised code that can grow with your needs.' },
  { icon: Users, title: 'Collaborative revisions', text: 'Feedback is part of the process, and revisions are handled openly.' },
];

export const FAQS = [
  {
    q: 'What types of software does Entropy Soft build?',
    a: 'Websites, web applications, custom software for specific workflows, UI/UX designs, and the frontend and backend (including APIs) behind them.',
  },
  {
    q: 'How can I request a project?',
    a: 'Send us a message on the Contact page or on WhatsApp. Describe what you want to build or the problem you want to solve, and we will reply.',
  },
  {
    q: 'How does the development process work?',
    a: 'We start by understanding your goals, then plan and design, build, and finally deliver and improve based on your feedback. Details depend on the project.',
  },
  {
    q: 'Can I request a custom solution?',
    a: 'Yes. Custom solutions built around your own workflow are a core part of what we offer.',
  },
  {
    q: 'How can I contact the team?',
    a: `Use the form on the Contact page, message us on WhatsApp, or email ${SITE.email}.`,
  },
];
