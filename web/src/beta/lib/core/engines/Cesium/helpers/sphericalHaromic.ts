import { Cartesian3 } from "cesium";

const sphericalHarmonicCoefficientsScratch = [
  new Cartesian3(),
  new Cartesian3(),
  new Cartesian3(),
  new Cartesian3(),
  new Cartesian3(),
  new Cartesian3(),
  new Cartesian3(),
  new Cartesian3(),
  new Cartesian3(),
];

export const arrayToCartecian3 = (
  sphericalHarmonicCoefficients: [x: number, y: number, z: number][] | undefined,
  intensity: number | undefined,
) =>
  sphericalHarmonicCoefficients?.length === 9
    ? sphericalHarmonicCoefficients.map((cartesian, index) =>
        Cartesian3.multiplyByScalar(
          new Cartesian3(...cartesian),
          intensity ?? 1.0,
          sphericalHarmonicCoefficientsScratch[index],
        ),
      )
    : undefined;
