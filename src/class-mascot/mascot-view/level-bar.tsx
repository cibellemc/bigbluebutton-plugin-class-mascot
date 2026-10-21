import * as React from 'react';

import { MAX_POINTS, MIN_POINTS } from '../constants';
import Styled from './styles';

// Progress from level 1 to 10, shared by the mascot view and the settings panel.
function LevelBar({ points }: { points: number }): React.ReactElement {
  return (
    <Styled.Bar
      role="progressbar"
      aria-valuemin={MIN_POINTS}
      aria-valuemax={MAX_POINTS}
      aria-valuenow={points}
      aria-label="Nível do mascote"
    >
      <Styled.BarFill style={{ width: `${(points / MAX_POINTS) * 100}%` }} />
    </Styled.Bar>
  );
}

export default LevelBar;
