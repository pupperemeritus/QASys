import ReactMarkdown from "react-markdown";
import { useState } from "react";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Check, Copy } from "lucide-react";
const CodeBlock: React.FC<{ language: string | null; value: string }> = ({
    language,
    value,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <pre>
                <code className={language ? `language-${language}` : ""}>
                    {value}
                </code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1 rounded bg-slate-900 hover:bg-slate-600 text-slate-200">
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
        </div>
    );
};
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
            components={{
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                        <CodeBlock
                            language={match[1]}
                            value={String(children).replace(/\n$/, "")}
                        />
                    ) : (
                        <code
                            className={className}
                            {...props}>
                            {children}
                        </code>
                    );
                },
                table({ children }) {
                    return (
                        <table className="border-collapse table-auto w-full">
                            {children}
                        </table>
                    );
                },
                th({ children }) {
                    return (
                        <th className="border border-slate-600 px-4 py-2 text-left">
                            {children}
                        </th>
                    );
                },
                td({ children }) {
                    return (
                        <td className="border border-slate-600 px-4 py-2">
                            {children}
                        </td>
                    );
                },
            }}>
            {content}
        </ReactMarkdown>
    );
};

export default FormattedMessage;
