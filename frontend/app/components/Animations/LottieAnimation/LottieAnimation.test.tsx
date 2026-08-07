import React from 'react';
import { render } from '@testing-library/react';
import LottieAnimation, { isValidLottieData } from './LottieAnimation';

describe('LottieAnimation Component & Data Validation', () => {
  it('correctly identifies valid and invalid Lottie JSON data', () => {
    const validLottie = { v: '5.7.0', layers: [{ id: 1 }] };
    const validDefaultWrapped = { default: { layers: [{ id: 1 }] } };
    const invalidEmpty = {};
    const invalidNull = null;
    const invalidNoLayers = { v: '5.7.0' };

    expect(isValidLottieData(validLottie)).not.toBeNull();
    expect(isValidLottieData(validDefaultWrapped)).not.toBeNull();
    expect(isValidLottieData(invalidEmpty)).toBeNull();
    expect(isValidLottieData(invalidNull)).toBeNull();
    expect(isValidLottieData(invalidNoLayers)).toBeNull();
  });

  it('renders gracefully with invalid or empty animation data without crashing', () => {
    const { container } = render(
      <LottieAnimation animationData={{} as any} ariaLabel="Test fallback animation" />
    );
    expect(container).toBeInTheDocument();
  });
});
