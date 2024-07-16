/*
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

// Imperative version
function Circle() {
  const ref = useRef(null);

  useEffect(() => {
    const svgElement = d3.select(ref.current);
    svgElement.append('circle').attr('cx', 150).attr('cy', 70).attr('r', 50);
    return () => {
      // svgElement.select('*').remove();
      svgElement.selectAll('*').remove();
    };
  }, []);

  return <svg style={{ flex: 1 }} ref={ref} />;
}
*/

// Expressive version
function Circle() {
  return (
    <svg style={{ flex: 1 }}>
      <title>A circle</title>
      <circle cx="150" cy="77" r="40" />
    </svg>
  );
}

export default Circle;
