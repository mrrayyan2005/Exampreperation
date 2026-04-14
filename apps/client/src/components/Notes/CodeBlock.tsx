import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, copyToClipboard } from "@/lib/editor-utils";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // Dark theme
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-markdown";

interface CodeBlockProps {
    content: string;
    language?: string;
    onContentChange: (content: string) => void;
    onLanguageChange: (language: string) => void;
}

export function CodeBlock({
    content,
    language = "javascript",
    onContentChange,
    onLanguageChange
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await copyToClipboard(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy code:", error);
        }
    };

    const highlightCode = (code: string) => {
        // Fallback to plain text if language not found
        const grammer = Prism.languages[language] || Prism.languages.javascript;
        return Prism.highlight(code, grammer, language);
    };

    return (
        <div className="mb-6 group relative">
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={onLanguageChange}>
                        <SelectTrigger className="w-32 h-8 text-xs bg-muted/50 border-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <SelectItem key={lang.id} value={lang.id}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
            </div>

            <div className="bg-[#1d1f21] rounded-lg overflow-hidden border border-border/40 shadow-sm relative">
                <Editor
                    value={content}
                    onValueChange={onContentChange}
                    highlight={highlightCode}
                    padding={16}
                    className="font-mono text-sm leading-relaxed"
                    style={{
                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                        fontSize: 14,
                        minHeight: '100px',
                    }}
                    textareaClassName="focus:outline-none"
                    placeholder="Enter your code here..."
                />
            </div>
        </div>
    );
}
