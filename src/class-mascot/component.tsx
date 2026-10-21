import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MdPets } from 'react-icons/md';
import * as ReactDOM from 'react-dom/client';

import {
  BbbPluginSdk,
  DataChannelTypes,
  FloatingWindow,
  GenericContentSidekickArea,
  NavBarButton,
  NavBarItemPosition,
  PluginApi,
  pluginLogger,
} from 'bigbluebutton-html-plugin-sdk';
import { colors } from '@bigbluebutton/bbb-ui-components-react';
import { DATA_CHANNEL_NAME } from './constants';
import { ClassMascotProps, MascotModel, MascotState } from './types';
import ControlPanel from './control-panel/component';
import ActivityWatcher from './activity-watcher/component';
import { pushRelayState, useRelayState } from './relay';
import {
  addPoint,
  hide,
  isVisible,
  nextDecayAt,
  normalize,
  registerActivity,
  resetPoints,
  selectModel,
  setInactivityMinutes,
} from './state';
import FloatingMascot from './floating-mascot/component';
import {
  positionBelow,
  readOpen,
  readSavedPosition,
  saveOpen,
  savePositionOnDrop,
} from './floating-mascot/position';
import { CARD_WIDTH_REM } from './floating-mascot/styles';

const MODERATOR_ROLE = 'MODERATOR';
// BBB keeps a floating window (and where it was dragged) while its id stays the same.
const FLOATING_WINDOW_ID = 'class-mascot-floating-window';
const SETTINGS_PANEL_ID = 'class-mascot-settings';
const NAV_BAR_BUTTON_ID = 'class-mascot-nav-bar-button';
const NAV_BAR_BUTTON_DATA_TEST = 'class-mascot-nav-bar-button';
// Same radius as the Live sidebar panels (measured; the library token is 1rem).
const FLOATING_WINDOW_RADIUS = '14px';

// BBB renders floating windows and sidebar panels into elements it owns, through a
// React root the plugin creates once. Content is updated by re-rendering that root,
// as long as BBB has not unmounted it (e.g. the sidebar panel was closed).
interface ExternalRoot {
  root: ReactDOM.Root;
  element: HTMLElement;
}

function renderIfMounted(target: ExternalRoot | null, node: React.ReactElement) {
  if (target?.element.isConnected) target.root.render(node);
}

