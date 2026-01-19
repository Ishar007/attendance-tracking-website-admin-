import React, { useMemo } from "react";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
);

function ActiveUsersChart({ logs }) {
    const chartData = useMemo(() => {
        const map = {};

        logs.forEach((log) => {
            if (!log.date) return;
            map[log.date] = (map[log.date] || 0) + 1;
        });

        return {
            labels: Object.keys(map),
            datasets: [
                {
                    label: "Active Users",
                    data: Object.values(map),
                    borderColor: "#4f46e5",
                    backgroundColor: "rgba(79,70,229,0.2)",
                    tension: 0.4,
                },
            ],
        };
    }, [logs]);

    return (
        <div className="chart-card">
            <h3>Active Users Per Day</h3>
            <Line data={chartData} />
        </div>
    );
}

export default ActiveUsersChart;
