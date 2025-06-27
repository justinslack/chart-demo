/* eslint-disable @typescript-eslint/no-explicit-any */
export function CustomTooltip(context: any) {
	const { chart, tooltip } = context;
	let tooltipEl = document.getElementById("chartjs-custom-tooltip");

	if (!tooltipEl) {
		tooltipEl = document.createElement("div");
		tooltipEl.id = "chartjs-custom-tooltip";
		tooltipEl.className = "rounded-lg shadow-md bg-white p-4 text-sm text-gray-800 border border-gray-100";
		tooltipEl.style.position = "absolute";
		tooltipEl.style.pointerEvents = "none";
		tooltipEl.style.transition = "all .1s ease";
		document.body.appendChild(tooltipEl);
	}

	if (tooltip.opacity === 0) {
		tooltipEl.style.opacity = "0";
		return;
	}

	const index = tooltip.dataPoints?.[0]?.dataIndex;
	if (index === undefined) return;

	const datasets = chart.data.datasets;
	const label = chart.data.labels[index];
	let total = 0;

	// Get fund visibility from chart instance (set in external tooltip handler)
	const fundVisibility = chart.options._fundVisibility || {};

	const rows = datasets.map((dataset: any) => {
		const value = dataset.data[index];
		const isHidden = dataset.hidden || fundVisibility[dataset.label] === false;
		if (!isHidden) {
			total += value;
		}
		return `
      <div class="flex items-center justify-between mb-1 gap-2 bg-white">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background:${dataset.backgroundColor}"></span>
          <span style="${isHidden ? "text-decoration: line-through; color: #b0b0b0;" : ""}">${dataset.label}</span>
        </div>
        <div class="font-semibold ${isHidden ? "line-through text-gray-400" : ""}">R${(value / 1000).toFixed(0)}K</div>
      </div>
    `;
	});

	tooltipEl.innerHTML = `
    <div class="mb-2 font-semibold">${label}</div>
    ${rows.join("")}
    <div class="mt-2 ml-2 pt-2 border-t border-gray-300 text-right font-semibold">Total: R${(total / 1000).toFixed(0)}K</div>
  `;

	const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

	tooltipEl.style.opacity = "1";
	tooltipEl.style.left = positionX + tooltip.caretX + "px";
	tooltipEl.style.top = positionY + tooltip.caretY + "px";
}
