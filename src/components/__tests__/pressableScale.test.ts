import { readFileSync } from 'fs';
import { join } from 'path';

// Regression guard for the "empty pill" bug that only reproduced on iOS builds
// (TestFlight): PressableScale's inner pressable used `flex: 1`, whose RN
// shorthand sets `flexBasis: 0`. Shells without an explicit height (CTA pills,
// quick-timer chips, text buttons, meal rows) then measured to zero height and
// iOS clipped the label away, while web still painted the overflow.
//
// This is a source-level check because the project has no renderer for
// component tests; it is cheap and pins the exact style that regressed.
const source = readFileSync(join(__dirname, '..', 'PressableScale.tsx'), 'utf8');

const fillBlock = source.slice(source.indexOf('fill: {'), source.indexOf('});', source.indexOf('fill: {')));

describe('PressableScale inner fill style', () => {
  it('does not use the `flex: 1` shorthand (it would zero out flexBasis)', () => {
    expect(fillBlock).not.toMatch(/flex:\s*1/);
  });

  it('measures its own content so auto-height shells keep their label', () => {
    expect(fillBlock).toMatch(/flexBasis:\s*'auto'/);
  });

  it('still fills shells that do have a fixed size', () => {
    expect(fillBlock).toMatch(/flexGrow:\s*1/);
  });
});
