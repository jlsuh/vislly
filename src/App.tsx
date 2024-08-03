import BrownianMotion from './quarantine/brownian-motion/BrownianMotion';

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

    // <>
    //   <div
    //     style={{
    //       display: 'flex',
    //       flexDirection: 'column',
    //       gap: '30px',
    //     }}
    //   >
    //     <BouncingBall />
    //     <BouncingBall />
    //   </div>
    // </>

    <BrownianMotion />
  );
}

export default App;
