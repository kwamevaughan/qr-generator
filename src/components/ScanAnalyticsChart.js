import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ScanAnalyticsChart = ({ scanData }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Number of Scans',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    });

    useEffect(() => {
        const scanCounts = scanData.reduce((acc, scan) => {
            const date = new Date(scan.scanned_at).toLocaleDateString(); // Group by date
            acc[date] = (acc[date] || 0) + 1; // Increment count
            return acc;
        }, {});

        setChartData({
            labels: Object.keys(scanCounts),
            datasets: [
                {
                    label: 'Number of Scans',
                    data: Object.values(scanCounts),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                },
            ],
        });
    }, [scanData]);

    return (
        <div className="mt-4">
            <Bar data={chartData} />
        </div>
    );
};

export default ScanAnalyticsChart;
