import { FunctionComponent, useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import timelineData from '../../historical_research/timeline.json';
import { TimelineCard } from '../components';

type TimelineData = {
  date: string;
  historical_context: string;
  relevant_quotes: string;
  relevant_categories: string;
  main_takeaway: string;
  category_applicability_note: string;
  highlight: boolean;
};

// if date is 'archival-category' then skip that data point

export const HistoryTimeline: FunctionComponent = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedItem, setSelectedItem] = useState<TimelineData | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    data: TimelineData;
  } | null>(null);

  const data = useMemo(() => {
    return (timelineData as TimelineData[]).filter(
      d => d.date !== 'archival-category'
    );
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Force full width by using window width
    const containerWidth = window.innerWidth;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };

    svg.attr('width', containerWidth).attr('height', height);

    // Parse dates and create scale
    const dates = data.map(d => new Date(d.date));
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([margin.left, containerWidth - margin.right]);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat((domainValue, _index) => {
      if (domainValue instanceof Date) {
        return d3.timeFormat('%Y')(domainValue);
      }
      return '';
    });

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    // Add circles for each date
    svg
      .selectAll<SVGCircleElement, TimelineData>('.timeline-circle')
      .data(data)
      .join(
        // Enter: create new circles
        enter =>
          enter
            .append('circle')
            .attr('class', 'timeline-circle')
            .attr('cx', d => xScale(new Date(d.date)))
            .attr('cy', height / 2)
            .attr('r', 6)
            .attr('fill', d => (d.highlight ? '#000000' : '#9ca3af'))
            .attr('stroke', d => (d.highlight ? '#333333' : '#6b7280'))
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseenter', function (event, d) {
              const [x, y] = d3.pointer(event, svgRef.current);
              setTooltip({ x, y, data: d });
              // Change color on hover
              d3.select(this)
                .attr('fill', '#10b981') // Green color on hover
                .attr('stroke', '#059669');
            })
            .on('mouseleave', function (_, d) {
              setTooltip(null);
              // Restore original color
              d3.select(this)
                .attr('fill', d.highlight ? '#000000' : '#9ca3af')
                .attr('stroke', d.highlight ? '#333333' : '#6b7280');
            })
            .on('click', (_, d) => {
              setSelectedItem(d);
            }),
        // Update: update existing circles (no transitions)
        update =>
          update
            .attr('cx', d => xScale(new Date(d.date)))
            .attr('cy', height / 2)
            .attr('fill', d => (d.highlight ? '#000000' : '#9ca3af'))
            .attr('stroke', d => (d.highlight ? '#333333' : '#6b7280')),
        // Exit: remove circles that no longer have data
        exit => exit.remove()
      );
  }, [data]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '200px' }} />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 100,
          }}
        >
          <div className="tooltip-date">
            {new Date(tooltip.data.date).toLocaleDateString()}
          </div>
          <div className="tooltip-content">{tooltip.data.main_takeaway}</div>
        </div>
      )}

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
