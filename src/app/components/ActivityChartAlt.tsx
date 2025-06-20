/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import type { Chart } from "chart.js";
import { CustomTooltip } from "./ToolTipActivity";
import type { ChartData } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS_RANGE = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];

const FUNDS = [
	{ name: "Prescient Core Equity Fund A2", color: "#7DE2D1" },
	{ name: "Fairtree Global Equity Feeder Fund A3", color: "#47B8C2" },
	{ name: "27four Shari'ah Income Fund A1", color: "#008B9A" },
	{ name: "Fairtree Global Equity Prescient Feeder Fund A3", color: "#005F73" },
	{ name: "Prescient Global Equity Fund A2", color: "#0A9396" },
	{ name: "Prescient Global Equity Feeder Fund A2", color: "#b7e7e4" },
];

type BarDatum = Record<string, number>;

const generateRandomFundData = (numBars: number): BarDatum[] =>
	Array.from({ length: numBars }, () => {
		const entry: BarDatum = {};
		FUNDS.forEach((fund) => {
			entry[fund.name] = Math.floor(Math.random() * 200000);
		});
		return entry;
	});

const generateMonthLabels = (startYear: number, numMonths: number): string[] => {
	const months: string[] = [];
	for (let i = 0; i < numMonths; i++) {
		const date = new Date(startYear, i);
		const month = date.toLocaleString("default", { month: "short" });
		const year = date.getFullYear();
		months.push(`${month} ${year}`);
	}
	return months;
};

