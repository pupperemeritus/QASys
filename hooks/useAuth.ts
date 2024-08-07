import { useState, useEffect } from "react";
import {
    getAuth,
    onAuthStateChanged,
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return unsubscribe;
    }, [auth]);

    const signUp = async (
        email: string,
        password: string,
        username: string
    ) => {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        await updateProfile(userCredential.user, { displayName: username });
        await initializeUserDocument(userCredential.user);
    };

    const signIn = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        await initializeUserDocument(userCredential.user);
    };

    const signOut = () => auth.signOut();

    const initializeUserDocument = async (user: User) => {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
            userRef,
            {
                email: user.email,
                displayName: user.displayName,
                createdAt: new Date(),
                messages: [],
            },
            { merge: true }
        );
    };

    return { user, signUp, signIn, signInWithGoogle, signOut };
}
