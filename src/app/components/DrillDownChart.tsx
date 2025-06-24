/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, LineController } from "chart.js";
import type { Chart, ChartData, ChartTypeRegistry } from "chart.js";
import { CustomTooltip } from "./ToolTip";

// Type alias for compatibility with ref
type ChartJSOrUndefined<TType extends keyof ChartTypeRegistry = "bar"> = Chart<TType> | undefined;

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, LineController);

const YEARS = ["2021", "2022", "2023", "2024", "2025"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type BarDatum = { percent: number; value: number };

const randomBarData = (length: number): BarDatum[] =>
	Array.from({ length }, () => {
		const percent = Number((Math.random() * 40 - 20).toFixed(1));
		const value = Math.floor(Math.random() * 200000) - 100000;
		return { percent, value };
	});

const DrillDownChart = () => {
	const [view, setView] = useState<"years" | "months">("years");
	const [selectedYear, setSelectedYear] = useState<string | null>(null);
	const [showLine, setShowLine] = useState(false);
	const [barData, setBarData] = useState<BarDatum[]>(randomBarData(YEARS.length));
	const chartRef = useRef<ChartJSOrUndefined<"bar">>(undefined);

	const [chartData, setChartData] = useState<ChartData<"bar" | "line">>({
		labels: YEARS,
		datasets: [
			{
				label: "Performance (%)",
				data: barData.map((d) => d.percent),
				backgroundColor: "rgba(140, 217, 212, 1)",
				barThickness: 50,
				type: "bar" as const,
				order: 1,
				hoverBackgroundColor: "rgba(140, 217, 212, 1)", // No color change on hover
				hoverBorderColor: "rgba(140, 217, 212, 1)", // No border color change on hover
				hoverBorderWidth: 0, // No border width change on hover
			},
		],
	});

	const switchToMonths = (index: number) => {
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
					backgroundColor: "rgba(140, 217, 212, 1)",
					barThickness: 50,
					type: "bar" as const,
					order: 1,
					hoverBackgroundColor: "rgba(140, 217, 212, 1)",
					hoverBorderColor: "rgba(140, 217, 212, 1)",
					hoverBorderWidth: 0,
				},
			],
		});
		setView("months");
	};

	const handleBarClick = (event: import("chart.js").ChartEvent, elements: import("chart.js").ActiveElement[]) => {
		if (elements.length > 0 && view === "years") {
			switchToMonths(elements[0].index);
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
					backgroundColor: "rgba(140, 217, 212, 1)",
					barThickness: 50,
					type: "bar" as const,
					order: 1,
					hoverBackgroundColor: "rgba(140, 217, 212, 1)",
					hoverBorderColor: "rgba(140, 217, 212, 1)",
					hoverBorderWidth: 0,
				},
			],
		});
		setView("years");
		setSelectedYear(null);
	};

	const chartOptions: import("chart.js").ChartOptions<"bar"> = {
		responsive: true,
		maintainAspectRatio: true,
		elements: {
			point: { radius: 0, hoverRadius: 4 },
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: {
					color: "#A4ABB2",
					font: { family: "Montserrat, sans-serif", size: 14, weight: 500, lineHeight: 1.5 },
				},
			},
			y: {
				grid: { display: true, color: "rgb(247, 248, 249)" },
				beginAtZero: false,
				min: -20,
				max: 20,
				ticks: {
					font: { family: "Montserrat, sans-serif", size: 14, weight: 500, lineHeight: 1.5 },
					color: "#A4ABB2",
					callback: (tickValue) => `${tickValue}%`,
				},
			},
		},
		onClick: handleBarClick,
		interaction: { mode: "index", intersect: false },
		plugins: {
			legend: { display: false },
			title: {
				display: false,
				text: view === "years" ? "Performance over last five years" : `Performance in ${selectedYear}`,
				font: { family: "Montserrat, sans-serif", size: 14, weight: 500, lineHeight: 1.5 },
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

	const lineDataset = {
		label: "Performance (%) (Line)",
		data: barData.map((d) => d.percent),
		borderColor: "rgb(84, 185, 202)",
		pointBackgroundColor: "rgb(84, 185, 202)",
		pointBorderColor: "rgb(84, 185, 202)",
		type: "line" as const,
		yAxisID: "y",
		tension: 0.1,
		fill: true,
		backgroundColor: "rgba(244, 144, 128, 0.8)",
		order: 0,
	};

	const combinedChartData: ChartData<"bar" | "line"> = showLine ? { ...chartData, datasets: [...chartData.datasets, lineDataset] } : chartData;

	return (
		<div style={{ height: 400 }} className="w-full">
			<div className="mb-2 flex gap-2">
				<button
					className={`px-4 py-1 rounded-full text-sm font-medium ${view === "years" ? "bg-teal-200 text-black" : "bg-gray-200 text-gray-500"}`}
					onClick={handleBack}
				>
					5 years
				</button>
				<button
					className={`px-4 py-1 rounded-full text-sm font-medium ${view === "months" ? "bg-teal-200 text-black" : "bg-gray-200 text-gray-500"}`}
					disabled={view !== "months"}
				>
					1 year
				</button>
			</div>

			<Bar ref={chartRef} data={combinedChartData as ChartData<"bar", (number | [number, number] | null)[], unknown>} options={chartOptions} />

			<div className="flex justify-center mt-4">
				<label className="flex items-center gap-2 cursor-pointer select-none">
					<input type="checkbox" checked={showLine} onChange={() => setShowLine((v) => !v)} className="accent-blue-600" />
					<span className="text-sm text-gray-700">Show total performance</span>
				</label>
			</div>
		</div>
	);
};

export default DrillDownChart;
