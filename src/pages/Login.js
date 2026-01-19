import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
    addDoc,
    collection,
    serverTimestamp,
    doc,
    getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // ✅ CLEAR INPUTS ON PAGE LOAD
    useEffect(() => {
        setEmail("");
        setPassword("");
        setError("");
        setLoading(false);
    }, []);

    // 📍 GET LOCATION
    const getLocation = () =>
        new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject();

            navigator.geolocation.getCurrentPosition(
                (pos) =>
                    resolve({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    }),
                () => reject()
            );
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setError("");
        setLoading(true);

        if (!email || !password) {
            setError("Please enter email and password");
            setLoading(false);
            return;
        }

        try {
            // 🔐 LOGIN
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            // 🔎 FETCH USER ROLE
            const userRef = doc(db, "users", result.user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                throw new Error("User profile not found");
            }

            const userData = userSnap.data();

            // 📍 LOCATION (OPTIONAL)
            let location = null;
            try {
                location = await getLocation();
            } catch {
                location = null;
            }

            // 📝 LOG ATTENDANCE ONLY FOR NORMAL USERS
            if (userData.role === "user") {
                await addDoc(collection(db, "attendanceLogs"), {
                    uid: result.user.uid,
                    email: result.user.email,
                    name: userData.name || "",
                    role: userData.role,
                    loginTime: serverTimestamp(),
                    logoutTime: null,
                    date: new Date().toDateString(),
                    location,
                    createdAt: serverTimestamp(),
                });
            }

            // 🚀 REDIRECT
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">Login</h1>

                <form onSubmit={handleSubmit} noValidate autoComplete="off">
                    <div className="field">
                        <label>Email</label>
                        <input
                            type="email"
                            autoComplete="new-email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button
                        className="login-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <div className="signup-text">
                        Don't have an account?{" "}
                        <span
                            className="signup-link"
                            onClick={() => navigate("/signup")}
                        >
                            Sign up
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
