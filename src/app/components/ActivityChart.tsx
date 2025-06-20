/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import type { Chart } from "chart.js";
import { CustomTooltip } from "./ToolTipActivity";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const YEARS = ["2021", "2022", "2023", "2024", "2025"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FUNDS = [
	{ name: "Prescient Core Equity Fund A2", color: "#7DE2D1" },
	{ name: "Fairtree Global Equity Feeder Fund A3", color: "#47B8C2" },
	{ name: "27four Shari'ah Income Fund A1", color: "#008B9A" },
	{ name: "Fairtree Global Equity Prescient Feeder Fund A3", color: "#005F73" },
];

type BarDatum = Record<string, number>; // fund name -> value

const generateRandomFundData = (numBars: number): BarDatum[] =>
	Array.from({ length: numBars }, () => {
		const entry: BarDatum = {};
		FUNDS.forEach((fund) => {
			entry[fund.name] = Math.floor(Math.random() * 200000);
		});
		return entry;
	});

const buildChartData = (labels: string[], data: BarDatum[]) => ({
	labels,
	datasets: FUNDS.map((fund) => ({
		label: fund.name,
		data: data.map((bar) => bar[fund.name]),
		backgroundColor: fund.color,
		stack: "combined",
		barThickness: 40,
		borderSkipped: false,
		borderWidth: { top: 4, right: 0, bottom: 0, left: 0 },
		borderColor: "#ffffff",
	})),
});

const ActivityChart = () => {
	const [dateRange, setDateRange] = useState<"1y" | "5y">("1y");
	const labels = dateRange === "1y" ? MONTHS : YEARS;
	const chartRef = useRef<Chart<"bar"> | null>(null);

	const initialVisibility = FUNDS.reduce<Record<string, boolean>>((acc, fund) => {
		acc[fund.name] = true;
		return acc;
	}, {});

	const [fundVisibility, setFundVisibility] = useState(initialVisibility);

	const handleToggleFund = (label: string) => {
		if (!chartRef.current) return;

		const chart = chartRef.current;
		const dataset = chart.data.datasets.find((ds) => ds.label === label);
		if (!dataset) return;

		dataset.hidden = !dataset.hidden;
		setFundVisibility((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
		chart.update();
	};

	const [barData, setBarData] = useState<BarDatum[]>(() => generateRandomFundData(labels.length));
	const [chartData, setChartData] = useState(() => buildChartData(labels, barData));

	const handleRangeChange = (range: "1y" | "5y") => {
		const newLabels = range === "1y" ? MONTHS : YEARS;
		const newData = generateRandomFundData(newLabels.length);
		setBarData(newData);
		setChartData(buildChartData(newLabels, newData));
		setDateRange(range);
	};

	useEffect(() => {
		return () => {
			const el = document.getElementById("chartjs-custom-tooltip");
			if (el) el.remove();
		};
	}, []);

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: true,
		scales: {
			x: {
				stacked: true,
				grid: { display: false },
				ticks: {
					color: "#A4ABB2",
					font: {
						family: "Montserrat, sans-serif",
						size: 14,
						weight: 500,
					},
				},
			},
			y: {
				stacked: true,
				grid: {
					display: true,
					color: "rgb(247, 248, 249)",
				},
				beginAtZero: true,
				ticks: {
					font: {
						family: "Montserrat, sans-serif",
						size: 14,
						weight: 500,
					},
					color: "#A4ABB2",
					callback: function (tickValue: string | number) {
						return `R${(+tickValue / 1000).toFixed(0)}K`;
					},
				},
			},
		},
		plugins: {
			legend: { display: false },
			title: {
				display: true,
				text: `Investment Value (${dateRange === "1y" ? "1 Year" : "5 Years"})`,
				font: {
					family: "Montserrat, sans-serif",
					size: 14,
					weight: 500,
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

	return (
		<div className="w-full space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-white text-lg font-semibold">Total Investment Value</h2>
				<div className="space-x-2">
					<button
						className={`px-3 py-1 rounded-full ${dateRange === "5y" ? "bg-cyan-500 text-white" : "bg-gray-200 text-gray-700"}`}
						onClick={() => handleRangeChange("5y")}
					>
						5 years
					</button>
					<button
						className={`px-3 py-1 rounded-full ${dateRange === "1y" ? "bg-cyan-500 text-white" : "bg-gray-200 text-gray-700"}`}
						onClick={() => handleRangeChange("1y")}
					>
						1 year
					</button>
				</div>
			</div>
			<Bar ref={chartRef} data={chartData} options={chartOptions} />

			<div className="mt-4 grid grid-cols-3 gap-4 bg-gray-100 p-4">
				{FUNDS.map((fund) => {
					const isHidden = !fundVisibility[fund.name];
					return (
						<button
							key={fund.name}
							onClick={() => handleToggleFund(fund.name)}
							className={`flex items-center text-left gap-2 px-3 py-1 rounded-full text-sm transition ${isHidden ? "opacity-40" : "bg-transparent "}`}
						>
							<span className="w-3 h-3" style={{ backgroundColor: fund.color }}></span>
							<span className={`${isHidden ? "line-through" : ""}`}>{fund.name}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default ActivityChart;
