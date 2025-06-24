import Link from "next/link";

export default function Home() {
	return (
		<div className="grid grid-cols-2 gap-8 mx-auto max-w-4xl p-8">
			<Link
				href="/performance"
				className="p-8 border border-gray-300 rounded-lg text-center no-underline text-inherit flex items-center justify-center hover:shadow-md transition"
			>
				Performance drilldown
			</Link>
			<Link
				href="/activity"
				className="p-8 border border-gray-300 rounded-lg text-center no-underline text-inherit flex items-center justify-center hover:shadow-md transition"
			>
				Activity Chart
			</Link>
			<Link
				href="/dashboard-broker-donut"
				className="p-8 border border-gray-300 rounded-lg text-center no-underline text-inherit flex items-center justify-center hover:shadow-md transition"
			>
				Broker Dashboard Chart
			</Link>
		</div>
	);
}
