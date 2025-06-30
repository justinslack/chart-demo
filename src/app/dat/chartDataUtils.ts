// src/app/dat/chartDataUtils.ts

export const YEARS = ["2021", "2022", "2023", "2024", "2025"];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const LINE_YEARS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];
export const LINE_MONTHS = [...MONTHS];

export type BarDatum = { percent: number; value: number };

export const randomBarData = (length: number): BarDatum[] =>
	Array.from({ length }, () => {
		const percent = Number((Math.random() * 40 - 20).toFixed(1));
		const value = Math.floor(Math.random() * 200000) - 100000;
		return { percent, value };
	});

// Generate monthly data with gentle up and down fluctuations
export const randomLineData = (years: string[], months: string[]): number[][] => {
	return years.map(() => {
		let base = 10000 + Math.random() * 10;
		return months.map(() => {
			const change = (Math.random() - 0.35) * 7;
			base += change;
			return Number(base.toFixed(1));
		});
	});
};

export const advisorData = [
	{ name: "Liam Hawthorne", value: 390000, percent: 30, color: "rgb(112, 164, 188)" },
	{ name: "Hanna Kenter", value: 364000, percent: 28, color: "rgb(153, 227, 195)" },
	{ name: "Adam Curtis", value: 260000, percent: 20, color: "rgb(35, 85, 114)" },
	{ name: "John Vetros", value: 156000, percent: 12, color: "rgb(93, 202, 165)" },
	{ name: "Other", value: 130000, percent: 10, color: "rgb(187, 191, 197)" },
];

export const investmentData = [
	{ name: "Unit Trust", value: 410000, percent: 42, color: "rgb(112, 164, 188)" },
	{ name: "Retirement Annuity", value: 360000, percent: 23, color: "rgb(153, 227, 195)" },
	{ name: "Living Annuity", value: 255000, percent: 15, color: "rgb(35, 85, 114)" },
	{ name: "Pension Preservation Fund", value: 140000, percent: 11, color: "rgb(93, 202, 165)" },
	{ name: "Other", value: 87500, percent: 7, color: "rgb(187, 191, 197)" },
];
