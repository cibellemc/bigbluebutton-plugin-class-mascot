import styled from 'styled-components';
import {
  colors,
  borderRadiusSmall,
  spacingXSmall,
  spacingSmall,
  spacingMedium,
  spacingLarge,
} from '@bigbluebutton/bbb-ui-components-react';

// Fills the sidekick panel BBB gives to the plugin, like the core panels.
const Panel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${colors.background.white};
  color: ${colors.text.default};
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacingLarge};
  padding: ${spacingMedium};
  overflow-y: auto;
`;

// Intro at the top of the panel, following the Word Cloud plugin: a centered
// illustration followed by a short description.
const Intro = styled.div`
  display: flex;
  flex-direction: column;
`;

const IntroImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: ${spacingMedium};
`;

const IntroImage = styled.img`
  width: 100%;
  max-width: 265px;
  height: auto;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacingSmall};
`;

const ModelOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacingSmall};
`;

const ModelOption = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacingXSmall};
  padding: ${spacingSmall};
  border: 2px solid
    ${({ $selected }) => ($selected ? colors.border.selected : colors.neutral.neutral4)};
  border-radius: ${borderRadiusSmall};
  background-color: ${({ $selected }) => ($selected ? colors.background.blue : colors.background.white)};
  color: ${colors.text.default};
  font: inherit;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${colors.hover.light};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px ${colors.border.focusRing};
  }

  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`;

// Current level on top, with reset and +1 below it.
const Status = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacingSmall};
  padding: ${spacingSmall};
  border-radius: ${borderRadiusSmall};
  background-color: ${colors.background.light};
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacingSmall};
`;

const StatusActions = styled.div`
  display: flex;
  gap: ${spacingSmall};

  & > * {
    flex: 1 1 0;
    min-width: 0;
  }
`;

// Bigger than the body text, so the level reads at a glance (the client's 1.25rem).
const LevelText = styled.span`
  color: ${colors.text.default};
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
`;

const StatusLevel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacingXSmall};
  min-width: 0;
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacingSmall};
`;

const StepperInput = styled.input`
  box-sizing: border-box;
  width: 4.5rem;
  /* Same height as the md round buttons on each side. */
  height: 3rem;
  padding: ${spacingXSmall} ${spacingSmall};
  font-size: 1.25rem;
  font-weight: 700;
  border: 1px solid ${colors.neutral.neutral4};
  border-radius: ${borderRadiusSmall};
  background-color: ${colors.background.white};
  color: ${colors.text.default};
  font-family: inherit;
  text-align: center;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px ${colors.border.focusRing};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

export default {
  Panel,
  Content,
  Intro,
  IntroImageWrapper,
  IntroImage,
  Section,
  ModelOptions,
  ModelOption,
  Status,
  StatusRow,
  StatusActions,
  StatusLevel,
  LevelText,
  Stepper,
  StepperInput,
};
