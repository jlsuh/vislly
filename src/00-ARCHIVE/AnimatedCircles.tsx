// function generateCircles() {
//   const data = [];
//   const numItems = Math.ceil(Math.random() * 5);

//   for (let i = 0; i < numItems; i++) {
//     data.push(40);
//   }

//   return data;
// }

// function AnimatedCircles() {
//   const [visibleCircles, setVisibleCircles] = useState(generateCircles());
//   const ref = useRef(null);

//   useInterval(() => {
//     setVisibleCircles(generateCircles());
//   }, 2000);

//   useEffect(() => {
//     const svgElement = d3.select(ref.current);
//     svgElement
//       .selectAll('circle')
//       .data(visibleCircles, (d) => d)
//       .join(
//         (enter) =>
//           enter
//             .append('circle')
//             .attr('cx', (d) => d * 15 + 10)
//             .attr('cy', 10)
//             .attr('r', 0)
//             .attr('fill', 'cornflowerblue')
//             .call((enter) =>
//               enter
//                 .transition()
//                 .duration(1200)
//                 .attr('cy', 10)
//                 .attr('r', 6)
//                 .style('opacity', 1),
//             ),
//         (update) => update.attr('fill', 'lightgrey'),
//         (exit) =>
//           exit
//             .attr('fill', 'tomato')
//             .call((exit) =>
//               exit
//                 .transition()
//                 .duration(1200)
//                 .attr('r', 0)
//                 .style('opacity', 0)
//                 .remove(),
//             ),
//       );
//   }, [visibleCircles]);

//   return <svg viewBox="0 0 100 20" ref={ref} />;
// }

// const allCircles = [0, 1, 2, 3, 4, 5];

// const AnimatedCircles = () => {
//   const [visibleCircles, setVisibleCircles] = useState(generateCircles());

//   useInterval(() => {
//     setVisibleCircles(generateCircles());
//   }, 2000);

//   return (
//     <svg viewBox="0 0 100 20">
//       <title>Animated</title>
//       {allCircles.map((d) => (
//         <AnimatedCircle
//           key={d}
//           index={d}
//           isShowing={visibleCircles.includes(d)}
//         />
//       ))}
//     </svg>
//   );
// };

// const AnimatedCircle = ({
//   index,
//   isShowing,
// }: {
//   index: number;
//   isShowing: boolean;
// }) => {
//   const wasShowing = useRef(false);

//   useEffect(() => {
//     wasShowing.current = isShowing;
//   }, [isShowing]);

//   const style = useSpring({
//     config: {
//       duration: 1200,
//     },
//     r: isShowing ? 6 : 0,
//     opacity: isShowing ? 1 : 0,
//   });

//   return (
//     <animated.circle
//       {...style}
//       cx={index * 15 + 10}
//       cy="10"
//       fill={
//         !isShowing
//           ? 'tomato'
//           : !wasShowing.current
//             ? 'cornflowerblue'
//             : 'lightgrey'
//       }
//     />
//   );
// };

// export default AnimatedCircles;
