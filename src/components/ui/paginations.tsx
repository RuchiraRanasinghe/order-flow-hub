import React from 'react';

interface PaginationProps {
	total: number;
	page: number;
	limit: number;
	onPageChange: (page: number) => void;
	onLimitChange?: (limit: number) => void;
	limits?: number[];
	fixed?: boolean; // sticky bottom layout when true
}

const Pagination: React.FC<PaginationProps> = ({
	total,
	page,
	limit,
	onPageChange,
	onLimitChange,
	limits = [5, 10, 15, 20],
	fixed = false,
}) => {
	const totalPages = Math.max(1, Math.ceil(total / limit));

	const handlePageClick = (p: number) => {
		if (p < 1 || p > totalPages || p === page) return;
		onPageChange(p);
	};

	const renderPageNumbers = () => {
		// If few pages, render all
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
				<button
					key={p}
					onClick={() => handlePageClick(p)}
					className={`px-3 py-1 rounded-md border ${p === page ? 'bg-primary text-white' : 'bg-white'}`}
				>
					{p}
				</button>
			));
		}

		// Otherwise use first, last, and window around current
		const pages: (number | string)[] = [];
		pages.push(1);
		let start = Math.max(2, page - 2);
		let end = Math.min(totalPages - 1, page + 2);

		if (start > 2) pages.push('...');

		for (let p = start; p <= end; p++) pages.push(p);

		if (end < totalPages - 1) pages.push('...');
		pages.push(totalPages);

		return pages.map((p, idx) =>
			typeof p === 'string' ? (
				<span key={`gap-${idx}`} className="px-2 text-sm text-muted-foreground">{p}</span>
			) : (
				<button
					key={p}
					onClick={() => handlePageClick(p)}
					className={`px-3 py-1 rounded-md border ${p === page ? 'bg-primary text-white' : 'bg-white'}`}
				>
					{p}
				</button>
			)
		);
	};

		// Two layout modes: sticky fixed (bottom centered) and embedded (inline, right-aligned compact)
			if (fixed) {
			return (
				<div
					className={`w-full fixed left-0 right-0 bottom-4 z-50`}
					aria-label="Pagination Navigation"
				>
					<div className="max-w-6xl mx-auto px-4">
						<div className="flex items-center justify-between bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border">
							<div className="flex items-center gap-2">
												<button
													onClick={() => handlePageClick(page - 1)}
													disabled={page <= 1}
													className="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-50 bg-white"
												>
													Prev
												</button>

								<div className="flex items-center gap-1">{renderPageNumbers()}</div>

												<button
													onClick={() => handlePageClick(page + 1)}
													disabled={page >= totalPages}
													className="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-50 bg-white"
												>
													Next
												</button>
							</div>

							<div className="flex items-center gap-3">
								<div className="text-sm text-muted-foreground">Rows</div>
								<select
									value={limit}
									onChange={(e) => onLimitChange && onLimitChange(parseInt(e.target.value, 10))}
									className="rounded-md border px-2 py-1"
								>
									{limits.map((l) => (
										<option key={l} value={l}>{l}</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</div>
			);
		}

		// Embedded compact pagination (right aligned in page content)
		return (
			<div className="w-full flex justify-end mt-4" aria-label="Pagination Navigation">
				<div className="inline-flex items-center gap-3 bg-white rounded-md shadow-sm border px-3 py-2">
					<button
						onClick={() => handlePageClick(page - 1)}
						disabled={page <= 1}
						className="px-3 py-1 rounded-md border disabled:opacity-50"
					>
						Prev
					</button>

					<div className="flex items-center gap-1">{renderPageNumbers()}</div>

					<button
						onClick={() => handlePageClick(page + 1)}
						disabled={page >= totalPages}
						className="px-3 py-1 rounded-md border disabled:opacity-50"
					>
						Next
					</button>

					<select
						value={limit}
						onChange={(e) => onLimitChange && onLimitChange(parseInt(e.target.value, 10))}
						className="rounded-md border px-2 py-1"
					>
						{limits.map((l) => (
							<option key={l} value={l}>{l}</option>
						))}
					</select>
				</div>
			</div>
		);
};

export default Pagination;

