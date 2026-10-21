import styled from 'styled-components';
import {
  colors,
  spacingXSmall,
  spacingSmall,
  spacingSmallMedium,
  spacingMedium,
} from '@bigbluebutton/bbb-ui-components-react';

// Width of the expanded card, also used to open it below the paw button.
const CARD_WIDTH_REM = 15;

const Card = styled.div<{ $minimized: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ $minimized }: { $minimized: boolean }) =>
    $minimized ? 'auto' : `${CARD_WIDTH_REM}rem`};
  color: ${colors.text.default};
`;

// Minimized for the current user only: picture, level and the essential buttons.
const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacingSmall};
  padding: ${spacingXSmall} ${spacingXSmall} ${spacingXSmall} ${spacingSmall};
`;

const ChipText = styled.div`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
`;

// Read by screen readers, not shown.
const VisuallyHidden = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacingSmall};
  min-height: 2.5rem;
  padding: ${spacingXSmall} ${spacingXSmall} ${spacingXSmall} ${spacingSmallMedium};
  border-bottom: 1px solid ${colors.neutral.neutral4};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${spacingXSmall};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${spacingSmall};
  padding: ${spacingSmall} ${spacingSmallMedium} ${spacingSmallMedium};
`;

// Reset and +1 side by side, with the same width.
const Actions = styled.div`
  display: flex;
  gap: ${spacingSmall};

  & > * {
    flex: 1 1 0;
    min-width: 0;
  }
`;

const Confirm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacingMedium};
  padding: ${spacingMedium} ${spacingSmallMedium} ${spacingSmallMedium};
  text-align: center;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: ${spacingSmall};

  & > * {
    flex: 1;
  }
`;

export { CARD_WIDTH_REM };

export default {
  Card,
  Chip,
  ChipText,
  VisuallyHidden,
  Header,
  HeaderActions,
  Body,
  Actions,
  Confirm,
  ConfirmActions,
};
