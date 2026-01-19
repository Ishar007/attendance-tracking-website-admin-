import React, { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

function Dashboard() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "attendanceLogs"),
            orderBy("loginTime", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const latestPerUser = new Map();

            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (!latestPerUser.has(data.uid)) {
                    latestPerUser.set(data.uid, {
                        id: doc.id,
                        ...data,
                    });
                }
            });

            setLogs([...latestPerUser.values()]);
        });

        return () => unsub();
    }, []);

    const activeCount = logs.filter(l => !l.logoutTime).length;

    const getDuration = (login, logout) => {
        if (!login) return "-";
        if (!logout) return "Active";
        const diff = logout.toDate() - login.toDate();
        const mins = Math.floor(diff / 60000);
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    return (
        <>
            <Navbar />

            <div className="dashboard-page">
                <div className="dashboard-header">
                    <h1>App User Attendance</h1>
                    <span className="active-badge">
                        🟢 {activeCount} Active
                    </span>
                </div>

                {/* 📊 CHART */}
                

                {/* 📋 TABLE */}
                <div className="table-card">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Login</th>
                                <th>Logout</th>
                                <th>Duration</th>
                                <th>Location</th>
                            </tr>
                        </thead>

                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <span className={`status-pill ${log.logoutTime ? "out" : "active"}`}>
                                            {log.logoutTime ? "Logged out" : "Active"}
                                        </span>
                                    </td>

                                    <td>{log.name || "—"}</td>
                                    <td>{log.email}</td>

                                    <td>{log.loginTime?.toDate().toLocaleString()}</td>
                                    <td>{log.logoutTime ? log.logoutTime.toDate().toLocaleString() : "—"}</td>

                                    <td>{getDuration(log.loginTime, log.logoutTime)}</td>

                                    <td>
                                        {log.location?.lat
                                            ? `${log.location.lat.toFixed(4)}, ${log.location.lng.toFixed(4)}`
                                            : "Not shared"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
