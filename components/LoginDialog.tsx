// components/LoginDialog.tsx
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    getAuth,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";

interface LoginDialogProps {
    onClose: () => void;
}

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginDialog({ onClose }: LoginDialogProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });
    const [loginError, setLoginError] = useState<string | null>(null);

    const onSubmit = async (data: LoginFormData) => {
        try {
            const auth = getAuth();
            await signInWithEmailAndPassword(auth, data.email, data.password);
            onClose();
        } catch (error) {
            setLoginError("Invalid email or password");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const auth = getAuth();
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                setLoginError(error.message);
            } else {
                setLoginError("An error occurred during Google sign-in");
            }
        }
    };

    return (
        <Dialog
            open={true}
            onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 text-slate-200 border-slate-800">
                <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                </DialogHeader>
                <Button
                    onClick={handleGoogleSignIn}
                    className="w-full mb-4 bg-slate-800">
                    Sign in with Google
                </Button>
                <div className="relative mb-4">
                    <hr className="border-slate-700" />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-slate-400">
                        or
                    </span>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                className="bg-slate-800 text-slate-200 border-slate-700"
                            />
                            {errors.email && (
                                <p className="text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                className="bg-slate-800 text-slate-200 border-slate-700"
                            />
                            {errors.password && (
                                <p className="text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        {loginError && (
                            <p className="text-red-500">{loginError}</p>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Login</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
