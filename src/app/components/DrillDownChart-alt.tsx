/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, LineController, Filler } from "chart.js";
import type { Chart, ChartData, ChartTypeRegistry } from "chart.js";
import { CustomTooltip } from "./ToolTip-alt";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

// Type alias for compatibility with ref
type ChartJSOrUndefined<TType extends keyof ChartTypeRegistry = "bar"> = Chart<TType> | undefined;

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, LineController, Filler);

const YEARS = ["2021", "2022", "2023", "2024", "2025"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LINE_YEARS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];
const LINE_MONTHS = [...MONTHS];

// Generate monthly data with gentle up and down fluctuations
const randomLineData = (years: string[], months: string[]): number[][] => {
	return years.map(() => {
		let base = 100 + Math.random() * 10;
		return months.map(() => {
			// Change between -2.5 and +4.5, so mostly up, sometimes down
			const change = (Math.random() - 0.35) * 7; // -2.45 to +4.55
			base += change;
			return Number(base.toFixed(1));
		});
	});
};

type BarDatum = { percent: number; value: number };

const randomBarData = (length: number): BarDatum[] =>
	Array.from({ length }, () => {
		const percent = Number((Math.random() * 40 - 20).toFixed(1));
		const value = Math.floor(Math.random() * 200000) - 100000;
		return { percent, value };
	});

const BarBackgroundPlugin = {
	id: "barBackground",
	beforeDatasetsDraw(chart: ChartJS) {
		const { ctx, chartArea, scales } = chart;
		if (!chartArea) return;

		const yAxis = scales.y;
		const meta = chart.getDatasetMeta(0);

		const yMin = yAxis.getPixelForValue(yAxis.min);
		const yMax = yAxis.getPixelForValue(yAxis.max);

		meta.data.forEach((bar: any) => {
			const barWidth = bar.width;
			const x = bar.x - barWidth / 2;

			ctx.save();
			ctx.fillStyle = "rgba(247, 248, 249, 0.95)";
			ctx.fillRect(x, yMax, barWidth, yMin - yMax);
			ctx.restore();
		});
	},
};

const getLineGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
	const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
	gradient.addColorStop(0, "rgba(233, 248, 247, 1.00)"); // top
	gradient.addColorStop(1, "rgba(241, 247, 246, 0.5)"); // bottom
	return gradient;
};

// Chart.js plugin to draw a vertical line at the hovered index
const VerticalHoverLinePlugin = {
	id: "verticalHoverLine",
	afterDraw(chart: any) {
		const tooltip = chart.tooltip;
		if (!tooltip || !tooltip._active || !tooltip._active.length) return;
		const ctx = chart.ctx;
		ctx.save();
		const activePoint = tooltip._active[0];
		const x = activePoint.element.x;
		const topY = chart.scales.y.top;
		const bottomY = chart.scales.y.bottom;
		ctx.beginPath();
		ctx.moveTo(x, topY);
		ctx.lineTo(x, bottomY);
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = "rgba(84, 185, 202, 0.5)";
		ctx.setLineDash([4, 4]);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.restore();
	},
};

