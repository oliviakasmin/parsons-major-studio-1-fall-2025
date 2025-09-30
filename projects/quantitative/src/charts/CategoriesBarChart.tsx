import { useRef, useEffect, forwardRef } from 'react';
import * as d3 from 'd3';
import './index.css';
import categoryData from '../../data/viz_data/category_count_dict.json';

interface ImportedCategoryData {
  count: number;
  NAIDs: string; // Pipe-separated string ("||") of NAIDs for application that contain a file in this category
  page_count: string; // Pipe-separated string ("||") of page counts for each file in the category
  avg_page_count: number;
}

interface CategoryChartData {
  category: string;
  count: number;
  averagePageCount: number;
}

// Only plot these categories from the imported data (the others are admin files, etc.)
const appCategories = [
  'soldier',
  'rejected',
  'widow',
  'bounty land warrant',
  'old war',
  'N A Acc',
  'unknown',
];

// Transform imported data - filter for allowed categories only
const data: CategoryChartData[] = Object.entries(
  categoryData as Record<string, ImportedCategoryData>
)
  .filter(([category]) => appCategories.includes(category))
  .map(([category, values]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
    count: values.count,
    averagePageCount: values.avg_page_count,
  }))
  .sort((a, b) => b.count - a.count); // Sort by count descending for total applications

export const CategoriesBarChart = forwardRef<
  HTMLDivElement,
  {
    useCountData: boolean;
    setUseCountData: (useCountData: boolean) => void;
  }
>(({ useCountData, setUseCountData }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Set dimensions
    const margin = { top: 40, right: 30, bottom: 120, left: 80 };
    const width = 600;
    const height = 400;

    // Create or update SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create x-scale (never changes)
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.category))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    // Create x-axis only if it doesn't exist
    if (svg.selectAll('.x-axis').empty()) {
      const xAxis = d3.axisBottom(xScale).tickSize(0);
      svg
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(xAxis)
        .selectAll('text')
        .attr('dx', '0')
        .attr('dy', '0.5em')
        .attr('text-anchor', 'middle')
        .attr('transform', () => {
          return 'rotate(-45)';
        });

      // Add x-axis label
      svg
        .append('text')
        .attr('class', 'x-axis-label text-center')
        .attr('transform', `translate(${width / 2}, ${height - 5})`)
        .text('Application Category');
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
      .selectAll<SVGRectElement, CategoryChartData>('rect')
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
      .selectAll<SVGTextElement, CategoryChartData>('.bar-label')
      .data(data)
      .join(
        // Enter: create new labels
        enter =>
          enter
            .append('text')
            .attr('class', 'bar-label entering text-center')
            .attr('x', d => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
            .attr('text-anchor', 'middle')
            .attr('y', height - margin.bottom)
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
            .attr('text-anchor', 'middle')
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

    // Update y-axis (changes with data)
    const yAxis = d3.axisLeft(yScale).ticks(5);

    // Remove existing y-axis and y-axis label, then create new ones
    svg.selectAll('.y-axis, .y-axis-label').remove();

    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);

    // Add y-axis label (conditional based on data view)
    svg
      .append('text')
      .attr('class', 'y-axis-label text-center')
      .attr(
        'transform',
        `rotate(-90) translate(${-height / 2}, ${margin.left / 8})`
      )
      .text(
        useCountData
          ? 'Number of Applications'
          : 'Average Pages per Application'
      );
  }, [useCountData]);

  return (
    <div ref={ref}>
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
});
