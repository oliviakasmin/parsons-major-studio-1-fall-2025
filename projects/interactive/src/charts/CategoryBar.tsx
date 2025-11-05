import { FunctionComponent } from 'react';
import categoryData from '../../data/viz_data/category_count_dict.json';
import { CategoryType } from '../ApplicationCategories';
import * as d3 from 'd3';
import { useRef, useEffect, useState } from 'react';
import { designUtils } from '../design_utils';

interface CategoryBarProps {
  category: CategoryType;
  height: number;
  isSelectedCategory: boolean;
}

const appCategories = [
  'soldier',
  'rejected',
  'widow',
  'bounty land warrant',
  'old war',
  'N A Acc',
] as const;

interface ImportedCategoryData {
  count: number;
  avg_page_count: number;
}

interface CategoryChartData {
  category: string;
  count: number;
}

// Map appCategory keys (from JSON) to CategoryType (display format)
const mapAppCategoryToCategoryType = (appCategory: string): string => {
  const mapping: Record<string, string> = {
    soldier: 'Survived (soldier)',
    widow: 'Widow',
    rejected: 'Rejected',
    'bounty land warrant': 'Bounty land warrant',
    'old war': 'Old War',
    'N A Acc': 'N A Acc',
  };

  return (
    mapping[appCategory] ||
    appCategory.charAt(0).toUpperCase() + appCategory.slice(1)
  );
};

// Transform imported data - filter for allowed categories only
const data: CategoryChartData[] = Object.entries(
  categoryData as Record<string, ImportedCategoryData>
)
  .filter(([category]) =>
    appCategories.includes(category as (typeof appCategories)[number])
  )
  .map(([category, values]) => ({
    category: mapAppCategoryToCategoryType(category),
    count: values.count,
  }));

export const CategoryBar: FunctionComponent<CategoryBarProps> = ({
  category,
  height,
  isSelectedCategory,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const marginRight = 160;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(container);

    // Cleanup
    return () => observer.disconnect();
  }, []);

  // Find the data for the selected category
  const selectedCategoryData = data.find(d => d.category === category);

  // D3 rendering effect
  useEffect(() => {
    if (!width || !selectedCategoryData) return;
    const svg = d3.select(containerRef.current).select('svg');

    // Clear previous drawing
    svg.selectAll('*').remove();

    // Calculate dots based on count rounded up to nearest roundTo
    const maxCount = d3.max(data, d => d.count) || 0;
    const xScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([0, width - marginRight]);

    // Set rounding unit (e.g., 1000) so it is easy to tweak later
    const roundTo = 500;

    // Round count up to nearest roundTo to get number of circles
    const numCircles = Math.ceil(selectedCategoryData.count / roundTo);

    // Get circle radius from xScale - use width per roundTo as spacing
    const spacingPerUnit = xScale(roundTo);
    const gap = 1; // gap in px between adjacent circles
    const circleRadius = Math.min(spacingPerUnit / 2 - gap / 2, height / 4); // shrink radius by 1px to create 2px gap
    const spacing = spacingPerUnit; // Spacing between circle centers
    // Create array of circle indices
    const circleData = Array.from({ length: numCircles }, (_, i) => i);

    svg
      .selectAll<SVGCircleElement, number>('circle')
      .data(circleData)
      .join(enter =>
        enter
          .append('circle')
          .attr('class', 'category-bar-dot')
          .attr('cx', (_d, i) => i * spacing + circleRadius)
          .attr('cy', height / 2)
          .attr('r', circleRadius)
          .attr('fill', designUtils.iconButtonColor)
          .attr('fill-opacity', 0)
          .transition()
          .duration(400)
          .delay((_d, i) => i * 10) // Stagger the animation
          .ease(d3.easeCubicOut)
          .attr('fill-opacity', 1)
      );

    //add label after the bar so the end of each label is aligned with the full width of the container
    svg
      .selectAll<SVGTextElement, CategoryChartData>('text')
      .data([selectedCategoryData])
      .join(enter =>
        enter
          .append('text')
          .attr('class', 'category-bar-label')
          .attr('x', width)
          .attr('y', height / 2)
          .text(d => `${d?.count.toLocaleString()}`)
          .attr('text-anchor', 'end')
          .attr('font-size', '12px')
          .attr('font-weight', 'normal')
          .attr('font-family', 'inherit')
          .attr('dominant-baseline', 'middle')
          .style('text-transform', 'none')
      );
  }, [width, height, selectedCategoryData]);

  // Separate effect to update text content and font-weight when selection changes, without re-rendering the bar
  useEffect(() => {
    if (!width || !selectedCategoryData) return;
    const svg = d3.select(containerRef.current).select('svg');
    const textElement = svg.select('.category-bar-label');
    if (!textElement.empty()) {
      const formattedCount = selectedCategoryData.count.toLocaleString();
      const labelText = isSelectedCategory
        ? `${formattedCount} applications`
        : `${formattedCount}`;

      if (isSelectedCategory) {
        // When selected, animate from right edge (width) to reveal the text
        // Start with text positioned off-screen to the right
        textElement
          .attr('x', width + 200) // Start off-screen to the right
          .text(labelText)
          .attr('font-weight', 'bold')
          .transition()
          .duration(600)
          .ease(d3.easeCubicOut)
          .attr('x', width); // Animate to final position
      } else {
        // When deselected, just update without animation
        textElement
          .text(labelText)
          .attr('font-weight', 'normal')
          .attr('x', width);
      }
    }
  }, [isSelectedCategory, width, selectedCategoryData]);

  return (
    <div ref={containerRef}>
      <svg width={width} height={height} />
    </div>
  );
};
