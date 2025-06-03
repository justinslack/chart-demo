import React from "react";
import type { Chart, TooltipModel } from "chart.js";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowRight } from "lucide-react";

const upArrowSVG = renderToStaticMarkup(React.createElement(ArrowRight, { size: 12, style: { transform: "rotate(-90deg)" } }));
const downArrowSVG = renderToStaticMarkup(React.createElement(ArrowRight, { size: 12, style: { transform: "rotate(90deg)" } }));

export function CustomTooltip(context: { chart: Chart; tooltip: TooltipModel<"bar"> }) {
	const { chart, tooltip } = context;
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
	if (tooltip.opacity === 0) {
		tooltipEl.style.opacity = "0";
		return;
	}

	// Get barData from chart instance
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const barData = (chart as any)._barData || [];

	// Set Text
	if (tooltip.body && tooltip.dataPoints?.length) {
		const idx = tooltip.dataPoints[0].dataIndex;
		const value = barData[idx]?.value ?? 0;
		const percent = barData[idx]?.percent ?? 0;
		let percentClass = "";
		let arrowSVG = "";
		if (percent > 0) {
			arrowSVG = upArrowSVG;
			percentClass = "positive";
		} else if (percent < 0) {
			arrowSVG = downArrowSVG;
			percentClass = "negative";
		}

		// ...existing code...
		tooltipEl.innerHTML = `
    <div class="custom-tooltip-box">
      <div class="custom-tooltip-row">
        <span class="custom-tooltip-value">R${value.toLocaleString()}</span>
        <span class="custom-tooltip-percent${percentClass ? " " + percentClass : ""}">
          ${percent > 0 ? "+" : percent < 0 ? "-" : ""}${Math.abs(percent)}% ${arrowSVG}
        </span>
      </div>
      <div class="custom-tooltip-title">
        Product Name and Code
      </div>
    </div>
  `;
	}

	const { offsetLeft: chartX, offsetTop: chartY } = chart.canvas;
	tooltipEl.style.opacity = "1";
	tooltipEl.style.left = chartX + tooltip.caretX + 10 + "px";
	tooltipEl.style.top = chartY + tooltip.caretY - 30 + "px";
}

// Tooltip positioning based on bar elements
// 	const bar = tooltip.dataPoints?.[0]?.element;
// 	if (bar) {
// 		const rect = bar.getProps(["x", "y", "width", "height"], true);
// 		const canvasRect = chart.canvas.getBoundingClientRect();
// 		tooltipEl.style.opacity = "1";
// 		tooltipEl.style.left = `${canvasRect.left + window.scrollX + rect.x - tooltipEl.offsetWidth / 2 + rect.width / 2}px`;
// 		tooltipEl.style.top = `${canvasRect.top + window.scrollY + rect.y - tooltipEl.offsetHeight - 8}px`;
// 	} else {
// 		const { offsetLeft: chartX, offsetTop: chartY } = chart.canvas;
// 		tooltipEl.style.opacity = "1";
// 		tooltipEl.style.left = chartX + tooltip.caretX + 10 + "px";
// 		tooltipEl.style.top = chartY + tooltip.caretY - 30 + "px";
// 	}
// }
