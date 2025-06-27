import React from "react";
import type { Chart, TooltipModel } from "chart.js";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowRight } from "lucide-react";

const upArrowSVG = renderToStaticMarkup(React.createElement(ArrowRight, { size: 12, style: { transform: "rotate(-90deg)" } }));
const downArrowSVG = renderToStaticMarkup(React.createElement(ArrowRight, { size: 12, style: { transform: "rotate(90deg)" } }));

export function CustomTooltip(context: { chart: Chart; tooltip: TooltipModel<"bar" | "line"> }) {
	const { chart, tooltip } = context;

	let tooltipEl = document.getElementById("chartjs-custom-tooltip");
	if (tooltipEl) tooltipEl.remove();

	tooltipEl = document.createElement("div");
	tooltipEl.id = "chartjs-custom-tooltip";
	tooltipEl.style.position = "absolute";
	tooltipEl.style.pointerEvents = "none";
	tooltipEl.style.transition = "all .15s ease";
	document.body.appendChild(tooltipEl);

	if (tooltip.opacity === 0) {
		tooltipEl.style.opacity = "0";
		return;
	}

	// Get barData or lineData
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const barData = (chart as any)._barData || [];

	if (tooltip.body && tooltip.dataPoints?.length) {
		const idx = tooltip.dataPoints[0].dataIndex;

		let value = 0;
		let percent = 0;

		// Handle both array-of-objects (bar) and array-of-one (line)
		if (Array.isArray(barData)) {
			if (barData.length === 1 && "value" in barData[0]) {
				// line chart
				value = barData[0].value ?? 0;
				percent = parseFloat(barData[0].percent ?? 0);
			} else {
				// bar chart
				value = barData[idx]?.value ?? 0;
				percent = barData[idx]?.percent ?? 0;
			}
		}

		let percentClass = "";
		let arrowSVG = "";
		if (percent > 0) {
			arrowSVG = upArrowSVG;
			percentClass = "positive";
		} else if (percent < 0) {
			arrowSVG = downArrowSVG;
			percentClass = "negative";
		}

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
