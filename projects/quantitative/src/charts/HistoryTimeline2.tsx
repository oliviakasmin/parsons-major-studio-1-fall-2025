// very simple d3 timeline with dates on x-axis
// most simple implementation possible with no extra frills or bells and whistles

// data that is highlight: false is a small dot along the x-axis with a tooltip hover that shows the date
// data that is highlight: true has a text label above the x-axis with the year and the main takeaway
// for the highlight: true data the y-axis is staggered for every 3 entries to avoid overlap

// typography should be extremely simple and inherit the font from the rest of the project

import { FunctionComponent, useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import timelineData from '../../historical_research/timeline.json';
import { TimelineCard } from '../components';

interface TimelineData {
  date: string;
  historical_context: string;
  relevant_quotes: string;
  relevant_categories: string;
  main_takeaway: string;
  category_applicability_note: string;
  highlight: boolean;
}

export const HistoryTimeline2: FunctionComponent = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedItem, setSelectedItem] = useState<TimelineData | null>(null);

  const processedData = useMemo(() => {
    // Filter out entries with "archival-category" dates and convert dates
    const validData = timelineData.filter(
      (item: TimelineData) =>
        item.date !== 'archival-category' && item.date !== ''
    );

    return validData.map((item: TimelineData) => ({
      ...item,
      parsedDate: new Date(item.date),
      year: new Date(item.date).getFullYear(),
    }));
  }, []);

  const highlightedData = processedData.filter(item => item.highlight);
  const regularData = processedData.filter(item => !item.highlight);

  // Extract and process categories
  const categoryData = useMemo(() => {
    const categoryMap = new Map<
      string,
      { firstDate: Date; lastDate: Date; firstIndex: number }
    >();

    processedData.forEach((item, index) => {
      const categories = item.relevant_categories
        .split('||')
        .map(cat => cat.trim());
      categories.forEach(category => {
        if (category && category !== '') {
          if (!categoryMap.has(category)) {
            categoryMap.set(category, {
              firstDate: item.parsedDate,
              lastDate: item.parsedDate,
              firstIndex: index,
            });
          } else {
            const existing = categoryMap.get(category)!;
            if (item.parsedDate < existing.firstDate) {
              existing.firstDate = item.parsedDate;
              existing.firstIndex = index;
            }
            if (item.parsedDate > existing.lastDate) {
              existing.lastDate = item.parsedDate;
            }
          }
        }
      });
    });

    // Sort categories by first appearance (earliest first)
    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => a.firstIndex - b.firstIndex);
  }, [processedData]);

  useEffect(() => {
    if (!svgRef.current || processedData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 200, right: 100, bottom: 200, left: 100 };
    const containerWidth = window.innerWidth;
    const height = 600;
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', containerWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(processedData, d => d.parsedDate) as [Date, Date])
      .range([0, innerWidth]);

    // Create x-axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat(d3.timeFormat('%Y') as any)
      .ticks(8);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis as any);

    // Add category lines below x-axis
    const categoryLineSpacing = 25; // Space between category lines
    const categoryStartY = innerHeight + 40; // Start 40px below x-axis

    categoryData.forEach((categoryInfo, index) => {
      const yPosition = categoryStartY + index * categoryLineSpacing;
      const startX = xScale(categoryInfo.firstDate);

      // For "Rejected" category, extend to the end of the timeline
      const endX =
        categoryInfo.category === 'Rejected'
          ? xScale(d3.max(processedData, d => d.parsedDate) as Date)
          : xScale(categoryInfo.lastDate);

      // Draw horizontal line of dots
      const dotSpacing = 8; // Space between dots
      const numDots = Math.floor((endX - startX) / dotSpacing);

      for (let i = 0; i <= numDots; i++) {
        const dotX = startX + i * dotSpacing;
        g.append('circle')
          .attr('cx', dotX)
          .attr('cy', yPosition)
          .attr('r', 1.5)
          .attr('fill', '#999')
          .attr('opacity', 0.7);
      }

      // Add category label at the start of the line
      g.append('text')
        .attr('x', startX - 5)
        .attr('y', yPosition + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('font-family', 'inherit')
        .attr('fill', '#666')
        .text(categoryInfo.category);
    });

    // Add regular data points (small dots)
    g.selectAll('.regular-dot')
      .data(regularData)
      .enter()
      .append('circle')
      .attr('class', 'regular-dot')
      .attr('cx', d => xScale(d.parsedDate))
      .attr('cy', innerHeight)
      .attr('r', 6)
      .attr('fill', '#666')
      .style('cursor', 'pointer')
      .on('click', (_, d) => setSelectedItem(d));

    // First, draw all lines for highlighted data points
    highlightedData.forEach((d, i) => {
      const staggerLevel = i % 3; // Cycle through 0, 1, 2, 0, 1, 2...
      const yOffset = -100 - staggerLevel * 140;

      // Calculate text height to extend line below full text
      const takeawayText = d.historical_context;
      const maxWidth = 200;
      const lineHeight = 16;
      const words = takeawayText.split(' ');
      let line = '';
      const lines = [];

      words.forEach(word => {
        const testLine = line + word + ' ';
        const testWidth = testLine.length * 6; // Approximate character width
        if (testWidth > maxWidth && line !== '') {
          lines.push(line);
          line = word + ' ';
        } else {
          line = testLine;
        }
      });
      if (line) {
        lines.push(line);
      }

      const textHeight = 14 + lines.length * lineHeight; // 14px for year + lines for historical context
      const lineEndY = innerHeight + yOffset - 8 + textHeight + 8; // 8px padding below text

      // Add line from axis to below the full text label
      g.append('line')
        .attr('x1', xScale(d.parsedDate))
        .attr('y1', innerHeight)
        .attr('x2', xScale(d.parsedDate))
        .attr('y2', lineEndY)
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3);
    });

    // Then, draw all text labels for highlighted data points
    highlightedData.forEach((d, i) => {
      const staggerLevel = i % 3; // Cycle through 0, 1, 2, 0, 1, 2...
      const yOffset = -100 - staggerLevel * 140;

      // Add text label with year and takeaway on separate lines
      const textGroup = g
        .append('g')
        .attr(
          'transform',
          `translate(${xScale(d.parsedDate)}, ${innerHeight + yOffset - 8})`
        )
        .style('cursor', 'pointer')
        .on('click', () => setSelectedItem(d));

      // Calculate text dimensions for background
      //   const yearText = d.year;
      const takeawayText = d.historical_context;
      const maxWidth = 200;
      const lineHeight = 16;
      const words = takeawayText.split(' ');
      let line = '';
      const lines = [];

      words.forEach(word => {
        const testLine = line + word + ' ';
        const testWidth = testLine.length * 6; // Approximate character width
        if (testWidth > maxWidth && line !== '') {
          lines.push(line);
          line = word + ' ';
        } else {
          line = testLine;
        }
      });
      if (line) {
        lines.push(line);
      }

      // Year text with white background
      textGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-family', 'inherit')
        .attr('font-weight', 'bold')
        .attr('y', 0)
        .attr('fill', 'black')
        .attr('stroke', 'white')
        .attr('stroke-width', '8px')
        .attr('paint-order', 'stroke fill')
        .text(d.year);

      // Create text elements for each line of takeaway text with white background
      lines.forEach((lineText, index) => {
        textGroup
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-family', 'inherit')
          .attr('y', 14 + index * lineHeight)
          .attr('x', 0)
          .attr('fill', 'black')
          .attr('stroke', 'white')
          .attr('stroke-width', '6px')
          .attr('paint-order', 'stroke fill')
          .text(lineText);
      });
    });
  }, [processedData, highlightedData, regularData, categoryData]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} />

      {/* Modal */}
      {selectedItem && (
        <TimelineCard
          timelineData={selectedItem}
          onClose={() => setSelectedItem(null)}
          isOpen={true}
        />
      )}
    </div>
  );
};
