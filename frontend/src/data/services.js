import {
  Globe, AppWindow, Workflow, PenTool, Code, Server,
  Building2, ShoppingCart, Cloud, GraduationCap, Trophy, LayoutTemplate, CalendarCheck, ClipboardList,
} from 'lucide-react';

export const SERVICES = [
  {
    icon: Globe,
    title: 'Website Development',
    description: 'Fast, responsive websites that present your business clearly.',
    items: ['Business websites', 'Agency and portfolio websites', 'Landing pages', 'Responsive multi-page websites'],
  },
  {
    icon: AppWindow,
    title: 'Web Application Development',
    description: 'Interactive applications for the tasks your business does every day.',
    items: ['Interactive web applications', 'Custom dashboards and management interfaces', 'Client-specific business tools', 'Frontend and backend integration'],
  },
  {
    icon: Workflow,
    title: 'Custom Software Solutions',
    description: 'Software shaped around how your team actually works.',
    items: ['Tools designed around your workflow', 'Automation of repetitive tasks', 'Tailored digital tools'],
  },
  {
    icon: PenTool,
    title: 'UI/UX Design',
    description: 'Interfaces that are clear to use and good to look at.',
    items: ['Website and application interface design', 'User flows and wireframes', 'Interactive prototypes', 'User-focused visual design'],
  },
  {
    icon: Code,
    title: 'Frontend Development',
    description: 'Modern interfaces that stay fast and easy to maintain.',
    items: ['React-based interfaces', 'Responsive layouts', 'Interactive components and animations', 'Performance and usability improvements'],
  },
  {
    icon: Server,
    title: 'Backend and API Development',
    description: 'The server-side logic that makes your product work.',
    items: ['REST API development', 'Server-side application logic', 'Form and file-processing systems', 'Integration with external services'],
  },
];

export const PROJECT_TYPES = [
  { icon: Building2, title: 'Business and corporate websites' },
  { icon: ShoppingCart, title: 'E-commerce websites' },
  { icon: Cloud, title: 'SaaS platforms' },
  { icon: GraduationCap, title: 'Educational platforms' },
  { icon: Trophy, title: 'Tournament and event management platforms' },
  { icon: LayoutTemplate, title: 'Portfolio websites' },
  { icon: CalendarCheck, title: 'Booking and appointment systems' },
  { icon: ClipboardList, title: 'Custom management systems' },
];
