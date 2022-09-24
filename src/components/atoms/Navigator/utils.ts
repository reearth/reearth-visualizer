export const calculateDegreeOfCompass = (
  compass: {
    x: number;
    y: number;
    height: number;
    width: number;
  },
  currentPosition: { x: number; y: number },
) => {
  const compassCenterPos = {
    x: compass.x + compass.width / 2,
    y: compass.y + compass.height / 2,
  };

  // It assumes that compassCenterPos is center, calculate x,y axis
  const x = currentPosition.x - compassCenterPos.x;
  const y = currentPosition.y - compassCenterPos.y;

  // Calculate degree of x,y axis
  // `Math.atan2` return radian but this is hard to handle it.
  // So we transform radian to degree the following mathematical formula.
  // `degree = radian * (180˚ / π)`
  return Math.atan2(y, x) * (180 / Math.PI) + 90;
};
