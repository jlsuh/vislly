import { type JSX, useState } from 'react';
import generateDataset from './generateDataset';
import useInterval from './useInterval';

/*
// Imperative version
function Circles() {
  const [dataset, setDataset] = useState(generateDataset());
  const ref = useRef(null);

  useEffect(() => {
    const svgElement = d3.select(ref.current);
    svgElement
      .selectAll('circle')
      .data(dataset)
      .join('circle')
      .attr('cx', (d) => d[0])
      .attr('cy', (d) => d[1])
      .attr('r', 0.25);
  }, [dataset]);

  useInterval(() => {
    const newDataset = generateDataset();
    setDataset(newDataset);
  }, 250);

  return <svg viewBox="0 0 100 50" ref={ref} />;
}
*/

// Expressive version
function Circles(): JSX.Element {
  const [dataset, setDataset] = useState(generateDataset());

  useInterval(() => {
    const newDataset = generateDataset();
    setDataset(newDataset);
  }, 250);

  return (
    <svg viewBox="0 0 100 50">
      <title>Circles</title>
      {dataset.map(([id, x, y]) => (
        <circle key={id} cx={x} cy={y} r={0.25} />
      ))}
    </svg>
  );
}

export default Circles;
