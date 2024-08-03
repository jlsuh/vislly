import BouncingBall from './playground/brownian-motion/BouncingBall';

function App(): JSX.Element {
  return (
    // <div
    //   style={{
    //     display: 'flex',
    //     flexDirection: 'column',
    //     alignItems: 'center',
    //   }}
    // >
    //   <Svg />
    //   <Circle />
    //   <Circles />
    //   <CartesianAxis />
    // </div>

    // TODO: Already working for width
    // <ChartWithDimensions />

    <>
      <BouncingBall />
      <BouncingBall />
    </>
  );
}

export default App;
