import * as React from 'react';
import { useEffect, useState } from 'react';
import { MdAdd, MdRemove } from 'react-icons/md';
import { BBButton, BBBTypography } from '@bigbluebutton/bbb-ui-components-react';

import Styled from './styles';

const MIN_INACTIVITY_MINUTES = 1;
const MAX_INACTIVITY_MINUTES = 30;

interface InactivityStepperProps {
  minutes: number;
  disabled: boolean;
  onChange: (minutes: number) => void;
}

function clampMinutes(minutes: number): number {
  return Math.min(MAX_INACTIVITY_MINUTES, Math.max(MIN_INACTIVITY_MINUTES, Math.round(minutes)));
}

// Minutes without participation that cost the mascot a point. The buttons save
// right away; a typed value is saved on Enter or when leaving the field, since every
// change restarts the countdown.
function InactivityStepper({
  minutes,
  disabled,
  onChange,
}: InactivityStepperProps): React.ReactElement {
  const [draft, setDraft] = useState<string>(String(minutes));

  useEffect(() => {
    setDraft(String(minutes));
  }, [minutes]);

  const commit = (value: number) => {
    const next = Number.isFinite(value) ? clampMinutes(value) : minutes;
    setDraft(String(next));
    if (next !== minutes) onChange(next);
  };

  return (
    <Styled.Section>
      <BBBTypography variant="selected" id="class-mascot-inactivity-title">
        Penalidade por inatividade
      </BBBTypography>
      <BBBTypography>Depois de quanto tempo sem participação a turma perde um ponto?</BBBTypography>
      <Styled.Stepper role="group" aria-labelledby="class-mascot-inactivity-title">
        <BBButton
          layout="circle"
          variant="secondary"
          size="md"
          icon={<MdRemove />}
          ariaLabel="Diminuir 1 minuto"
          disabled={disabled || minutes <= MIN_INACTIVITY_MINUTES}
          onClick={() => commit(minutes - 1)}
        />
        <Styled.StepperInput
          type="number"
          inputMode="numeric"
          min={MIN_INACTIVITY_MINUTES}
          max={MAX_INACTIVITY_MINUTES}
          value={draft}
          disabled={disabled}
          aria-label="Minutos sem participação"
          aria-describedby="class-mascot-inactivity-help"
          data-test="class-mascot-inactivity-minutes"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
          onBlur={() => commit(Number(draft))}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') commit(Number(draft));
          }}
        />
        <BBButton
          layout="circle"
          variant="secondary"
          size="md"
          icon={<MdAdd />}
          ariaLabel="Aumentar 1 minuto"
          disabled={disabled || minutes >= MAX_INACTIVITY_MINUTES}
          onClick={() => commit(minutes + 1)}
        />
        <BBBTypography as="span">min</BBBTypography>
      </Styled.Stepper>
      <BBBTypography id="class-mascot-inactivity-help">
        {`O mascote perde 1 ponto a cada ${minutes} min sem participação (de ${MIN_INACTIVITY_MINUTES} a ${MAX_INACTIVITY_MINUTES}).`}
      </BBBTypography>
    </Styled.Section>
  );
}

export default InactivityStepper;
