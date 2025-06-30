"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import React, { useRef, useState, useEffect } from "react";
import { CustomTooltip } from "./ToolTipDonut";
import { advisorData, investmentData } from "../../data/chartDataUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

const getChartData = (items: typeof advisorData) => ({
	labels: items.map((item: (typeof advisorData)[number]) => item.name),
	datasets: [
		{
			data: items.map((item: (typeof advisorData)[number]) => item.value),
			backgroundColor: items.map((item: (typeof advisorData)[number]) => item.color),
			borderWidth: 2,
			borderColor: "#fff",
			hoverOffset: 0,
			hoverBackgroundColor: items.map((item: (typeof advisorData)[number]) => item.color),
			hoverBorderColor: "#fff",
			hoverBorderWidth: 2,
		},
	],
});

const chartOptions: ChartOptions<"doughnut"> = {
	cutout: "60%",
	plugins: {
		tooltip: {
			enabled: false,
			external: (context) => CustomTooltip({ chart: context.chart, tooltip: context.tooltip }),
		},
		legend: {
			display: false,
		},
	},
};

export default function DonutChartSwitcher() {
	const [activeTab, setActiveTab] = useState<"advisors" | "investments">("advisors");
	const chartRef = useRef(null);

	const dataSet = activeTab === "advisors" ? advisorData : investmentData;

	useEffect(() => {
		if (chartRef.current) {
			// @ts-expect-error custom
			chartRef.current._barData = dataSet;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab]);

	return (
		<div className="flex flex-col items-center w-[350px] mx-auto border p-6">
			{/* Toggle */}
			<div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-full">
				<button
					className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === "advisors" ? "bg-teal-700 text-white" : "text-gray-700"}`}
					onClick={() => setActiveTab("advisors")}
				>
					Advisors
				</button>
				<button
					className={`px-4 py-1 rounded-full text-sm font-medium ${activeTab === "investments" ? "bg-teal-700 text-white" : "text-gray-700"}`}
					onClick={() => setActiveTab("investments")}
				>
					Investments
				</button>
			</div>

			{/* Chart */}
			<div className="w-[160px] h-[160px] relative">
				<Doughnut ref={chartRef} data={getChartData(dataSet)} options={chartOptions} />
			</div>

			{/* Legend */}
			<div className="mt-6 space-y-2 text-sm w-full">
				{dataSet.map((item: (typeof advisorData)[number]) => (
					<div key={item.name} className="flex items-center justify-between gap-2 border-b pb-2 last:border-0">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: item.color }} />
							<span>{item.name}</span>
						</div>
						<div className="text-gray-600">{item.percent}%</div>
					</div>
				))}
			</div>

			{/* Disclaimer */}
			<p className="mt-4 text-xs text-gray-500 max-w-xs">Differences may exist due to rounding, for indicative purposes only</p>
		</div>
	);
}
