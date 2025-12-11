import { useEffect, useState } from 'react';
import { getPensionAmountData } from '../pension_amount_data';
import { averageAmountByDateChartUtils, designUtils } from '../design_utils';

type ExtraPoint = { year: string; amount: number };

export const AverageAmountByDate: React.FC<{ extraPoint?: ExtraPoint }> = ({
  extraPoint,
}) => {
  // year -> average amount
  const [yearAverages, setYearAverages] = useState<Record<string, number>>({});
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    amount: number;
    isExtraPoint?: boolean;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await getPensionAmountData();
      // Compute overall average per YEAR from raw rows
      const sums: Record<string, number> = {};
      const counts: Record<string, number> = {};
      data.forEach(row => {
        const dateStr = (row['known_act_date'] || '').toString().trim();
        if (!dateStr) return;
        const year = dateStr.split('-')[0];
        if (!year) return;
        const amtStr = (row['normalized_yearly_amount'] || '')
          .toString()
          .trim();
        if (!amtStr) return;
        const amt = Number(amtStr);
        if (!Number.isFinite(amt) || Number.isNaN(amt)) return;
        if (!sums[year]) {
          sums[year] = 0;
          counts[year] = 0;
        }
        sums[year] += amt;
        counts[year] += 1;
      });
      const byYear: Record<string, number> = {};
      Object.keys(sums).forEach(y => {
        byYear[y] = sums[y] / counts[y];
      });
      setYearAverages(byYear);
    };
    loadData();
  }, []);

  // console.log('yearAverages:', yearAverages);
  if (Object.keys(yearAverages).length === 0) {
    return <div>Loading...</div>;
  }

  // Sort years for x-axis; include extraPoint year if provided
  const baseYears = Object.keys(yearAverages);
  const augmentedYearsSet = new Set(baseYears);
  if (extraPoint?.year) augmentedYearsSet.add(extraPoint.year);
  const sortedYears = Array.from(augmentedYearsSet).sort();

  // Y-axis scale from 0 to max
  const amounts = Object.values(yearAverages);
  const minAmount = 0;
  const maxAmount = Math.max(...amounts, extraPoint?.amount ?? 0, 0);
  const yRange = maxAmount - minAmount;

  // Chart dimensions (small, minimal styling)
  const width = averageAmountByDateChartUtils.width;
  const height = averageAmountByDateChartUtils.height;
  const padding = averageAmountByDateChartUtils.padding;
  // Increase left padding to accommodate y-axis labels
  const adjustedPadding = {
    ...padding,
    left: padding.left + 20, // Add extra space for labels
  };
  const chartWidth = width - adjustedPadding.left - adjustedPadding.right;
  const chartHeight = height - adjustedPadding.top - adjustedPadding.bottom;

  // Scale functions
  const xScale = (index: number) => {
    if (sortedYears.length <= 1) return chartWidth / 2;
    // Add padding before first point to avoid alignment with y-axis
    const paddingRatio = 0.05; // 5% padding on left
    const dataWidth = chartWidth * (1 - paddingRatio);
    return (
      chartWidth * paddingRatio + (index / (sortedYears.length - 1)) * dataWidth
    );
  };
  const yScale = (value: number) => {
    if (yRange === 0) return chartHeight; // all zeros
    // Add padding at top to avoid alignment with x-axis
    const paddingRatio = 0.05; // 5% padding on top
    const dataHeight = chartHeight * (1 - paddingRatio);
    return (
      chartHeight * paddingRatio +
      (1 - (value - minAmount) / yRange) * dataHeight
    );
  };

  const handleMouseEnter = (
    e: React.MouseEvent<SVGCircleElement>,
    year: string,
    amount: number,
    circleX: number,
    circleY: number,
    isExtraPoint?: boolean
  ) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    // Use the circle's center x, and position y at the top of the invisible circle (radius 9)
    const x = circleX;
    const y = circleY - 9; // Top of invisible circle (bottom of tooltip will align here)

    setTooltip({ x, y, amount, isExtraPoint });
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        marginLeft: '20px',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ fontFamily: 'sans-serif', fontSize: '10px' }}
      >
        {/* Y-axis line */}
        <line
          x1={adjustedPadding.left}
          y1={adjustedPadding.top}
          x2={adjustedPadding.left}
          y2={adjustedPadding.top + chartHeight}
          stroke="#333"
          strokeWidth="1"
        />

        {/* X-axis line */}
        <line
          x1={adjustedPadding.left}
          y1={adjustedPadding.top + chartHeight}
          x2={adjustedPadding.left + chartWidth}
          y2={adjustedPadding.top + chartHeight}
          stroke="#333"
          strokeWidth="1"
        />

        {/* Plot one black dot per year (overall average for that year) */}
        {sortedYears.map((year, index) => {
          const amount = yearAverages[year];
          const x = adjustedPadding.left + xScale(index);
          const y = adjustedPadding.top + yScale(amount);
          if (typeof amount !== 'number') return null;
          return (
            <g key={year}>
              {/* Invisible hover circle (3x radius) */}
              <circle
                cx={x}
                cy={y}
                r={9}
                fill="transparent"
                onMouseEnter={e => handleMouseEnter(e, year, amount, x, y)}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'pointer' }}
              />
              {/* Visible data circle */}
              <circle
                cx={x}
                cy={y}
                r={3}
                fill="#000"
                onMouseEnter={e => handleMouseEnter(e, year, amount, x, y)}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'pointer' }}
              />
            </g>
          );
        })}

        {/* Plot extra data point if provided */}
        {extraPoint &&
          (() => {
            const idx = sortedYears.indexOf(extraPoint.year);
            if (idx === -1) return null;
            const x = adjustedPadding.left + xScale(idx);
            const y = adjustedPadding.top + yScale(extraPoint.amount);
            return (
              <g>
                {/* Invisible hover circle (3x radius) */}
                <circle
                  cx={x}
                  cy={y}
                  r={9}
                  fill="transparent"
                  onMouseEnter={e =>
                    handleMouseEnter(
                      e,
                      extraPoint.year,
                      extraPoint.amount,
                      x,
                      y,
                      true
                    )
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Visible data circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={3}
                  fill={designUtils.blueColor}
                  onMouseEnter={e =>
                    handleMouseEnter(
                      e,
                      extraPoint.year,
                      extraPoint.amount,
                      x,
                      y,
                      true
                    )
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })()}

        {/* X-axis labels (show every year) */}
        {sortedYears.map((year, index) => (
          <text
            key={year}
            x={adjustedPadding.left + xScale(index)}
            y={height - 5}
            textAnchor="middle"
            fill="#333"
          >
            {year}
          </text>
        ))}

        {/* Y-axis labels */}
        <text
          x={adjustedPadding.left - 15}
          y={adjustedPadding.top + chartHeight + 3}
          textAnchor="end"
          fill="#333"
        >
          ${Math.round(minAmount)}
        </text>
        <text
          x={adjustedPadding.left - 15}
          y={adjustedPadding.top + 3}
          textAnchor="end"
          fill="#333"
        >
          ${Math.round(maxAmount)}
        </text>
        {/* No overall line or label */}
      </svg>

      {/* Tooltip - must be outside SVG */}
      {tooltip && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            marginBottom: '5px',
            maxWidth: '60px',
          }}
        >
          <div className="tooltip-content">
            {tooltip.isExtraPoint
              ? `your pension: $${Math.round(tooltip.amount).toLocaleString()}`
              : `$${Math.round(tooltip.amount).toLocaleString()}`}
          </div>
        </div>
      )}
    </div>
  );
};
