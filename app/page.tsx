"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import LoginDialog from "@/components/LoginDialog";
import RegistrationDialog from "@/components/RegistrationDialog";
import PDFUploadDialog from "@/components/PDFUploadDialog";
import { Paperclip, Send } from "lucide-react";
import DOMPurify from "dompurify";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
    getFirestore,
    doc,
    runTransaction,
    onSnapshot,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import FormattedMessage from "@/components/FormattedMessage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_apiKey,
    authDomain: process.env.NEXT_PUBLIC_authDomain,
    projectId: process.env.NEXT_PUBLIC_projectId,
    storageBucket: process.env.NEXT_PUBLIC_storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
    appId: process.env.NEXT_PUBLIC_appId,
    measurementId: process.env.NEXT_PUBLIC_measurementId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
interface Message {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: number;
    status: "sent" | "delivered" | "read" | "error";
}

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
    const [showPDFUploadDialog, setShowPDFUploadDialog] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [guestId, setGuestId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setGuestId(null);
                localStorage.removeItem("guestId");
            } else {
                setUser(null);
                let storedGuestId = localStorage.getItem("guestId");
                if (!storedGuestId) {
                    storedGuestId = uuidv4();
                    localStorage.setItem("guestId", storedGuestId);
                }
                setGuestId(storedGuestId);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const loadMessages = async () => {
            if (user) {
                const userRef = doc(db, "users", user.uid);

                const unsubscribe = onSnapshot(userRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        if (data && data.messages) {
                            // Ensure messages are valid before setting them
                            const validMessages = data.messages.map(
                                (msg: any) => ({
                                    id: msg.id,
                                    content: msg.content,
                                    sender: msg.sender,
                                    timestamp: msg.timestamp,
                                    status: msg.status,
                                })
                            );
                            setMessages(validMessages);
                        }
                    }
                });
                return unsubscribe;
            } else if (guestId) {
                const storedMessages = localStorage.getItem("chatHistory");
                if (storedMessages) {
                    const parsedMessages = JSON.parse(storedMessages).map(
                        (msg: any) => ({
                            id: msg.id,
                            content: msg.content,
                            sender: msg.sender,
                            timestamp: msg.timestamp,
                            status: msg.status,
                        })
                    );
                    setMessages(parsedMessages);
                }
            }
        };

        loadMessages();
    }, [user, guestId, messages]);

    const saveMessages = async (messages: Message[]) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            try {
                await runTransaction(db, async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists()) {
                        throw "Document does not exist!";
                    }
                    transaction.update(userRef, { messages: messages });
                });
                console.log("Transaction successfully committed!");
            } catch (e) {
                console.log("Transaction failed: ", e);
            }
        } else {
            localStorage.setItem("chatHistory", JSON.stringify(messages));
        }
    };
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const sanitizedInput = DOMPurify.sanitize(input);

        const newMessage: Message = {
            id: uuidv4(),
            content: sanitizedInput,
            sender: "user",
            timestamp: Date.now(),
            status: "sent",
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput("");
        saveMessages(updatedMessages);

        try {
            const user = auth.currentUser;
            if (!user) {
                console.error("User not authenticated");
                return;
            }
            const idToken = await user.getIdToken();
            const reqHeaders = new Headers();

            reqHeaders.set("Authorization", `Bearer ${idToken}`);
            reqHeaders.set("Content-Type", "application/json");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FASTAPI_URL}/qa/ask`,
                {
                    method: "POST",
                    headers: reqHeaders,
                    body: JSON.stringify({ question: sanitizedInput }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check if data has the expected structure
            if (typeof data.answer === "object" && data.answer.result) {
                // If the answer is an object with a 'result' property
                const aiMessage: Message = {
                    id: uuidv4(),
                    content:
                        data.answer.result ||
                        "Sorry, I couldn't generate a response.",
                    sender: "ai",
                    timestamp: Date.now(),
                    status: "delivered",
                };
                const finalMessages = [...updatedMessages, aiMessage];
                setMessages(finalMessages);
                saveMessages(finalMessages);
            } else if (typeof data.answer === "string") {
                const aiMessage: Message = {
                    id: uuidv4(),
                    content:
                        data.answer.result ||
                        "Sorry, I couldn't generate a response.",
                    sender: "ai",
                    timestamp: Date.now(),
                    status: "delivered",
                };
                const finalMessages = [...updatedMessages, aiMessage];
                setMessages(finalMessages);
                saveMessages(finalMessages);
            } else {
                console.error("Unexpected response structure:", data);
            }
        } catch (error) {
            console.error("Error fetching answer:", error);
        }
    };

    const handlePDFUpload = async (file: File) => {
        setPdfFile(file);
        setShowPDFUploadDialog(false);
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error("User not authenticated");
                return;
            }
            const idToken = await user.getIdToken();

            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FASTAPI_URL}/pdf/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
        } catch (error) {
            console.error("Error uploading PDF:", error);
        }
    };

    const handleClearHistory = () => {
        setMessages([]);
        saveMessages([]);
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
            <header className="p-4 border-b border-slate-800">
                <div className="w-full max-w-[100%] mx-auto flex justify-between items-center">
                    <div className="w-1/3">
                        {/* Left section for balance */}
                    </div>
                    <h1 className="text-2xl font-bold w-1/3 text-center mx-auto my-auto font-bold text-4xl">
                        Q&A System
                    </h1>
                    <div className="w-1/3 flex justify-end items-center">
                        {user ? (
                            <Button onClick={() => auth.signOut()}>
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setShowLoginDialog(true)}
                                    className="mr-2">
                                    Login
                                </Button>
                                <Button
                                    onClick={() =>
                                        setShowRegistrationDialog(true)
                                    }
                                    className="mr-2">
                                    Register
                                </Button>
                            </>
                        )}
                        <Avatar className="w-8 h-8 mr-2">
                            {user?.photoURL ? (
                                <AvatarImage
                                    src={user.photoURL}
                                    alt={user.displayName || "user"}
                                />
                            ) : (
                                <AvatarFallback className="text-slate-900">
                                    U
                                </AvatarFallback>
                            )}
                        </Avatar>
                    </div>
                </div>
            </header>
            <main className="flex-grow flex flex-col p-4 w-full max-w-[100%] mx-auto overflow-hidden">
                <Card className="flex-grow flex flex-col bg-slate-900 border-slate-800 overflow-hidden">
                    <ScrollArea className="flex-grow p-4 h-full">
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
                                                ? "bg-slate-600 text-slate-200"
                                                : "bg-slate-800 text-slate-200"
                                        }`}>
                                        <FormattedMessage
                                            content={message.content}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                    <CardContent className="p-4 container-2xl sticky bottom-0 bg-slate-900">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full">
                            <div className="flex">
                                <Textarea
                                    placeholder="Ask a question..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    className="grow pr-24 sticky pb-0 float-left col-span-2 bg-slate-800 min-h-fit text-slate-100 border-slate-700 placeholder-slate-400 resize-none"
                                    style={{
                                        height: "auto",
                                        overflow: "hidden",
                                        transition: "height 0.2s ease",
                                    }}
                                />
                                <span className="sticky min-w-fit max-h-fit text-slate-100 w-max px-2 py-2 right-0 col-span-1 grow-0 space-x-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setShowPDFUploadDialog(true)
                                        }
                                        className="h-8 w-8 bg-slate-700 hover:bg-slate-600">
                                        <Paperclip className="w-6 h-6" />
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 bg-slate-700 hover:bg-slate-600">
                                        <Send className="w-6 h-6" />
                                    </Button>
                                </span>
                            </div>
                        </form>
                        <div className="mt-4 flex justify-between items-center">
                            <div>
                                {pdfFile && (
                                    <span className="text-slate-100">
                                        Attached: {pdfFile.name}
                                    </span>
                                )}
                            </div>
                            <Button
                                className="text-slate-100"
                                onClick={handleClearHistory}>
                                Clear Chat History
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
            {showLoginDialog && (
                <LoginDialog onClose={() => setShowLoginDialog(false)} />
            )}
            {showRegistrationDialog && (
                <RegistrationDialog
                    onClose={() => setShowRegistrationDialog(false)}
                />
            )}
            {showPDFUploadDialog && (
                <PDFUploadDialog
                    onUpload={handlePDFUpload}
                    onClose={() => setShowPDFUploadDialog(false)}
                />
            )}
        </div>
    );
}
