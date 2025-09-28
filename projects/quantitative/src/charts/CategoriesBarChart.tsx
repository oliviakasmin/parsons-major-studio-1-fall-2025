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
  const [useCountData] = useState(true);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions
    const margin = { top: 100, right: 50, bottom: 100, left: 80 };
    const width = 800;
    const height = 600;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create scales
    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, d => (useCountData ? d.count : d.averagePageCount)) || 0,
      ])
      .range([height - margin.bottom, margin.top]);

    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.category))
      .range([margin.left, width - margin.right]);

    // Create bars
    svg
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.category) || 0)
      .attr('y', d => yScale(useCountData ? d.count : d.averagePageCount))
      .attr('width', xScale.bandwidth())
      .attr(
        'height',
        d =>
          height -
          margin.bottom -
          yScale(useCountData ? d.count : d.averagePageCount)
      )
      .attr('rx', 4);

    // Add labels on bars
    svg
      .selectAll('.bar-label')
      .data(data)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(useCountData ? d.count : d.averagePageCount) - 5)
      .attr('text-anchor', 'middle')
      .text(d =>
        useCountData ? d.count.toLocaleString() : d.averagePageCount.toFixed(1)
      );

    const xAxis = d3.axisBottom(xScale).tickSize(0);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.6em')
      .attr('dy', '-0.1em')
      .attr('transform', () => {
        return 'rotate(-45)';
      });

    // Y Axis - copying from lab main.js
    const yAxis = d3.axisLeft(yScale).ticks(5);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);
  }, [useCountData]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};