function debounce(fn: (...args: unknown[]) => void, delay: number) {
	let timeoutId: NodeJS.Timeout;
	return (...args: unknown[]) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

const buildChartData = (labels: string[], data: BarDatum[], barThickness: number) => ({
	labels,
	datasets: FUNDS.map((fund) => ({
		label: fund.name,
		data: data.map((bar) => bar[fund.name]),
		backgroundColor: fund.color,
		stack: "combined",
		barThickness,
		borderSkipped: false,
		borderWidth: { top: 1, right: 0, bottom: 0, left: 0 },
		borderColor: "#ffffff",
	})),
});

const ActivityChart = () => {
	const chartRef = useRef<Chart<"bar"> | null>(null);
	const [dateRange, setDateRange] = useState<"1y" | "5y" | "inception">("1y");
	const [selectedYear, setSelectedYear] = useState("2025");
	const [barData, setBarData] = useState<BarDatum[]>([]);
	const [chartData, setChartData] = useState<ChartData<"bar"> | null>(null);
	const [barThickness, setBarThickness] = useState(40);

	const getResponsiveBarThickness = (numBars: number): number => {
		if (typeof window === "undefined") return 40;
		if (window.innerWidth < 640) return numBars > 36 ? 6 : 12;
		if (numBars > 60) return 6;
		if (numBars > 36) return 10;
		if (numBars > 24) return 16;
		return 24;
	};

	const updateChart = (labels: string[]) => {
		const newData = generateRandomFundData(labels.length);
		const thickness = getResponsiveBarThickness(labels.length);
		setBarThickness(thickness);
		setBarData(newData);
		setChartData(buildChartData(labels, newData, thickness));
	};

	useEffect(() => {
		const initialLabels = MONTHS.map((m) => `${m} ${selectedYear}`);
		updateChart(initialLabels);
	}, []);

	useEffect(() => {
		const debouncedResize = debounce(() => {
			if (chartData) {
				const labels = (chartData.labels ?? []) as string[];
				const thickness = getResponsiveBarThickness(labels.length);
				setBarThickness(thickness);
				setChartData(buildChartData(labels, barData, thickness));
			}
		}, 200);
		window.addEventListener("resize", debouncedResize);
		return () => window.removeEventListener("resize", debouncedResize);
	}, [chartData, barData]);

	const initialVisibility = FUNDS.reduce<Record<string, boolean>>((acc, fund) => {
		acc[fund.name] = true;
		return acc;
	}, {});
	const [fundVisibility, setFundVisibility] = useState(initialVisibility);

	const handleToggleFund = (label: string) => {
		if (!chartRef.current) return;
		const dataset = chartRef.current.data.datasets.find((ds) => ds.label === label);
		if (!dataset) return;
		dataset.hidden = !dataset.hidden;
		setFundVisibility((prev) => ({ ...prev, [label]: !prev[label] }));
		chartRef.current.update();
	};

	const resetFundVisibility = () => {
		if (!chartRef.current) return;
		chartRef.current.data.datasets.forEach((ds) => (ds.hidden = false));
		chartRef.current.update();
		setFundVisibility(initialVisibility);
	};

	const handleRangeChange = (range: "1y" | "5y" | "inception") => {
		setDateRange(range);
		let labels: string[] = [];
		if (range === "1y") {
			labels = MONTHS.map((m) => `${m} ${selectedYear}`);
		} else if (range === "5y") {
			labels = generateMonthLabels(2019, 60); // Jan 2019 - Dec 2023
		} else {
			labels = generateMonthLabels(2019, 72); // Jan 2019 - Dec 2024
		}
		updateChart(labels);
	};

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
						size: 12,
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
						size: 12,
						weight: 500,
					},
					color: "#A4ABB2",
					callback: (tickValue: string | number) => {
						const value = typeof tickValue === "number" ? tickValue : parseFloat(tickValue);
						if (isNaN(value)) return "";
						return `R${(value / 1000).toFixed(0)}K`;
					},
				},
			},
		},
		plugins: {
			legend: { display: false },
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
			<div className="flex justify-between items-center flex-wrap gap-4">
				<div className="space-x-2 flex items-center flex-wrap">
					<h3 className="text-lg font-semibold">Total Investment Value</h3>
					<div className="flex gap-2">
						<button
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								dateRange === "1y" ? "bg-[#e7f7f6] text-[#32747f] border border-[#cef0ed]" : "bg-[#f7f8f9] text-gray-700"
							}`}
							onClick={() => handleRangeChange("1y")}
						>
							1 year
						</button>
						<button
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								dateRange === "5y" ? "bg-[#e7f7f6] text-[#32747f] border border-[#cef0ed]" : "bg-[#f7f8f9] text-gray-700"
							}`}
							onClick={() => handleRangeChange("5y")}
						>
							5 years
						</button>
						<button
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								dateRange === "inception" ? "bg-[#e7f7f6] text-[#32747f] border border-[#cef0ed]" : "bg-[#f7f8f9] text-gray-700"
							}`}
							onClick={() => handleRangeChange("inception")}
						>
							Inception
						</button>
					</div>
				</div>
				<div className="flex gap-2 items-center">
					<label htmlFor="year-select" className="text-sm text-gray-700">
						Select year:
					</label>
					<select
						id="year-select"
						value={selectedYear}
						onChange={(e) => {
							const year = e.target.value;
							setSelectedYear(year);
							const labels = MONTHS.map((m) => `${m} ${year}`);
							updateChart(labels);
							setDateRange("1y");
						}}
						className="text-sm rounded-md px-2 py-1 bg-white text-gray-800 border border-gray-300"
					>
						{YEARS_RANGE.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</div>
			</div>

			{chartData && <Bar ref={chartRef} data={chartData} options={chartOptions} />}

			<div className="inline-flex items-center p-3 rounded-lg gap-2">
				<h4>Funds showing</h4>
				<button
					onClick={resetFundVisibility}
					className="ml-auto px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700"
				>
					Reset
				</button>
			</div>

			<div className="mt-4 grid md:grid-cols-3 gap-4 bg-gray-100 p-4 rounded-lg">
				{FUNDS.map((fund) => {
					const isHidden = !fundVisibility[fund.name];
					return (
						<button
							key={fund.name}
							onClick={() => handleToggleFund(fund.name)}
							className={`flex items-center text-left gap-2 px-3 py-1 rounded-full text-sm transition ${isHidden ? "opacity-40" : "bg-transparent "}`}
						>
							<span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: fund.color }}></span>
							<span className={`${isHidden ? "line-through" : ""}`}>{fund.name}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default ActivityChart;
