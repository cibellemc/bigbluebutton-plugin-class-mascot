// Stand-in for bigbluebutton-html-plugin-sdk, so the plugin runs outside BBB.
// The webpack demo config aliases the SDK import to this file.
// Data channels live in localStorage, so tabs of the same browser share them
// like participants of a room. The role comes from the URL: ?role=viewer.
// It mirrors several SDK classes and logs to the console, like the real logger.
/* eslint-disable max-classes-per-file, no-console */
import { useEffect, useState } from 'react';
import type * as ReactDOM from 'react-dom/client';

export enum DataChannelTypes {
  ALL_ITEMS = 'Hooks::DataChannel::AllItems',
  NEW_ITEMS = 'Hooks::DataChannel::NewItems',
  LATEST_ITEM = 'Hooks::DataChannel::LatestItem',
}

export const RESET_DATA_CHANNEL = 'resetDataChannel';

const params = new URLSearchParams(window.location.search);
const role = params.get('role') === 'viewer' ? 'VIEWER' : 'MODERATOR';

function getUserId(): string {
  try {
    const stored = sessionStorage.getItem('class-mascot-demo:userId');
    if (stored) return stored;
    const created = `w_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('class-mascot-demo:userId', created);
    return created;
  } catch {
    return 'w_demo';
  }
}

export const demoUser = {
  userId: getUserId(),
  extId: 'demo',
  name: params.get('name') || (role === 'MODERATOR' ? 'Professora' : 'Estudante'),
  role,
  presenter: role === 'MODERATOR',
  cameras: [] as { streamId: string }[],
};

export const pluginLogger = {
  info: (...args: unknown[]) => console.info('[plugin]', ...args),
  warn: (...args: unknown[]) => console.warn('[plugin]', ...args),
  error: (...args: unknown[]) => console.error('[plugin]', ...args),
  debug: (...args: unknown[]) => console.debug('[plugin]', ...args),
};

interface AppsGalleryProps {
  name: string;
  icon: string;
  onClick: () => void;
}

export class AppsGalleryEntry {
  name: string;

  icon: string;

  onClick: () => void;

  constructor({ name, icon, onClick }: AppsGalleryProps) {
    this.name = name;
    this.icon = icon;
    this.onClick = onClick;
  }
}

interface FloatingWindowProps {
  id?: string;
  top: number;
  left: number;
  movable: boolean;
  backgroundColor: string;
  boxShadow: string;
  contentFunction: (element: HTMLElement) => ReactDOM.Root;
}

export class FloatingWindow {
  id: string;

  props: FloatingWindowProps;

  constructor(props: FloatingWindowProps) {
    // Like the SDK: a random id unless the plugin sets one.
    this.id = props.id || `floating-${Math.random().toString(36).slice(2)}`;
    this.props = props;
  }
}

interface GenericContentSidekickAreaProps {
  id?: string;
  name: string;
  section: string;
  buttonIcon: unknown;
  open: boolean;
  dataTest?: string;
  contentFunction: (element: HTMLElement) => ReactDOM.Root;
}

export class GenericContentSidekickArea {
  id: string;

  props: GenericContentSidekickAreaProps;

  constructor(props: GenericContentSidekickAreaProps) {
    this.id = props.id || `generic-${Math.random().toString(36).slice(2)}`;
    this.props = props;
  }
}

export enum NavBarItemPosition {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

interface NavBarButtonProps {
  id?: string;
  label: string;
  icon: { svgContent?: unknown };
  tooltip: string;
  disabled: boolean;
  position: NavBarItemPosition;
  hasSeparator: boolean;
  circle?: boolean;
  hideLabel?: boolean;
  dataTest?: string;
  onClick: () => void;
}

export class NavBarButton {
  id: string;

  props: NavBarButtonProps;

  constructor(props: NavBarButtonProps) {
    this.id = props.id || `nav-bar-${Math.random().toString(36).slice(2)}`;
    this.props = props;
  }
}

// What the plugin injected into the UI; the demo shell renders it.
export const uiStore = {
  appsGalleryItems: [] as AppsGalleryEntry[],
  floatingWindows: [] as FloatingWindow[],
  genericContentItems: [] as GenericContentSidekickArea[],
  navBarItems: [] as NavBarButton[],
  // 'gallery', the id of a generic content panel, or null when the sidebar is closed.
  openPanel: 'gallery' as string | null,
};

const uiListeners = new Set<() => void>();

export function subscribeToUi(listener: () => void): () => void {
  uiListeners.add(listener);
  return () => {
    uiListeners.delete(listener);
  };
}

function emitUiChange() {
  uiListeners.forEach((listener) => listener());
}

interface DataChannelEntry<T> {
  entryId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  channelName: string;
  subChannelName: string;
  pluginName: string;
  toRoles: string[];
  payloadJson: T;
}

const DATA_CHANNEL_EVENT = 'class-mascot-demo:data-channel';

export function dataChannelStorageKey(channelName: string, subChannelName = 'default'): string {
  return `class-mascot-demo:${channelName}:${subChannelName}`;
}

function readEntries<T>(key: string): DataChannelEntry<T>[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function writeEntries<T>(key: string, entries: DataChannelEntry<T>[]) {
  try {
    localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    // Storage blocked: the demo still works inside this tab only.
  }
  window.dispatchEvent(new Event(DATA_CHANNEL_EVENT));
}

function useDataChannel<T>(
  channelName: string,
  dataChannelType: DataChannelTypes = DataChannelTypes.ALL_ITEMS,
  subChannelName = 'default'
) {
  const key = dataChannelStorageKey(channelName, subChannelName);
  const [entries, setEntries] = useState<DataChannelEntry<T>[]>(() => readEntries<T>(key));

  useEffect(() => {
    const refresh = () => setEntries(readEntries<T>(key));
    window.addEventListener('storage', refresh);
    window.addEventListener(DATA_CHANNEL_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(DATA_CHANNEL_EVENT, refresh);
    };
  }, [key]);

  const pushEntry = (payloadJson: T) => {
    const now = new Date().toISOString();
    writeEntries(key, [
      ...readEntries<T>(key),
      {
        entryId: Math.random().toString(36).slice(2),
        createdAt: now,
        updatedAt: now,
        createdBy: demoUser.userId,
        channelName,
        subChannelName,
        pluginName: 'ClassMascot',
        toRoles: [],
        payloadJson,
      },
    ]);
  };

  const deleteEntry = (entryIds: string[]) => {
    if (entryIds.includes(RESET_DATA_CHANNEL)) {
      writeEntries(key, []);
      return;
    }
    writeEntries(
      key,
      readEntries<T>(key).filter((e) => !entryIds.includes(e.entryId))
    );
  };

  const replaceEntry = (entryId: string, payloadJson: T) => {
    writeEntries(
      key,
      readEntries<T>(key).map((e) =>
        e.entryId === entryId ? { ...e, payloadJson, updatedAt: new Date().toISOString() } : e
      )
    );
  };

  const data = dataChannelType === DataChannelTypes.LATEST_ITEM ? entries.slice(-1) : entries;

  return {
    data: { loading: false, data },
    pushEntry,
    deleteEntry,
    replaceEntry,
  };
}

// Simulated student activity, answered to the plugin's custom subscriptions.
const demoActivity = {
  latestMessage: null as { messageId: string; createdAt: string } | null,
  reactions: [] as { userId: string; reactionEmoji: string | null }[],
};

export function simulateStudentMessage(): void {
  demoActivity.latestMessage = {
    messageId: Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
  };
  emitUiChange();
}

export function simulateStudentReaction(): void {
  demoActivity.reactions = [{ userId: 'demo-student', reactionEmoji: '👍' }];
  emitUiChange();
  // Like BBB, the reaction clears after a few seconds.
  setTimeout(() => {
    demoActivity.reactions = [{ userId: 'demo-student', reactionEmoji: null }];
    emitUiChange();
  }, 3000);
}

function useCustomSubscription<T>(query: string) {
  const [, setVersion] = useState(0);
  useEffect(() => subscribeToUi(() => setVersion((v) => v + 1)), []);
  let data: unknown = null;
  if (query.includes('chat_message_public')) {
    data = { chat_message_public: demoActivity.latestMessage ? [demoActivity.latestMessage] : [] };
  } else if (query.includes('reactionEmoji')) {
    data = { user: demoActivity.reactions };
  }
  return { loading: false, data: data as T };
}

const pluginApi = {
  useCurrentUser: () => ({ loading: false, data: demoUser }),
  // Only this tab's user is known, so each moderator tab runs the inactivity timer.
  useUsersBasicInfo: () => ({
    loading: false,
    data: {
      user: [
        {
          ...demoUser,
          nameSortable: demoUser.name,
          bot: false,
          avatar: '',
          color: '#f28c28',
          isModerator: demoUser.role === 'MODERATOR',
        },
      ],
    },
  }),
  useDataChannel,
  useCustomSubscription,
  useMeetingData: <T>(projection?: (meeting: { meetingId: string }) => T) => {
    const meeting = { meetingId: 'demo-meeting' };
    return { loading: false, data: projection ? projection(meeting) : meeting };
  },
  setAppsGalleryItems: (items: AppsGalleryEntry[]) => {
    uiStore.appsGalleryItems = items;
    emitUiChange();
  },
  setFloatingWindows: (windows: FloatingWindow[]) => {
    uiStore.floatingWindows = windows;
    emitUiChange();
  },
  setGenericContentItems: (items: GenericContentSidekickArea[]) => {
    uiStore.genericContentItems = items;
    emitUiChange();
  },
  setNavBarItems: (items: NavBarButton[]) => {
    uiStore.navBarItems = items;
    emitUiChange();
  },
  uiCommands: {
    sidekickArea: {
      panel: {
        open: (id: string) => {
          uiStore.openPanel = id;
          emitUiChange();
        },
        close: (id?: string) => {
          if (!id || uiStore.openPanel === id) uiStore.openPanel = null;
          emitUiChange();
        },
      },
    },
  },
};

export function openDemoPanel(panel: string | null): void {
  uiStore.openPanel = panel;
  emitUiChange();
}

export type PluginApi = typeof pluginApi;
export type AppsGalleryInterface = AppsGalleryEntry;

export const BbbPluginSdk = {
  initialize: (): void => undefined,
  getPluginApi: (): PluginApi => pluginApi,
};
