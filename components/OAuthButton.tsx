import { Button } from "@/components/ui/button";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

interface OAuthButtonProps {
    provider: "google";
    onSuccess: () => void;
    onError: (error: string) => void;
}

export default function OAuthButton({
    provider,
    onSuccess,
    onError,
}: OAuthButtonProps) {
    const handleOAuth = async () => {
        const auth = getAuth();
        let authProvider;

        switch (provider) {
            case "google":
                authProvider = new GoogleAuthProvider();
                break;
            default:
                onError("Unsupported provider");
                return;
        }

        try {
            await signInWithPopup(auth, authProvider);
            onSuccess();
        } catch (error) {
            if (error instanceof Error) {
                onError(error.message);
            } else {
                onError("An unknown error occurred");
            }
        }
    };

    return (
        <Button
            onClick={handleOAuth}
            className="w-full mb-2">
            Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </Button>
    );
}
