"use client";

import React, { useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Demo data
const YEARS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const randomData = (length: number) => Array.from({ length }, () => Math.floor(Math.random() * 2000000) - 1000000);

// --- CUSTOM TOOLTIP FUNCTION ---
import type { Chart, TooltipModel } from "chart.js";

function CustomTooltip(context: { chart: Chart; tooltip: TooltipModel<"bar"> }) {
	// Tooltip Element
	let tooltipEl = document.getElementById("chartjs-custom-tooltip");
	if (!tooltipEl) {
		tooltipEl = document.createElement("div");
		tooltipEl.id = "chartjs-custom-tooltip";
		tooltipEl.style.position = "absolute";
		tooltipEl.style.pointerEvents = "none";
		tooltipEl.style.transition = "all .15s ease";
		document.body.appendChild(tooltipEl);
	}

	// Hide if no tooltip
	const { chart, tooltip } = context;
	if (tooltip.opacity === 0) {
		tooltipEl.style.opacity = "0";
		return;
	}

	// Set Text
	if (tooltip.body && tooltip.dataPoints?.length) {
		const value = tooltip.dataPoints[0].parsed.y;
		// const label = tooltip.dataPoints[0].label;

		// Example: Use value to calculate % change vs previous bar
		let percent = "";
		let direction = "";
		if (tooltip.dataPoints[0].dataset.data.length > 1) {
			const idx = tooltip.dataPoints[0].dataIndex;
			const prevVal = tooltip.dataPoints[0].dataset.data[idx - 1];
			if (idx > 0 && prevVal !== 0) {
				const prevNum = typeof prevVal === "number" ? prevVal : 0;
				const pct = prevNum !== 0 ? ((Number(value) - prevNum) / Math.abs(prevNum)) * 100 : 0;
				percent = `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
				direction = pct > 0 ? "↑" : "↓";
			} else {
				percent = "0.0%";
				direction = "";
			}
		} else {
			percent = "0.0%";
		}

		tooltipEl.innerHTML = `
      <div class="custom-tooltip-box">
        <div class="custom-tooltip-row">
          <span class="custom-tooltip-value">R${value.toLocaleString()}</span>
          <span class="custom-tooltip-percent">${percent} ${direction}</span>
        </div>
        <div class="custom-tooltip-title">
          Prescient Unit Trust<br>Investments (PRE00648)
        </div>
      </div>
    `;
	}

	// Positioning
	const { offsetLeft: chartX, offsetTop: chartY } = chart.canvas;
	tooltipEl.style.opacity = "1";
	tooltipEl.style.left = chartX + tooltip.caretX + 10 + "px";
	tooltipEl.style.top = chartY + tooltip.caretY - 30 + "px";
}

const DrillDownChart = () => {
	const [view, setView] = useState("years");
	const [selectedYear, setSelectedYear] = useState<string | null>(null);
	const chartRef = useRef(null);

	const [chartData, setChartData] = useState({
		labels: YEARS,
		datasets: [
			{
				label: "Performance",
				data: randomData(YEARS.length),
				backgroundColor: "rgba(75, 192, 192, 0.5)",
				barThickness: 50,
			},
		],
	});

	// Chart.js onClick handler signature
	const handleBarClick = (event: import("chart.js").ChartEvent, elements: import("chart.js").ActiveElement[]) => {
		if (elements && elements.length > 0) {
			const index = elements[0].index;
			if (view === "years") {
				const year = YEARS[index];
				setSelectedYear(year);
				setChartData({
					labels: MONTHS,
					datasets: [
						{
							label: `Performance per ${year}`,
							data: randomData(MONTHS.length),
							backgroundColor: "rgba(75, 192, 192, 0.5)",
							barThickness: 50,
						},
					],
				});
				setView("months");
			}
		}
	};

	const handleBack = () => {
		setChartData({
			labels: YEARS,
			datasets: [
				{
					label: "Total Performance",
					data: randomData(YEARS.length),
					backgroundColor: "rgba(153, 102, 255, 1)",
					barThickness: 50,
				},
			],
		});
		setView("years");
		setSelectedYear(null);
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: { grid: { display: false } },
			y: { grid: { display: true, color: "rgba(247, 248, 249, 1.00)" } },
		},
		onClick: handleBarClick,
		plugins: {
			legend: { display: false },
			title: {
				display: true,
				text: view === "years" ? "Performance in Year" : `Performance in ${selectedYear}`,
			},
			tooltip: {
				enabled: false,
				external: CustomTooltip,
			},
		},
	};

	// Remove tooltip on unmount (cleanup)
	React.useEffect(() => {
		return () => {
			const el = document.getElementById("chartjs-custom-tooltip");
			if (el) el.remove();
		};
	}, []);

	return (
		<div style={{ height: 400 }}>
			{view === "months" && (
				<button onClick={handleBack} style={{ marginBottom: 10 }}>
					Back to Years
				</button>
			)}
			<Bar ref={chartRef} data={chartData} options={chartOptions} />
		</div>
	);
};

export default DrillDownChart;
