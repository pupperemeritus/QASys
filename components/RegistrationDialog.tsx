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
import { useAuth } from "@/hooks/useAuth";
interface RegistrationDialogProps {
    onClose: () => void;
}

const registrationSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must be at most 30 characters")
            .regex(
                /^[a-zA-Z0-9_-]+$/,
                "Username can only contain letters, numbers, underscores, and hyphens"
            ),
        email: z.string().email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegistrationDialog({
    onClose,
}: RegistrationDialogProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
    });
    const [registrationError, setRegistrationError] = useState<string | null>(
        null
    );

    const { signUp, signInWithGoogle } = useAuth();

    const onSubmit = async (data: RegistrationFormData) => {
        try {
            await signUp(data.email, data.password, data.username);
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                setRegistrationError(error.message);
            } else {
                setRegistrationError("Registration failed. Please try again.");
            }
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            await signInWithGoogle();
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                setRegistrationError(error.message);
            } else {
                setRegistrationError("An error occurred during Google sign-up");
            }
        }
    };

    return (
        <Dialog
            open={true}
            onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 text-slate-200 border-slate-800">
                <DialogHeader>
                    <DialogTitle>Register</DialogTitle>
                </DialogHeader>
                <Button
                    onClick={handleGoogleSignUp}
                    className="w-full mb-4 bg-slate-800">
                    Register with Google
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
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                {...register("username")}
                                className="bg-slate-800 text-slate-200 border-slate-700"
                            />
                            {errors.username && (
                                <p className="text-red-500">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>
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
                        <div>
                            <Label htmlFor="confirmPassword">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                                className="bg-slate-800 text-slate-200 border-slate-700"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                        {registrationError && (
                            <p className="text-red-500">{registrationError}</p>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Register</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
