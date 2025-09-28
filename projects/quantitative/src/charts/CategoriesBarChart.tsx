import { FunctionComponent, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './index.css';

// Type definition for chart data
interface CategoryData {
  category: string;
  count: number;
  averagePageCount: number;
}

// Sample data - replace with actual data later
const data: CategoryData[] = [
  { category: 'Soldier', count: 34957, averagePageCount: 21.90193854959771 },
  { category: 'Widow', count: 24252, averagePageCount: 39.97608178235593 },
  { category: 'Rejected', count: 10745, averagePageCount: 24.568652849740932 },
  {
    category: 'Bounty Land Warrant',
    count: 3060,
    averagePageCount: 8.805217906907798,
  },
  { category: 'Unknown', count: 2179, averagePageCount: 38.64983937586049 },
  { category: 'Old War', count: 17, averagePageCount: 0 }, // No data available
];

export const CategoriesBarChart: FunctionComponent = () => {
  const [useCountData, setUseCountData] = useState(true);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Set dimensions
    const margin = { top: 100, right: 50, bottom: 100, left: 80 };
    const width = 800;
    const height = 600;

    // Create or update SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create x-scale (never changes)
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.category))
      .range([margin.left, width - margin.right]);

    // Create x-axis only if it doesn't exist
    if (svg.selectAll('.x-axis').empty()) {
      const xAxis = d3.axisBottom(xScale).tickSize(0);
      svg
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(xAxis)
        .selectAll('text')
        .attr('dx', '-.6em')
        .attr('dy', '-0.1em')
        .attr('transform', () => {
          return 'rotate(-45)';
        });
    }

    // Create y-scale (changes based on data)
    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, d => (useCountData ? d.count : d.averagePageCount)) || 0,
      ])
      .range([height - margin.bottom, margin.top]);

    // Create bars with transitions using d3.join()
    svg
      .selectAll<SVGRectElement, CategoryData>('rect')
      .data(data)
      .join(
        // Enter: create new bars
        enter =>
          enter
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.category) || 0)
            .attr('y', height - margin.bottom)
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('rx', 4)
            .transition()
            .duration(500)
            .attr('y', d => yScale(useCountData ? d.count : d.averagePageCount))
            .attr(
              'height',
              d =>
                height -
                margin.bottom -
                yScale(useCountData ? d.count : d.averagePageCount)
            ),
        // Update: transition existing bars
        update =>
          update
            .transition()
            .duration(500)
            .attr('y', d => yScale(useCountData ? d.count : d.averagePageCount))
            .attr(
              'height',
              d =>
                height -
                margin.bottom -
                yScale(useCountData ? d.count : d.averagePageCount)
            ),
        // Exit: remove bars that no longer have data
        exit =>
          exit
            .transition()
            .duration(500)
            .attr('height', 0)
            .attr('y', height - margin.bottom)
            .remove()
      );

    // Add labels on bars with transitions using d3.join()
    svg
      .selectAll<SVGTextElement, CategoryData>('.bar-label')
      .data(data)
      .join(
        // Enter: create new labels
        enter =>
          enter
            .append('text')
            .attr('class', 'bar-label entering')
            .attr('x', d => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
            .attr('y', height - margin.bottom)
            .attr('text-anchor', 'middle')
            .transition()
            .duration(500)
            .attr(
              'y',
              d => yScale(useCountData ? d.count : d.averagePageCount) - 5
            )
            .attr('class', 'bar-label entered')
            .text(d =>
              useCountData
                ? d.count.toLocaleString()
                : d.averagePageCount.toFixed(1)
            ),
        // Update: transition existing labels
        update =>
          update
            .transition()
            .duration(500)
            .attr(
              'y',
              d => yScale(useCountData ? d.count : d.averagePageCount) - 5
            )
            .text(d =>
              useCountData
                ? d.count.toLocaleString()
                : d.averagePageCount.toFixed(1)
            ),
        // Exit: remove labels that no longer have data
        exit =>
          exit
            .attr('class', 'bar-label entering')
            .transition()
            .duration(500)
            .remove()
      );

    // Update y-axis (only this changes with data)
    const yAxis = d3.axisLeft(yScale).ticks(5);

    // Remove existing y-axis and create new one
    svg.selectAll('.y-axis').remove();

    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);
  }, [useCountData]);

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <button
          onClick={() => setUseCountData(true)}
          className={useCountData ? 'active' : ''}
        >
          Count
        </button>
        <button
          onClick={() => setUseCountData(false)}
          className={!useCountData ? 'active' : ''}
        >
          Average Pages
        </button>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};
