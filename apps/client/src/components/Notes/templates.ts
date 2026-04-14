import { Block } from './DocumentEditor';
import { v4 as uuidv4 } from 'uuid';

export interface NoteTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'productivity' | 'study' | 'work' | 'personal';
    blocks: Block[];
    defaultTitle: string;
    defaultTags: string[];
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
    {
        id: 'daily-journal',
        name: 'Daily Journal',
        description: 'Reflect on your day with prompts for gratitude, goals, and notes',
        icon: '📔',
        category: 'personal',
        defaultTitle: 'Journal Entry - ' + new Date().toLocaleDateString(),
        defaultTags: ['journal', 'daily'],
        blocks: [
            {
                id: uuidv4(),
                type: 'heading',
                content: '🌅 Morning Intentions',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>Today I want to focus on:</strong></p><ul><li></li></ul>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📝 Daily Log',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>What happened today...</p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '💭 Reflections',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>What went well:</strong></p><p></p><p><strong>What could be improved:</strong></p><p></p><p><strong>Gratitude:</strong></p><p></p>',
            },
        ],
    },
    {
        id: 'meeting-notes',
        name: 'Meeting Notes',
        description: 'Structured template for capturing meeting discussions and action items',
        icon: '🤝',
        category: 'work',
        defaultTitle: 'Meeting Notes',
        defaultTags: ['meeting', 'work'],
        blocks: [
            {
                id: uuidv4(),
                type: 'heading',
                content: '📅 Meeting Details',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>Date:</strong> ' + new Date().toLocaleDateString() + '</p><p><strong>Attendees:</strong> </p><p><strong>Meeting Type:</strong> </p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '🎯 Agenda',
            },
            {
                id: uuidv4(),
                type: 'checklist',
                content: JSON.stringify([
                    { text: 'Topic 1', checked: false },
                    { text: 'Topic 2', checked: false },
                    { text: 'Topic 3', checked: false },
                ]),
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📝 Notes',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>Key discussion points...</p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '✅ Action Items',
            },
            {
                id: uuidv4(),
                type: 'checklist',
                content: JSON.stringify([
                    { text: 'Action item 1 - Owner', checked: false },
                    { text: 'Action item 2 - Owner', checked: false },
                ]),
            },
        ],
    },
    {
        id: 'study-plan',
        name: 'Study Plan',
        description: 'Organize your study session with goals, resources, and review',
        icon: '📚',
        category: 'study',
        defaultTitle: 'Study Plan - ' + new Date().toLocaleDateString(),
        defaultTags: ['study', 'planning'],
        blocks: [
            {
                id: uuidv4(),
                type: 'heading',
                content: '🎯 Study Goals',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>Subject/Topic:</strong> </p><p><strong>Objectives:</strong></p><ul><li>Objective 1</li><li>Objective 2</li></ul>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '⏰ Schedule',
            },
            {
                id: uuidv4(),
                type: 'table',
                content: '<table><thead><tr><th>Time</th><th>Activity</th><th>Duration</th></tr></thead><tbody><tr><td></td><td></td><td></td></tr></tbody></table>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📖 Study Materials',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<ul><li>Textbook chapter: </li><li>Video tutorial: </li><li>Practice problems: </li></ul>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📝 Key Concepts',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>Summarize what you learned...</p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '❓ Review Questions',
            },
            {
                id: uuidv4(),
                type: 'checklist',
                content: JSON.stringify([
                    { text: 'Can I explain the main concepts?', checked: false },
                    { text: 'Can I solve practice problems?', checked: false },
                    { text: 'Do I need to review anything?', checked: false },
                ]),
            },
        ],
    },
    {
        id: 'todo-list',
        name: 'To-Do List',
        description: 'Simple task list with priorities and due dates',
        icon: '✅',
        category: 'productivity',
        defaultTitle: 'To-Do List',
        defaultTags: ['todo', 'tasks'],
        blocks: [
            {
                id: uuidv4(),
                type: 'heading',
                content: '🔥 High Priority',
            },
            {
                id: uuidv4(),
                type: 'checklist',
                content: JSON.stringify([
                    { text: 'Task 1', checked: false },
                    { text: 'Task 2', checked: false },
                ]),
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📋 Medium Priority',
            },
            {
                id: uuidv4(),
                type: 'checklist',
                content: JSON.stringify([
                    { text: 'Task 1', checked: false },
                    { text: 'Task 2', checked: false },
                ]),
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📌 Low Priority',
            },
            {
                id: uuidv4(),
                type: 'checklist',
                content: JSON.stringify([
                    { text: 'Task 1', checked: false },
                    { text: 'Task 2', checked: false },
                ]),
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>Notes:</strong></p><p>Add any additional notes here...</p>',
            },
        ],
    },
    {
        id: 'project-brief',
        name: 'Project Brief',
        description: 'Define project scope, goals, and timeline',
        icon: '🚀',
        category: 'work',
        defaultTitle: 'Project Brief',
        defaultTags: ['project', 'planning'],
        blocks: [
            {
                id: uuidv4(),
                type: 'heading',
                content: '📋 Project Overview',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>Project Name:</strong> </p><p><strong>Start Date:</strong> </p><p><strong>Target Completion:</strong> </p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '🎯 Goals & Objectives',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<ul><li>Goal 1</li><li>Goal 2</li><li>Goal 3</li></ul>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '👥 Team & Stakeholders',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>Project Lead:</strong> </p><p><strong>Team Members:</strong> </p><p><strong>Stakeholders:</strong> </p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📊 Key Deliverables',
            },
            {
                id: uuidv4(),
                type: 'checklist',
                content: JSON.stringify([
                    { text: 'Deliverable 1 - Due date', checked: false },
                    { text: 'Deliverable 2 - Due date', checked: false },
                    { text: 'Deliverable 3 - Due date', checked: false },
                ]),
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '⚠️ Risks & Considerations',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>List potential risks and mitigation strategies...</p>',
            },
        ],
    },
    {
        id: 'research-notes',
        name: 'Research Notes',
        description: 'Structure for academic research and source documentation',
        icon: '🔬',
        category: 'study',
        defaultTitle: 'Research Notes',
        defaultTags: ['research', 'academic'],
        blocks: [
            {
                id: uuidv4(),
                type: 'heading',
                content: '📚 Source Information',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>Title:</strong> </p><p><strong>Author(s):</strong> </p><p><strong>Publication:</strong> </p><p><strong>Date:</strong> </p><p><strong>URL/DOI:</strong> </p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📝 Summary',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>Brief overview of the source...</p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '💡 Key Findings',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<ul><li>Finding 1</li><li>Finding 2</li><li>Finding 3</li></ul>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '🤔 Critical Analysis',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>Your thoughts, critiques, and connections to other sources...</p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '🔗 Related Notes',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>Link to related notes using [[Note Name]]</p>',
            },
        ],
    },
    {
        id: 'weekly-review',
        name: 'Weekly Review',
        description: 'Review your week and plan for the next',
        icon: '🗓️',
        category: 'productivity',
        defaultTitle: 'Weekly Review - Week of ' + new Date().toLocaleDateString(),
        defaultTags: ['weekly', 'review', 'planning'],
        blocks: [
            {
                id: uuidv4(),
                type: 'heading',
                content: '🏆 Wins This Week',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<ul><li>Accomplishment 1</li><li>Accomplishment 2</li><li>Accomplishment 3</li></ul>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📊 Progress Check',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>Goals progress:</strong></p><ul><li>Goal 1: % complete</li><li>Goal 2: % complete</li></ul>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '🤔 Challenges Faced',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>What obstacles came up and how you handled them...</p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '🎯 Next Week Priorities',
            },
            {
                id: uuidv4(),
                type: 'checklist',
                content: JSON.stringify([
                    { text: 'Priority 1', checked: false },
                    { text: 'Priority 2', checked: false },
                    { text: 'Priority 3', checked: false },
                ]),
            },
        ],
    },
    {
        id: 'book-notes',
        name: 'Book Notes',
        description: 'Capture key insights from books you read',
        icon: '📖',
        category: 'personal',
        defaultTitle: 'Book Notes',
        defaultTags: ['books', 'reading'],
        blocks: [
            {
                id: uuidv4(),
                type: 'heading',
                content: '📚 Book Information',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p><strong>Title:</strong> </p><p><strong>Author:</strong> </p><p><strong>Started:</strong> </p><p><strong>Finished:</strong> </p><p><strong>Rating:</strong> ⭐⭐⭐⭐⭐</p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📝 Summary',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>Main ideas and plot summary...</p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '💎 Key Takeaways',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<ul><li>Key point 1</li><li>Key point 2</li><li>Key point 3</li></ul>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '📌 Favorite Quotes',
            },
            {
                id: uuidv4(),
                type: 'quote',
                content: '<p>"Insert quote here"</p><p>— Author</p>',
            },
            {
                id: uuidv4(),
                type: 'divider',
                content: '',
            },
            {
                id: uuidv4(),
                type: 'heading',
                content: '🤔 Personal Reflection',
            },
            {
                id: uuidv4(),
                type: 'richText',
                content: '<p>How this book impacted you...</p>',
            },
        ],
    },
];

export const getTemplateById = (id: string): NoteTemplate | undefined => {
    return NOTE_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: NoteTemplate['category']): NoteTemplate[] => {
    return NOTE_TEMPLATES.filter(template => template.category === category);
};