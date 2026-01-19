import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Login.css";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.includes("@")) {
            setError("Enter a valid email");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            // 1️⃣ CREATE AUTH USER
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const uid = userCredential.user.uid;

            // 2️⃣ SAVE USER PROFILE
            await setDoc(doc(db, "users", uid), {
                email,
                uid,
                name: "",
                photoURL: "",
                role: "user",
                createdAt: serverTimestamp(),
            });

            // 3️⃣ REDIRECT
            navigate("/");

        } catch (err) {
            console.error(err);

            if (err.code === "auth/email-already-in-use") {
                setError("Email already registered. Please sign in.");
            } else {
                setError("Signup failed. Please try again.");
            }
        }
    };


    // ✅ JSX RETURN (ONLY PLACE IT SHOULD EXIST)
    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">Create account</h1>
                <p className="login-subtitle">Sign up to get started</p>

                <form onSubmit={handleSignup} noValidate>
                    <div className="field">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Create password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button className="login-btn" type="submit">
                        Sign up
                    </button>

                    <div className="signup-text">
                        Already have an account?{" "}
                        <span className="signup-link" onClick={() => navigate("/")}>
                            Sign in
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;
