/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import type { Chart } from "chart.js";
import { CustomTooltip } from "./ToolTipActivity";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// import { title } from "process";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const YEARS = ["2021", "2022", "2023", "2024", "2025"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const INCEPTION_YEARS = Array.from({ length: 2025 - 1994 + 1 }, (_, i) => (1994 + i).toString());

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

function debounce(fn: (...args: any[]) => void, delay: number) {
	let timeoutId: NodeJS.Timeout;
	return (...args: any[]) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

const buildChartData = (labels: string[], data: BarDatum[]) => ({
	labels,
	datasets: FUNDS.map((fund) => ({
		label: fund.name,
		data: data.map((bar) => bar[fund.name]),
		backgroundColor: fund.color,
		stack: "combined",
		borderSkipped: false,
		borderWidth: { top: 1, right: 0, bottom: 0, left: 0 },
		borderColor: "#ffffff",
		hoverBackgroundColor: fund.color,
		hoverBorderColor: "#ffffff",
	})),
});

const ActivityChart = () => {
	const [dateRange, setDateRange] = useState<"1y" | "5y" | "inception">("1y");
	const labels = dateRange === "1y" ? MONTHS : YEARS;
	const chartRef = useRef<Chart<"bar"> | null>(null);
	const [selectedYear, setSelectedYear] = useState("2025");

	const getResponsiveBarThickness = (numBars: number) => {
		if (typeof window === "undefined") return 20;
		const containerWidth = window.innerWidth < 640 ? window.innerWidth - 40 : 600; // fallback width
		const minThickness = 4;
		const maxThickness = 40;
		const calculated = Math.max(minThickness, Math.min(maxThickness, Math.floor(containerWidth / (numBars * 1.5))));
		return calculated;
	};

	const [barThickness, setBarThickness] = useState(getResponsiveBarThickness(labels.length));

	useEffect(() => {
		const debouncedResize = debounce(() => {
			setBarThickness(getResponsiveBarThickness(labels.length));
		}, 200);

		window.addEventListener("resize", debouncedResize);
		return () => window.removeEventListener("resize", debouncedResize);
		// Also update when labels change (e.g., when switching ranges)
	}, [labels.length]);

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

	const resetFundVisibility = () => {
		if (!chartRef.current) return;

		chartRef.current.data.datasets.forEach((ds) => {
			ds.hidden = false;
		});
		chartRef.current.update();

		setFundVisibility(
			FUNDS.reduce((acc, fund) => {
				acc[fund.name] = true;
				return acc;
			}, {} as Record<string, boolean>)
		);
	};

	const [barData, setBarData] = useState<BarDatum[]>(() => generateRandomFundData(labels.length));
	const [chartData, setChartData] = useState(() => buildChartData(labels, barData));
	const [prevView, setPrevView] = useState<{ dateRange: string; chartData: any; barData: any; selectedYear: string } | null>(null);

	const handleRangeChange = (range: "1y" | "5y" | "inception") => {
		let newLabels: string[] = [];

		if (range === "1y") {
			newLabels = MONTHS;
		} else if (range === "5y") {
			newLabels = YEARS;
		} else {
			newLabels = INCEPTION_YEARS;
		}

		const newData = generateRandomFundData(newLabels.length);
		setBarData(newData);
		setChartData(buildChartData(newLabels, newData));
		setDateRange(range);
		setBarThickness(getResponsiveBarThickness(newLabels.length));
	};

	const handleBarClick = (event: any, elements: any[]) => {
		if ((dateRange === "5y" || dateRange === "inception") && elements && elements.length > 0) {
			const barIndex = elements[0].index;
			const year = chartData.labels[barIndex];
			setPrevView({
				dateRange,
				chartData,
				barData,
				selectedYear,
			});
			setSelectedYear(year);
			const newData = generateRandomFundData(MONTHS.length);
			setBarData(newData);
			setChartData(buildChartData(MONTHS, newData));
			setDateRange("1y");
			setBarThickness(getResponsiveBarThickness(MONTHS.length));
		}
	};

	const handleBack = () => {
		if (prevView) {
			setDateRange(prevView.dateRange as "1y" | "5y" | "inception");
			setChartData(prevView.chartData);
			setBarData(prevView.barData);
			setSelectedYear(prevView.selectedYear);
			setBarThickness(getResponsiveBarThickness(prevView.chartData.labels.length));
			setPrevView(null);
		}
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: true,
		barThickness: barThickness,
		_fundVisibility: fundVisibility,
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
			// title: {
			// 	display: true,
			// 	text: `Investment Value (${dateRange === "1y" ? "1 Year" : "5 Years"})`,
			// 	font: {
			// 		family: "Montserrat, sans-serif",
			// 		size: 14,
			// 		weight: 500,
			// 	},
			// },
			tooltip: {
				enabled: false,
				external: (context: any) => {
					(context.chart as any)._barData = barData;
					CustomTooltip(context);
				},
			},
		},
		onClick: handleBarClick,
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
						{prevView && (
							<button className="px-3 py-1 rounded-full text-sm bg-transparent text-gray-700 border-0 underline" onClick={handleBack}>
								Back
							</button>
						)}
					</div>
				</div>
				<div className="flex gap-2 items-center">
					<label htmlFor="year-select" className="text-sm text-gray-700">
						Select year:
					</label>
					<Select
						value={selectedYear}
						onValueChange={(year) => {
							setSelectedYear(year);
							const newData = generateRandomFundData(MONTHS.length);
							setBarData(newData);
							setChartData(buildChartData(MONTHS, newData));
							setDateRange("1y");
							setBarThickness(getResponsiveBarThickness(MONTHS.length));
						}}
					>
						<SelectTrigger id="year-select" name="year-select" className="w-[120px] text-sm rounded-md px-2 py-1 bg-white text-gray-800 border border-gray-300">
							<SelectValue placeholder="Select year" />
						</SelectTrigger>
						<SelectContent style={{ maxHeight: "250px", overflowY: "auto" }}>
							{INCEPTION_YEARS.map((year) => (
								<SelectItem key={year} value={year}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<Bar ref={chartRef} data={chartData} options={chartOptions} />
			<div className="inline-flex items-center p-3 rounded-lg gap-2 h-8 mt-8">
				<h4>Funds showing</h4>
				{Object.values(fundVisibility).some((v) => !v) && (
					<button
						onClick={resetFundVisibility}
						className="ml-auto px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700"
					>
						Reset
					</button>
				)}
			</div>
			<div className="grid md:grid-cols-3 gap-4 bg-gray-100 p-4 rounded-lg">
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
