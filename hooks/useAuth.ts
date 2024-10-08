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
import { v4 as uuidv4 } from "uuid";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [guestId, setGuestId] = useState<string | null>(null);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
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

    return { user, guestId, signUp, signIn, signInWithGoogle, signOut };
}
