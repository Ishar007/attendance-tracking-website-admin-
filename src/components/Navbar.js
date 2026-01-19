import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
    doc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const user = auth.currentUser;

    const [userData, setUserData] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        const unsub = onSnapshot(
            doc(db, "users", user.uid),
            (snap) => {
                if (snap.exists()) {
                    console.log("USER DATA:", snap.data());
                    setUserData(snap.data());
                }
            }
        );

        return () => unsub();
    }, [user]);

    const handleLogout = async () => {
        try {
            if (!auth.currentUser) return;

            // 🔍 Find active session
            const q = query(
                collection(db, "attendanceLogs"),
                where("uid", "==", auth.currentUser.uid),
                where("logoutTime", "==", null)
            );

            const snapshot = await getDocs(q);

            // 📝 Update logoutTime
            snapshot.forEach(async (docSnap) => {
                await updateDoc(docSnap.ref, {
                    logoutTime: serverTimestamp(),
                });
            });

            // 🔐 Sign out
            await signOut(auth);

            // 🚀 Redirect to login
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };


    return (
        <nav className="navbar">
            <div className="navbar-left">
                <span className="brand">Geo Attendance</span>
            </div>


            <ul className="listing">
                <li className="listing-1">
                    <a className="dashboard" aria-current="page" href="/"> Dashboard</a>
                </li>

                <li className="listing-1">
                    <a className="about" aria-current="page" href="/"> About</a>
                </li>
            </ul>



            <div className="navbar-right">



                {user && (
                    <>
                        <div
                            className="profile"
                            onClick={() => setOpen((prev) => !prev)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="avatar">
                                {userData?.photoURL ? (
                                    <img
                                        src={userData.photoURL}
                                        alt="avatar"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <span>
                                        {(userData?.name || user.email)
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <span className="email">
                                {userData?.name || user.email}
                            </span>
                        </div>

                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>

                        {open && userData && (
                            <ProfileDropdown
                                userData={userData}
                                close={() => setOpen(false)}
                            />
                        )}
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
