import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  MdAdd,
  MdClose,
  MdExpandLess,
  MdExpandMore,
  MdOpenInFull,
  MdRestartAlt,
} from 'react-icons/md';
import { BBButton, BBBTypography } from '@bigbluebutton/bbb-ui-components-react';

import { INITIAL_POINTS, MASCOT_OPTIONS, MAX_POINTS } from '../constants';
import { MascotState } from '../types';
import MascotView from '../mascot-view/component';
import MascotImage from '../mascot-image/component';
import { levelChangeAnnouncement, useLevelChange } from '../mascot-view/level-change';
import { readMinimized, saveMinimized } from './position';
import Styled from './styles';

interface FloatingMascotProps {
  assetsBaseUrl: string;
  mascotState: MascotState;
  isModerator: boolean;
  onAddPoint: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  onHide: () => void;
}

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  dataTest: string;
  onClick: () => void;
}

// Small round button used in the window header.
function IconButton({ icon, label, tooltip, dataTest, onClick }: IconButtonProps) {
  return (
    <BBButton
      layout="circle"
      variant="subtle"
      color="neutral"
      size="sm"
      icon={icon}
      ariaLabel={label}
      tooltipLabel={tooltip}
      dataTest={dataTest}
      onClick={onClick}
    />
  );
}

// Content of the floating window everyone sees. Anyone can minimize it for
// themselves; moderators also get +1 and reset shortcuts, the settings panel and can hide
// the mascot for the whole class.
function FloatingMascot({
  assetsBaseUrl,
  mascotState,
  isModerator,
  onAddPoint,
  onReset,
  onOpenSettings,
  onHide,
}: FloatingMascotProps): React.ReactElement {
  const [confirmingHide, setConfirmingHide] = useState<boolean>(false);
  const [minimized, setMinimized] = useState<boolean>(readMinimized);
  const [announcement, setAnnouncement] = useState<string>('');
  const { points, model } = mascotState;
  const label = MASCOT_OPTIONS.find((o) => o.model === model)?.label ?? 'Mascote';
  const { previous, changeKey, direction } = useLevelChange(points);

  useEffect(() => {
    if (previous !== null) setAnnouncement(levelChangeAnnouncement(label, previous, points));
    // Announce only when the level changes, not when the label does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeKey]);

  const toggleMinimized = () => {
    setMinimized(!minimized);
    saveMinimized(!minimized);
  };

  const addPointButton = isModerator && (
    <BBButton
      size="sm"
      fullWidth={!minimized}
      label="1"
      ariaLabel="Adicionar 1 ponto de participação"
      iconStart={<MdAdd />}
      disabled={points >= MAX_POINTS}
      dataTest="class-mascot-add-point"
      onClick={onAddPoint}
    />
  );

  return (
    <Styled.Card
      role="region"
      aria-label="Mascote da turma"
      data-test="class-mascot-floating"
      $minimized={minimized}
    >
      <Styled.VisuallyHidden aria-live="polite">{announcement}</Styled.VisuallyHidden>

      {minimized ? (
        <Styled.Chip>
          <MascotImage
            key={changeKey}
            assetsBaseUrl={assetsBaseUrl}
            model={model}
            points={points}
            size="small"
            direction={direction}
          />
          <Styled.ChipText>
            <BBBTypography variant="selected">{label}</BBBTypography>
            <BBBTypography className="mascot-view-level">{`Nível ${points}/${MAX_POINTS}`}</BBBTypography>
          </Styled.ChipText>
          {addPointButton}
          <IconButton
            icon={<MdExpandMore />}
            label="Expandir o mascote"
            tooltip="Expandir"
            dataTest="class-mascot-expand"
            onClick={toggleMinimized}
          />
        </Styled.Chip>
      ) : (
        <>
          <Styled.Header>
            <BBBTypography variant="selected">Mascote da turma</BBBTypography>
            {!confirmingHide && (
              <Styled.HeaderActions>
                {isModerator && (
                  <IconButton
                    icon={<MdOpenInFull />}
                    label="Abrir configurações do mascote"
                    tooltip="Configurações: trocar mascote, reiniciar pontos"
                    dataTest="class-mascot-open-settings"
                    onClick={onOpenSettings}
                  />
                )}
                <IconButton
                  icon={<MdExpandLess />}
                  label="Minimizar o mascote só para mim"
                  tooltip="Minimizar (só para você)"
                  dataTest="class-mascot-minimize"
                  onClick={toggleMinimized}
                />
                {isModerator && (
                  <IconButton
                    icon={<MdClose />}
                    label="Fechar o mascote para toda a turma"
                    tooltip="Fechar o mascote"
                    dataTest="class-mascot-close"
                    onClick={() => setConfirmingHide(true)}
                  />
                )}
              </Styled.HeaderActions>
            )}
          </Styled.Header>

          {confirmingHide ? (
            <Styled.Confirm role="alertdialog" aria-labelledby="class-mascot-confirm-title">
              <BBBTypography id="class-mascot-confirm-title">
                Fechar o mascote para toda a turma?
              </BBBTypography>
              <BBBTypography variant="text3">
                Os pontos ficam guardados. Para mostrar de novo, escolha o mascote na galeria de
                apps.
              </BBBTypography>
              <Styled.ConfirmActions>
                <BBButton
                  variant="secondary"
                  size="sm"
                  label="Cancelar"
                  onClick={() => setConfirmingHide(false)}
                />
                <BBButton
                  color="danger"
                  size="sm"
                  label="Fechar"
                  dataTest="class-mascot-confirm-close"
                  onClick={onHide}
                />
              </Styled.ConfirmActions>
            </Styled.Confirm>
          ) : (
            <Styled.Body>
              <MascotView assetsBaseUrl={assetsBaseUrl} model={model} points={points} />
              {/* Just the buttons; the settings panel explains them. */}
              {isModerator && (
                <Styled.Actions>
                  <BBButton
                    fullWidth
                    variant="secondary"
                    size="sm"
                    label="Reiniciar"
                    iconStart={<MdRestartAlt />}
                    ariaLabel={`Reiniciar pontos, volta ao nível ${INITIAL_POINTS}`}
                    tooltipLabel={`Reiniciar (nível ${INITIAL_POINTS})`}
                    disabled={points === INITIAL_POINTS}
                    dataTest="class-mascot-floating-reset"
                    onClick={onReset}
                  />
                  {addPointButton}
                </Styled.Actions>
              )}
            </Styled.Body>
          )}
        </>
      )}
    </Styled.Card>
  );
}

export default FloatingMascot;
