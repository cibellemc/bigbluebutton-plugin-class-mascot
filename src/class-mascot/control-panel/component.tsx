import * as React from 'react';
import { useState } from 'react';
import { MdAdd, MdRestartAlt } from 'react-icons/md';
import { BBButton, BBBTypography } from '@bigbluebutton/bbb-ui-components-react';

import { INITIAL_POINTS, MASCOT_OPTIONS, MAX_POINTS } from '../constants';
import { MascotModel, MascotState } from '../types';
import MascotImage from '../mascot-image/component';
import LevelBar from '../mascot-view/level-bar';
import InactivityStepper from './inactivity-stepper';
import Styled from './styles';

interface ControlPanelProps {
  assetsBaseUrl: string;
  mascotState: MascotState | null;
  isReady: boolean;
  onSelectModel: (model: MascotModel) => void;
  onAddPoint: () => void;
  onChangeInactivityMinutes: (minutes: number) => void;
  onReset: () => void;
}

// Moderator settings, rendered in the sidebar panel next to the other apps.
function ControlPanel({
  assetsBaseUrl,
  mascotState,
  isReady,
  onSelectModel,
  onAddPoint,
  onChangeInactivityMinutes,
  onReset,
}: ControlPanelProps): React.ReactElement {
  const [introImageFailed, setIntroImageFailed] = useState<boolean>(false);

  return (
    <Styled.Panel data-test="class-mascot-settings">
      <Styled.Content>
        <Styled.Intro>
          {!introImageFailed && (
            <Styled.IntroImageWrapper>
              <Styled.IntroImage
                src={`${assetsBaseUrl}/assets/mascot_panel.svg`}
                alt="Mascote da turma evoluindo com a participação"
                onError={() => setIntroImageFailed(true)}
              />
            </Styled.IntroImageWrapper>
          )}
          <BBBTypography>
            O mascote da turma cresce com a participação dos alunos. A cada participação que você
            confirmar, ele ganha um ponto e evolui, do nível 1 ao 10. Se a turma ficar muito tempo
            sem participar, ele perde pontos. Todos na sala acompanham o mascote numa janela
            flutuante.
          </BBBTypography>
        </Styled.Intro>
        {/* Current level with the actions used during the class. */}
        {mascotState && (
          <Styled.Section aria-labelledby="class-mascot-status-title">
            <BBBTypography variant="selected" id="class-mascot-status-title">
              Status atual
            </BBBTypography>
            <BBBTypography>
              {`Dê +1 ponto quando a turma participar. Reiniciar volta o mascote ao nível ${INITIAL_POINTS}. Os mesmos botões ficam na janela do mascote.`}
            </BBBTypography>
            <Styled.Status data-test="class-mascot-status">
              <Styled.StatusRow>
                <MascotImage
                  assetsBaseUrl={assetsBaseUrl}
                  model={mascotState.model}
                  points={mascotState.points}
                  size="option"
                  decorative
                />
                <Styled.StatusLevel>
                  <Styled.LevelText>{`Nível ${mascotState.points}/${MAX_POINTS}`}</Styled.LevelText>
                  <LevelBar points={mascotState.points} />
                </Styled.StatusLevel>
              </Styled.StatusRow>
              <Styled.StatusActions>
                <BBButton
                  fullWidth
                  variant="secondary"
                  size="sm"
                  label="Reiniciar"
                  iconStart={<MdRestartAlt />}
                  ariaLabel={`Reiniciar pontos, volta ao nível ${INITIAL_POINTS}`}
                  tooltipLabel={`Reiniciar (volta ao nível ${INITIAL_POINTS})`}
                  disabled={!isReady || mascotState.points === INITIAL_POINTS}
                  dataTest="class-mascot-reset"
                  onClick={onReset}
                />
                <BBButton
                  fullWidth
                  size="sm"
                  label="1 ponto"
                  iconStart={<MdAdd />}
                  ariaLabel="Adicionar 1 ponto de participação"
                  disabled={!isReady || mascotState.points >= MAX_POINTS}
                  onClick={onAddPoint}
                />
              </Styled.StatusActions>
            </Styled.Status>
          </Styled.Section>
        )}

        <Styled.Section aria-labelledby="class-mascot-models-title">
          <BBBTypography variant="selected" id="class-mascot-models-title">
            Escolha o mascote
          </BBBTypography>
          <BBBTypography>Quem vai representar a turma?</BBBTypography>
          {!isReady && <BBBTypography>Conectando à sala…</BBBTypography>}
          {mascotState?.visible === false && (
            <BBBTypography>
              O mascote está fechado para a turma. Escolha um mascote para mostrá-lo de novo.
            </BBBTypography>
          )}
          <Styled.ModelOptions role="radiogroup" aria-labelledby="class-mascot-models-title">
            {MASCOT_OPTIONS.map((option) => {
              const selected = mascotState?.model === option.model;
              return (
                <Styled.ModelOption
                  key={option.model}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  $selected={selected}
                  disabled={!isReady}
                  onClick={() => onSelectModel(option.model)}
                >
                  <MascotImage
                    assetsBaseUrl={assetsBaseUrl}
                    model={option.model}
                    points={INITIAL_POINTS}
                    size="option"
                    decorative
                  />
                  <BBBTypography as="span" variant={selected ? 'selected' : 'default'}>
                    {option.label}
                  </BBBTypography>
                </Styled.ModelOption>
              );
            })}
          </Styled.ModelOptions>
        </Styled.Section>

        {mascotState && (
          <InactivityStepper
            minutes={mascotState.inactivityMinutes}
            disabled={!isReady}
            onChange={onChangeInactivityMinutes}
          />
        )}
      </Styled.Content>
    </Styled.Panel>
  );
}

export default ControlPanel;