function ClassMascot({ pluginUuid: uuid, assetsBaseUrl }: ClassMascotProps): React.ReactNode {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
  // Last state this user pushed, so the moderator's view works even if neither the
  // data channel nor the relay answer.
  const [localMascotState, setLocalMascotState] = useState<MascotState | null>(null);

  const currentUser = pluginApi.useCurrentUser();
  const meetingData = pluginApi.useMeetingData((meeting) => ({ meetingId: meeting.meetingId }));
  const meetingId = meetingData?.data?.meetingId;
  const {
    data: mascotStateResponse,
    pushEntry: pushMascotState,
    replaceEntry: replaceMascotState,
  } = pluginApi.useDataChannel<MascotState>(DATA_CHANNEL_NAME, DataChannelTypes.LATEST_ITEM);

  const channelEntry = mascotStateResponse?.data?.[0];
  const channelMascotState = channelEntry?.payloadJson ?? null;
  // The relay is only needed while the data channel stays empty.
  const relayMascotState = useRelayState(assetsBaseUrl, meetingId, !channelMascotState);
  const newestFallbackState =
    [localMascotState, relayMascotState]
      .filter(Boolean)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0] ?? null;
  const storedState: MascotState | null = channelMascotState ?? newestFallbackState;

  // Every client derives the current level from the stored state, and re-renders when
  // the next point is lost (see state.ts).
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!storedState) return undefined;
    const decayAt = nextDecayAt(storedState, Date.now());
    if (decayAt === null) return undefined;
    const timeout = setTimeout(() => setNow(Date.now()), Math.max(0, decayAt - Date.now()) + 50);
    return () => clearTimeout(timeout);
  }, [storedState, now]);
  const mascotState = useMemo(
    () => (storedState ? normalize(storedState, now) : null),
    [storedState, now]
  );

  // The SDK only provides pushEntry once BBB has set up the data channel.
  const isDataChannelReady = !!pushMascotState;
  const isModerator = currentUser?.data?.role === MODERATOR_ROLE;

  const saveState = (state: MascotState) => {
    setLocalMascotState(state);
    pushRelayState(assetsBaseUrl, meetingId, state);
    // Keep a single entry in the channel instead of one per change.
    if (channelEntry) {
      replaceMascotState(channelEntry.entryId, state);
      return;
    }
    if (!pushMascotState) {
      pluginLogger.warn('Class mascot data channel is not ready, state not saved', state);
      return;
    }
    pushMascotState(state);
  };

  const handleSelectModel = (model: MascotModel) =>
    saveState(selectModel(storedState, model, Date.now()));
  const handleAddPoint = () => saveState(addPoint(storedState, Date.now()));
  const handleReset = () => saveState(resetPoints(storedState, Date.now()));
  const handleHide = () => saveState(hide(storedState, Date.now()));
  const handleChangeInactivityMinutes = (minutes: number) =>
    saveState(setInactivityMinutes(storedState, minutes, Date.now()));

  // A student's chat message or reaction restarts the countdown (no points).
  const handleActivity = (at: number) => {
    if (!storedState) return;
    const next = registerActivity(storedState, at, Date.now());
    if (next !== storedState) saveState(next);
  };

  const isMascotVisible = !!mascotState && isVisible(mascotState);
  // Each user can close and reopen the floating window for themselves from the top bar.
  const [isWindowOpen, setWindowOpen] = useState<boolean>(readOpen);
  const showFloatingWindow = isMascotVisible && isWindowOpen;
  const toggleWindow = () => {
    setWindowOpen((open) => {
      saveOpen(!open);
      return !open;
    });
  };

  const openSettings = () => pluginApi.uiCommands?.sidekickArea.panel.open(SETTINGS_PANEL_ID);

  // Latest values for content rendered outside this component's React tree.
  const latest = useRef(null);
  latest.current = {
    mascotState,
    isModerator,
    isDataChannelReady,
    onSelectModel: handleSelectModel,
    onAddPoint: handleAddPoint,
    onReset: handleReset,
    onHide: handleHide,
    onChangeInactivityMinutes: handleChangeInactivityMinutes,
  };

  const floatingTarget = useRef<ExternalRoot | null>(null);
  const settingsTarget = useRef<ExternalRoot | null>(null);

  const renderFloatingContent = () => {
    const { mascotState: state, isModerator: moderator } = latest.current;
    if (!state) return;
    renderIfMounted(
      floatingTarget.current,
      <FloatingMascot
        assetsBaseUrl={assetsBaseUrl}
        mascotState={state}
        isModerator={moderator}
        onAddPoint={() => latest.current.onAddPoint()}
        onReset={() => latest.current.onReset()}
        onOpenSettings={openSettings}
        onHide={() => latest.current.onHide()}
      />
    );
  };

  const renderSettingsContent = () => {
    const { mascotState: state, isDataChannelReady: ready } = latest.current;
    renderIfMounted(
      settingsTarget.current,
      <ControlPanel
        assetsBaseUrl={assetsBaseUrl}
        mascotState={state}
        isReady={ready}
        onSelectModel={(model) => latest.current.onSelectModel(model)}
        onAddPoint={() => latest.current.onAddPoint()}
        onChangeInactivityMinutes={(minutes) => latest.current.onChangeInactivityMinutes(minutes)}
        onReset={() => latest.current.onReset()}
      />
    );
  };

  // Moderators get the settings in the sidebar, next to the other apps. BBB
  // also lists this panel in the apps gallery, so no separate gallery entry is needed.
  useEffect(() => {
    if (!isModerator) {
      settingsTarget.current = null;
      pluginApi.setGenericContentItems([]);
      return;
    }
    pluginApi.setGenericContentItems([
      new GenericContentSidekickArea({
        id: SETTINGS_PANEL_ID,
        name: 'Mascote da turma',
        section: 'Apps',
        buttonIcon: { svgContent: <MdPets /> },
        open: false,
        dataTest: 'class-mascot-sidebar-button',
        contentFunction: (element: HTMLElement) => {
          const root = ReactDOM.createRoot(element);
          settingsTarget.current = { root, element };
          renderSettingsContent();
          return root;
        },
      }),
    ]);
    // Registered once per role: BBB keeps the panel and its content is re-rendered
    // through settingsTarget, so the handlers do not need to be dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModerator]);

  // Paw button on the right of the top bar, for everyone while the mascot is shown.
  useEffect(() => {
    if (!isMascotVisible) {
      pluginApi.setNavBarItems([]);
      return;
    }
    pluginApi.setNavBarItems([
      new NavBarButton({
        id: NAV_BAR_BUTTON_ID,
        label: isWindowOpen ? 'Esconder o mascote' : 'Mostrar o mascote',
        tooltip: isWindowOpen ? 'Esconder o mascote (só para você)' : 'Mostrar o mascote',
        icon: { svgContent: <MdPets /> },
        circle: true,
        hideLabel: true,
        disabled: false,
        position: NavBarItemPosition.RIGHT,
        hasSeparator: false,
        dataTest: NAV_BAR_BUTTON_DATA_TEST,
        onClick: toggleWindow,
      }),
    ]);
    // toggleWindow only uses the state setter, so it does not need to be a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMascotVisible, isWindowOpen]);

  // Everyone in the room sees the mascot once a moderator picks one, unless they
  // closed it from the top bar. The window is only created when it shows up, so a
  // +1 does not move it back.
  useEffect(() => {
    if (!showFloatingWindow) {
      floatingTarget.current = null;
      pluginApi.setFloatingWindows([]);
      return;
    }
    // Opens below the paw button; where it was last dropped if the button is not shown.
    const anchor = document.querySelector(`[data-test="${NAV_BAR_BUTTON_DATA_TEST}"]`);
    const { top, left } = positionBelow(anchor, CARD_WIDTH_REM) ?? readSavedPosition();
    const floatingWindow = new FloatingWindow({
      id: FLOATING_WINDOW_ID,
      top,
      left,
      movable: true,
      backgroundColor: colors.background.white,
      boxShadow: `0 4px 16px ${colors.shadow.default}`,
      contentFunction: (element: HTMLElement) => {
        // BBB gives the window element itself; round it like the sidebar panels.
        Object.assign(element.style, { borderRadius: FLOATING_WINDOW_RADIUS, overflow: 'hidden' });
        savePositionOnDrop(element);
        const root = ReactDOM.createRoot(element);
        floatingTarget.current = { root, element };
        renderFloatingContent();
        return root;
      },
    });
    pluginApi.setFloatingWindows([floatingWindow]);
    // Recreating the window on other changes would reset where it was dragged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFloatingWindow]);

  useEffect(() => {
    renderFloatingContent();
    renderSettingsContent();
    // The render functions read everything from refs; these are the values they show.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mascotState, isModerator, isDataChannelReady]);

  return isModerator ? <ActivityWatcher pluginApi={pluginApi} onActivity={handleActivity} /> : null;
}

export default ClassMascot;
