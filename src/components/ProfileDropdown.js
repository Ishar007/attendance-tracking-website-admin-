import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import "./ProfileDropdown.css";

function ProfileDropdown({ userData, close }) {
    const [name, setName] = useState(userData?.name || "");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ✅ LOGOUT
    const handleLogout = async () => {
        close(); // close dropdown
        await signOut(auth);
        navigate("/");
    };

    // ✅ IMAGE UPLOAD
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !auth.currentUser) return;

        setLoading(true);

        try {
            const imageRef = ref(
                storage,
                `profiles/${auth.currentUser.uid}.jpg`
            );

            await uploadBytes(imageRef, file);
            const url = await getDownloadURL(imageRef);

            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                photoURL: url, // STRING URL (correct)
            });

            close();
        } catch (err) {
            console.error("Image upload failed:", err);
        }

        setLoading(false);
    };

    // ✅ SAVE NAME
    const handleSaveName = async () => {
        if (!name.trim() || !auth.currentUser) return;

        setLoading(true);

        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                name,
            });
            close();
        } catch (err) {
            console.error("Name update failed:", err);
        }

        setLoading(false);
    };

    return (
        <div className="profile-dropdown">
            <div className="profile-header">
                <div className="profile-avatar">
                    {userData?.photoURL ? (
                        <img src={userData.photoURL} alt="avatar" />
                    ) : (
                        (userData?.name || userData?.email)
                            ?.charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div className="profile-info">
                    <span className="profile-name">
                        {userData?.name || "Unnamed User"}
                    </span>
                    <span className="profile-email">
                        {userData?.email}
                    </span>
                </div>
            </div>

            <div className="profile-body">
                <label>Display name</label>
                <input
                    type="text"
                    value={name}
                    placeholder="Enter your name"
                    onChange={(e) => setName(e.target.value)}
                />

                <button
                    className="save-btn"
                    onClick={handleSaveName}
                    disabled={loading}
                >
                    Save
                </button>

                <label className="upload-btn">
                    Change photo
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                    />
                </label>

                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default ProfileDropdown;
