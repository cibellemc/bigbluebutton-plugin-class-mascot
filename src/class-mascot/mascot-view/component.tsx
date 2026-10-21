import * as React from 'react';
import { BBBTypography } from '@bigbluebutton/bbb-ui-components-react';

import { MAX_POINTS, MASCOT_OPTIONS } from '../constants';
import { MascotModel } from '../types';
import MascotImage from '../mascot-image/component';
import { useLevelChange } from './level-change';
import LevelBar from './level-bar';
import Styled from './styles';

interface MascotViewProps {
  assetsBaseUrl: string;
  model: MascotModel;
  points: number;
}

function MascotView({ assetsBaseUrl, model, points }: MascotViewProps): React.ReactElement {
  const option = MASCOT_OPTIONS.find((o) => o.model === model);
  const { direction, changeKey } = useLevelChange(points);

  return (
    <Styled.Wrapper className="mascot-view">
      <MascotImage
        key={changeKey}
        assetsBaseUrl={assetsBaseUrl}
        model={model}
        points={points}
        size="large"
        direction={direction}
      />
      <Styled.Info>
        <BBBTypography variant="selected">{option?.label}</BBBTypography>
        <BBBTypography className="mascot-view-level">{`Nível ${points}/${MAX_POINTS}`}</BBBTypography>
      </Styled.Info>
      <LevelBar points={points} />
    </Styled.Wrapper>
  );
}

export default MascotView;
