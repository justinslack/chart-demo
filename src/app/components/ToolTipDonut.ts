import type { Chart, TooltipModel } from "chart.js";

export function CustomTooltip(context: { chart: Chart; tooltip: TooltipModel<"doughnut"> }) {
	const { chart, tooltip } = context;
	let tooltipEl = document.getElementById("chartjs-custom-tooltip");
	if (tooltipEl) {
		tooltipEl.remove(); // Remove any existing tooltip before creating a new one
	}
	tooltipEl = document.createElement("div");
	tooltipEl.id = "chartjs-custom-tooltip";
	tooltipEl.style.position = "absolute";
	tooltipEl.style.pointerEvents = "none";
	tooltipEl.style.transition = "all .15s ease";
	tooltipEl.style.zIndex = "9999";
	document.body.appendChild(tooltipEl);

	if (tooltip.opacity === 0) {
		tooltipEl.style.opacity = "0";
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const doughnutData = (chart as any)._doughnutData || [];

	// Set Text
	if (tooltip.body && tooltip.dataPoints?.length) {
		const idx = tooltip.dataPoints[0].dataIndex;
		const value = doughnutData[idx]?.value ?? tooltip.dataPoints[0].parsed ?? 0;
		const label = chart.data.labels?.[idx] ?? "";

		tooltipEl.innerHTML = `
      <div class="custom-tooltip-box">
        <div class="custom-tooltip-row">
          <span class="custom-tooltip-value">R${value.toLocaleString()}</span>
        </div>
        <div class="custom-tooltip-title">
          ${label}
        </div>
      </div>
    `;
	}

	const canvasRect = chart.canvas.getBoundingClientRect();
	tooltipEl.style.opacity = "1";
	tooltipEl.style.left = window.scrollX + canvasRect.left + tooltip.caretX + "px";
	tooltipEl.style.top = window.scrollY + canvasRect.top + tooltip.caretY + "px";
}
