// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import LoginDialog from "@/components/LoginDialog";
import PDFUploader from "@/components/PDFUploader";

interface Message {
    id: number;
    content: string;
    sender: "user" | "ai";
}

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [pdfUploaded, setPdfUploaded] = useState(false);

    useEffect(() => {
        const storedMessages = localStorage.getItem("chatHistory");
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            content: input,
            sender: "user",
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput("");

        saveToLocalStorage(updatedMessages);

        try {
            const response = await fetch("PLACEHOLDER_URL/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: input }),
            });
            const data = await response.json();
            const aiMessage: Message = {
                id: Date.now(),
                content: data.answer,
                sender: "ai",
            };
            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);
            saveToLocalStorage(finalMessages);
        } catch (error) {
            console.error("Error fetching answer:", error);
        }
    };

    const saveToLocalStorage = (messages: Message[]) => {
        localStorage.setItem("chatHistory", JSON.stringify(messages));
    };

    const handleLogin = (username: string, password: string) => {
        console.log("Login attempt:", username, password);
        setIsLoggedIn(true);
        setShowLoginDialog(false);
    };

    const handlePDFUpload = (file: File) => {
        console.log("PDF uploaded:", file.name);
        setPdfUploaded(true);
    };

    const handleBypassLogin = () => {
        setIsLoggedIn(true);
        setShowLoginDialog(false);
    };

    const handleClearHistory = () => {
        setMessages([]);
        localStorage.removeItem("chatHistory");
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200">
            <header className="p-4 border-b border-slate-800">
                <div className="w-full max-w-[80%] mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Q&A System</h1>
                    <div>
                        {isLoggedIn ? (
                            <Button onClick={() => setIsLoggedIn(false)}>
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setShowLoginDialog(true)}
                                    className="mr-2">
                                    Login
                                </Button>
                                <Button onClick={handleBypassLogin}>
                                    Continue as Guest
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-grow flex flex-col p-4 w-full max-w-[80%] mx-auto">
                {!pdfUploaded && <PDFUploader onUpload={handlePDFUpload} />}
                <Card className="flex-grow flex flex-col bg-slate-900 border-slate-800">
                    <ScrollArea className="flex-grow p-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                } mb-4`}>
                                <div
                                    className={`flex ${
                                        message.sender === "user"
                                            ? "flex-row-reverse"
                                            : "flex-row"
                                    } items-start`}>
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback>
                                            {message.sender === "user"
                                                ? "U"
                                                : "AI"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`mx-2 p-2 rounded-lg ${
                                            message.sender === "user"
                                                ? "bg-slate-700 text-slate-200"
                                                : "bg-slate-800 text-slate-200"
                                        }`}>
                                        {message.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-end space-x-2">
                            <Textarea
                                placeholder="Ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-grow bg-slate-800 text-slate-200 border-slate-700 placeholder-slate-400"
                            />
                            <Button type="submit">Send</Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleClearHistory}>
                        Clear Chat History
                    </Button>
                </div>
            </main>
            {showLoginDialog && (
                <LoginDialog
                    onLogin={handleLogin}
                    onClose={() => setShowLoginDialog(false)}
                />
            )}
        </div>
    );
}
