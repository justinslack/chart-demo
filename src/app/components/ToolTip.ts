import type { Chart, TooltipModel } from "chart.js";

const upArrowSVG = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_14931_3307)">
<path d="M7 1L1 7" stroke="#3C4248" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M4.16992 1L6.99992 1L6.99992 3.83" stroke="#3C4248" strokeLinecap="round" strokeLinejoin="round"/>
</g>
<defs>
<clipPath id="clip0_14931_3307">
<rect width="8" height="8" fill="white" transform="translate(0 8) rotate(-90)"/>
</clipPath>
</defs>
</svg>
`;

const downArrowSVG = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_14931_3263)">
<path d="M7 7L1 1" stroke="#3C4248" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M6.99992 4.17V7H4.16992" stroke="#3C4248" strokeLinecap="round" strokeLinejoin="round"/>
</g>
<defs>
<clipPath id="clip0_14931_3263">
<rect width="8" height="8" fill="white"/>
</clipPath>
</defs>
</svg>
`;

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

// Uncomment this function if you want to use the tooltip positioning based on bar elements
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
