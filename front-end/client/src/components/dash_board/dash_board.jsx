import React, { useEffect, useState } from "react";
import api from "../../api"; // Import the api instance
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./dash_board.css";

const Dashboard = () => {
  // State to store the dashboard data
  const [dashboardData, setDashboardData] = useState({
    total_tasks: 0,
    tasks_completed: 0,
    tasks_pending: 0,
    tasks_in_progress: 0,
  });

  // State to handle loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/api/tasks/dashboard/");
        if (response.status === 200) {
          setDashboardData(response.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare data for the pie chart
  const pieChartData = [
    { name: "Completed", value: dashboardData.tasks_completed },
    { name: "Pending", value: dashboardData.tasks_pending },
    { name: "In Progress", value: dashboardData.tasks_in_progress },
  ];

  // Colors for the pie chart segments
  const COLORS = ["#00C49F", "#FFBB28", "#0088FE"];

  // Custom label renderer to show percentages inside pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    // Calculate the position for the text
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight="bold"
        data-aos="fade-in"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Display loading or error messages
  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Task Dashboard</h1>

      {/* Pie Chart Section */}
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={renderCustomizedLabel}
            >
              {pieChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} tasks`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Section */}
      <div className="dashboard-stats" data-aos="fade-up">
        {/* Total Tasks */}
        <div className="stat-card total-tasks">
          <h2>Total Tasks</h2>
          <p>{dashboardData.total_tasks}</p>
        </div>

        {/* Completed Tasks */}
        <div className="stat-card completed-tasks">
          <h2>Completed Tasks</h2>
          <p>{dashboardData.tasks_completed}</p>
        </div>

        {/* Pending Tasks */}
        <div className="stat-card pending-tasks">
          <h2>Pending Tasks</h2>
          <p>{dashboardData.tasks_pending}</p>
        </div>

        {/* Tasks In Progress */}
        <div className="stat-card in-progress-tasks">
          <h2>Tasks In Progress</h2>
          <p>{dashboardData.tasks_in_progress}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
