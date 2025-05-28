/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import type { Chart } from "chart.js";
import { CustomTooltip } from "./ToolTip";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Demo data
const YEARS = ["2020", "2021", "2022", "2023", "2024", "2025"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type BarDatum = { percent: number; value: number };

// Random data for demo
const randomBarData = (length: number): BarDatum[] =>
	Array.from({ length }, () => {
		const percent = Number((Math.random() * 40 - 20).toFixed(1)); // -20% to +20%
		const value = Math.floor(Math.random() * 200000) - 100000; // -100,000 to +100,000
		return { percent, value };
	});

const DrillDownChart = () => {
	const [view, setView] = useState<"years" | "months">("years");
	const [selectedYear, setSelectedYear] = useState<string | null>(null);
	const chartRef = useRef<Chart<"bar"> | null>(null);

	const [barData, setBarData] = useState<BarDatum[]>(randomBarData(YEARS.length));
	const [chartData, setChartData] = useState({
		labels: YEARS,
		datasets: [
			{
				label: "Performance (%)",
				data: barData.map((d) => d.percent),
				backgroundColor: "rgb(140, 217, 212)",
				barThickness: 50,
			},
		],
	});

	const handleBarClick = (event: import("chart.js").ChartEvent, elements: import("chart.js").ActiveElement[]) => {
		if (elements && elements.length > 0) {
			const index = elements[0].index;
			if (view === "years") {
				const year = YEARS[index];
				setSelectedYear(year);
				const newBarData = randomBarData(MONTHS.length);
				setBarData(newBarData);
				setChartData({
					labels: MONTHS,
					datasets: [
						{
							label: `Performance per ${year} (%)`,
							data: newBarData.map((d) => d.percent),
							backgroundColor: "rgb(140, 217, 212)",
							barThickness: 50,
						},
					],
				});
				setView("months");
			}
		}
	};

	const handleBack = () => {
		const newBarData = randomBarData(YEARS.length);
		setBarData(newBarData);
		setChartData({
			labels: YEARS,
			datasets: [
				{
					label: "Total Performance (%)",
					data: newBarData.map((d) => d.percent),
					backgroundColor: "rgb(140, 217, 212)",
					barThickness: 50,
				},
			],
		});
		setView("years");
		setSelectedYear(null);
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: true,
		scales: {
			x: {
				grid: { display: false },
				ticks: {
					color: "#A4ABB2",
					font: {
						family: "Montserrat, sans-serif",
						size: 14,
						weight: 500,
						lineHeight: 1.5,
					},
				},
			},
			y: {
				grid: {
					display: true,
					color: "rgb(247, 248, 249)",
					borderColor: "rgb(247, 248, 249)",
				},
				beginAtZero: false,
				min: -20,
				max: 20,
				ticks: {
					font: {
						family: "Montserrat, sans-serif",
						size: 14,
						weight: 500,
						lineHeight: 1.5,
					},
					color: "#A4ABB2",
					callback: function (tickValue: string | number) {
						return `${tickValue}%`;
					},
				},
			},
		},
		onClick: handleBarClick,
		plugins: {
			legend: { display: false },
			title: {
				display: true,
				text: view === "years" ? "Performance over last five years" : `Performance in ${selectedYear}`,
				font: {
					family: "Montserrat, sans-serif",
					size: 14,
					weight: 500,
					lineHeight: 1.5,
				},
			},
			tooltip: {
				enabled: false,
				external: (context: any) => {
					(context.chart as any)._barData = barData;
					CustomTooltip(context);
				},
			},
		},
	};

	React.useEffect(() => {
		return () => {
			const el = document.getElementById("chartjs-custom-tooltip");
			if (el) el.remove();
		};
	}, []);

	return (
		<div style={{ height: 400 }} className="w-full">
			{view === "months" && (
				<button onClick={handleBack} style={{ marginBottom: 10, color: "white", backgroundColor: "#4A90E2", padding: "5px 10px", borderRadius: 5 }}>
					5 Years
				</button>
			)}
			<Bar ref={chartRef} data={chartData} options={chartOptions} />
		</div>
	);
};

export default DrillDownChart;
