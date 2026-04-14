// Editor integration utilities
export const SUPPORTED_LANGUAGES = [
    { id: "javascript", label: "JavaScript" },
    { id: "typescript", label: "TypeScript" },
    { id: "python", label: "Python" },
    { id: "java", label: "Java" },
    { id: "csharp", label: "C#" },
    { id: "cpp", label: "C++" },
    { id: "go", label: "Go" },
    { id: "rust", label: "Rust" },
    { id: "php", label: "PHP" },
    { id: "ruby", label: "Ruby" },
    { id: "swift", label: "Swift" },
    { id: "kotlin", label: "Kotlin" },
    { id: "sql", label: "SQL" },
    { id: "html", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "scss", label: "SCSS" },
    { id: "json", label: "JSON" },
    { id: "yaml", label: "YAML" },
    { id: "xml", label: "XML" },
    { id: "markdown", label: "Markdown" },
    { id: "bash", label: "Bash" },
    { id: "shell", label: "Shell" },
    { id: "powershell", label: "PowerShell" },
];

export function getLanguageLabel(languageId: string): string {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.id === languageId);
    return language?.label || languageId;
}

export function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
}

export function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}