const DrillDownChart = () => {
	const [view, setView] = useState<"years" | "months">("years");
	const [selectedYear, setSelectedYear] = useState<string | null>(null);
	const [showLine, setShowLine] = useState(false);
	const [barData, setBarData] = useState<BarDatum[]>(randomBarData(YEARS.length));
	const [activeTab, setActiveTab] = useState<"bar" | "line">("bar");
	const [selectedLineYear, setSelectedLineYear] = useState<string>("all");
	const [lineData] = useState(() => randomLineData(LINE_YEARS, LINE_MONTHS));
	const chartRef = useRef<ChartJSOrUndefined<"bar">>(undefined);

	const allPercents = barData.map((d) => d.percent);
	const dataMin = Math.min(...allPercents);
	const dataMax = Math.max(...allPercents);
	const yMin = Math.floor(dataMin) - 2;
	const yMax = Math.ceil(dataMax) + 2;

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
				grid: {
					display: true,
					color: "rgb(247, 248, 249)",
					lineWidth: 1,
				},
				beginAtZero: false,
				min: yMin,
				max: yMax,
				ticks: {
					font: { family: "Montserrat, sans-serif", size: 14, weight: 500, lineHeight: 1.5 },
					color: "#A4ABB2",
					callback: (tickValue) => `${tickValue}%`,
				},
				title: {
					display: true,
					text: "Performance (%)",
					font: { family: "Montserrat, sans-serif", size: 16, weight: 400 },
					color: "#A4ABB2",
					padding: { top: 10, bottom: 10 },
				},
			},
		},
		onClick: (event, elements) => {
			if (elements.length > 0 && view === "years") {
				const year = YEARS[elements[0].index];
				setSelectedYear(year);
				setBarData(randomBarData(MONTHS.length));
				setView("months");
			}
		},
		interaction: { mode: "index", intersect: false },
		plugins: {
			legend: { display: false },
			title: { display: false },
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

	const allMonths = LINE_YEARS.flatMap((year) => LINE_MONTHS.map((m) => `${year} ${m}`));
	const allLineValues = lineData.flat();

	const filteredLineLabels = selectedLineYear === "all" ? allMonths : LINE_MONTHS.map((m) => `${selectedLineYear} ${m}`);

	const filteredLineValues = selectedLineYear === "all" ? allLineValues : lineData[LINE_YEARS.indexOf(selectedLineYear)];

	const lineChartData: ChartData<"line"> = {
		labels: filteredLineLabels,
		datasets: [
			{
				label: selectedLineYear === "all" ? "Monthly Performance (2019-2025)" : `Monthly Performance in ${selectedLineYear}`,
				data: filteredLineValues,
				borderWidth: 2,
				borderColor: "rgb(84, 185, 202)",
				pointBackgroundColor: "rgb(84, 185, 202)",
				pointBorderColor: "rgb(84, 185, 202)",
				tension: 0.4,
				fill: true,
				backgroundColor: function (context) {
					const chart = context.chart;
					const { ctx, chartArea } = chart;
					if (!chartArea) return "rgba(233, 248, 247, 1.00)";
					return getLineGradient(ctx, chartArea);
				},
				order: 0,
			},
		],
	};

	const lineChartOptions: import("chart.js").ChartOptions<"line"> = {
		responsive: true,
		maintainAspectRatio: true,
		elements: {
			point: { radius: 2, hoverRadius: 5 },
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: {
					color: "#A4ABB2",
					font: { family: "Montserrat, sans-serif", size: 12, weight: 500 },
				},
			},
			y: {
				grid: {
					display: true,
					color: "rgb(247, 248, 249)",
					lineWidth: 1,
				},
				beginAtZero: false,
				ticks: {
					font: { family: "Montserrat, sans-serif", size: 12, weight: 500 },
					color: "#A4ABB2",
				},
				title: {
					display: true,
					text: "Performance (monthly)",
					font: { family: "Montserrat, sans-serif", size: 14, weight: 400 },
					color: "#A4ABB2",
					padding: { top: 10, bottom: 10 },
				},
			},
		},
		plugins: {
			legend: { display: false },
			title: { display: false },
			tooltip: {
				enabled: false,
				external: ({ chart, tooltip }: any) => {
					const idx = tooltip.dataPoints?.[0]?.dataIndex;

					let value = 0;
					let prev = 0;
					let percent = "0.0";

					if (selectedLineYear === "all") {
						const flat = lineData.flat();
						value = flat[idx] ?? 0;
						prev = idx > 0 ? flat[idx - 1] : value;
					} else {
						const yearIndex = LINE_YEARS.indexOf(selectedLineYear);
						const months = lineData[yearIndex] || [];
						value = months[idx] ?? 0;
						prev = idx > 0 ? months[idx - 1] : value;
					}

					if (prev !== 0) {
						percent = (((value - prev) / Math.abs(prev)) * 100).toFixed(1);
					}

					console.log("✅ Tooltip data", { idx, value, percent });

					chart._barData = [{ value, percent: parseFloat(percent) }];
					CustomTooltip({ chart, tooltip });
				},
			},
		},
	};

	const handleCheckbox = () => {
		if (!showLine) {
			setActiveTab("line");
		} else {
			setActiveTab("bar");
		}
		setShowLine((v) => !v);
	};

	return (
		<div style={{ height: 400 }} className="w-full">
			<div className="mb-2 flex gap-2">
				<button
					className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === "bar" ? "bg-teal-200 text-black" : "bg-gray-200 text-gray-500"}`}
					onClick={() => {
						setActiveTab("bar");
						setShowLine(false);
					}}
				>
					Bar
				</button>
				<button
					className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === "line" ? "bg-teal-200 text-black" : "bg-gray-200 text-gray-500"}`}
					onClick={() => {
						setActiveTab("line");
						setShowLine(true);
					}}
					disabled={!showLine}
				>
					Line
				</button>
			</div>

			{activeTab === "bar" && (
				<Bar
					ref={chartRef}
					data={{
						labels: view === "years" ? YEARS : MONTHS,
						datasets: [
							{
								label: view === "years" ? "Performance (%)" : `Performance per ${selectedYear} (%)`,
								data: barData.map((d) => d.percent),
								backgroundColor: "rgba(140, 217, 212, 1)",
								barThickness: 50,
								type: "bar" as const,
								order: 1,
							},
						],
					}}
					options={chartOptions}
					plugins={[BarBackgroundPlugin]}
				/>
			)}

			{activeTab === "line" && (
				<div>
					<div className="mb-2 flex gap-2 items-center">
						<Select value={selectedLineYear} onValueChange={setSelectedLineYear}>
							<SelectTrigger className="w-[140px]">
								<SelectValue placeholder="All years" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All years</SelectItem>
								{LINE_YEARS.map((year) => (
									<SelectItem key={year} value={year}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Line data={lineChartData} options={lineChartOptions} plugins={[VerticalHoverLinePlugin]} />
				</div>
			)}

			<div className="flex justify-center mt-4">
				<label className="flex items-center gap-2 cursor-pointer select-none">
					<input type="checkbox" checked={showLine} onChange={handleCheckbox} className="accent-blue-600" />
					<span className="text-sm text-gray-700">Show line performance</span>
				</label>
			</div>
		</div>
	);
};

export default DrillDownChart;
