import {
  FunctionComponent,
  useMemo,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<TimelineData | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [height, setHeight] = useState(600);

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

  const handleHoverLeave = useCallback(() => {
    setSelectedItem(null);
    setAnchorEl(null);
  }, []);

  const handleHover = useCallback((event: MouseEvent, item: TimelineData) => {
    setSelectedItem(item);
    // Create a temporary anchor element at the mouse position
    if (!anchorRef.current && containerRef.current) {
      const anchor = document.createElement('div');
      anchor.style.position = 'absolute';
      anchor.style.pointerEvents = 'none';
      anchor.style.width = '1px';
      anchor.style.height = '1px';
      containerRef.current.appendChild(anchor);
      anchorRef.current = anchor;
    }
    if (anchorRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      anchorRef.current.style.left = `${event.clientX - containerRect.left}px`;
      anchorRef.current.style.top = `${event.clientY - containerRect.top}px`;
      setAnchorEl(anchorRef.current);
    }
  }, []);

  // ResizeObserver to track container dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial dimensions immediately
    const updateDimensions = () => {
      if (container) {
        const containerWidth = container.offsetWidth || window.innerWidth;
        const containerHeight = Math.max(container.offsetHeight || 600, 600);
        setWidth(containerWidth);
        setHeight(containerHeight);
      }
    };

    // Set initial dimensions
    updateDimensions();

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newWidth =
          entry.contentRect?.width ||
          entry.target.clientWidth ||
          container.offsetWidth ||
          window.innerWidth;
        const newHeight = Math.max(
          entry.contentRect?.height ||
            entry.target.clientHeight ||
            container.offsetHeight ||
            600,
          600
        );
        setWidth(newWidth);
        setHeight(newHeight);
      }
    });
    observer.observe(container);

    // Also listen to window resize as fallback
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || processedData.length === 0 || width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 200, right: 120, bottom: 200, left: 120 };
    const containerWidth = width;
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
      .on('mouseenter', (event, d) => handleHover(event as MouseEvent, d))
      .on('mouseleave', handleHoverLeave);

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
        .attr('opacity', 0.3)
        .style('cursor', 'pointer')
        .on('mouseenter', event => handleHover(event as MouseEvent, d))
        .on('mouseleave', handleHoverLeave);
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
        .on('mouseenter', event => handleHover(event as MouseEvent, d))
        .on('mouseleave', handleHoverLeave);

      // Calculate text dimensions for background
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
  }, [
    processedData,
    highlightedData,
    regularData,
    width,
    height,
    handleHover,
    handleHoverLeave,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '600px',
        display: 'block',
      }}
    >
      <svg
        ref={svgRef}
        width={width || '100%'}
        height={height}
        style={{ display: 'block' }}
      />

      {/* Tooltip */}
      <TimelineCard
        timelineData={selectedItem}
        anchorEl={anchorEl}
        onClose={handleHoverLeave}
        open={!!selectedItem && !!anchorEl}
      />
    </div>
  );
};
