import * as React from 'react';
import { useEffect, useReducer, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';

import {
  FloatingWindow,
  GenericContentSidekickArea,
  demoUser,
  subscribeToUi,
  uiStore,
  dataChannelStorageKey,
  openDemoPanel,
  simulateStudentMessage,
  simulateStudentReaction,
} from './sdk-mock';
import ClassMascot from '../src/class-mascot/component';
import { DATA_CHANNEL_NAME } from '../src/class-mascot/constants';
import './style.css';

// Mirrors BBB's floating window: content is created once per window id, and dragging
// moves the element with `transform: translate(...)` like react-draggable does.
function FloatingWindowHost({ floatingWindow }: { floatingWindow: FloatingWindow }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    x: floatingWindow.props.left,
    y: floatingWindow.props.top,
  });

  useEffect(() => {
    const root = floatingWindow.props.contentFunction(hostRef.current);
    return () => {
      setTimeout(() => root.unmount());
    };
    // Like BBB, the content is created once per window.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDrag = (event: React.PointerEvent) => {
    if (!floatingWindow.props.movable) return;
    if ((event.target as HTMLElement).closest('button')) return;
    const startX = event.clientX - position.x;
    const startY = event.clientY - position.y;
    const onMove = (e: PointerEvent) =>
      setPosition({ x: e.clientX - startX, y: e.clientY - startY });
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className="demo-floating-window"
      ref={hostRef}
      onPointerDown={startDrag}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        backgroundColor: floatingWindow.props.backgroundColor,
        boxShadow: floatingWindow.props.boxShadow,
      }}
    />
  );
}

// Mirrors BBB's sidebar panel: the plugin content is mounted when the panel opens
// and unmounted when it closes.
function SidekickContentHost({ item }: { item: GenericContentSidekickArea }) {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = item.props.contentFunction(hostRef.current);
    return () => {
      setTimeout(() => root.unmount());
    };
    // Like BBB, the content is created once per open panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);
  return <div className="demo-sidekick-content" ref={hostRef} />;
}

function DemoShell() {
  const [, forceRender] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const unsubscribe = subscribeToUi(forceRender);
    // The plugin's effects run before this one, so catch up on what it already set.
    forceRender();
    return unsubscribe;
  }, []);

  const isModerator = demoUser.role === 'MODERATOR';
  const otherRoleUrl = `${window.location.pathname}?role=${isModerator ? 'viewer' : 'moderator'}`;

  const resetDemo = () => {
    try {
      localStorage.removeItem(dataChannelStorageKey(DATA_CHANNEL_NAME));
    } catch {
      // Nothing stored.
    }
    window.dispatchEvent(new Event('class-mascot-demo:data-channel'));
  };

  return (
    <div className="demo-shell">
      <header className="demo-header">
        <strong>Demo local · Mascote da turma</strong>
        <span className={`demo-role ${isModerator ? 'moderator' : 'viewer'}`}>
          {`${demoUser.name} (${isModerator ? 'moderador' : 'aluno'})`}
        </span>
        <a href={otherRoleUrl} target="_blank" rel="noreferrer">
          {`Abrir como ${isModerator ? 'aluno' : 'moderador'} em nova aba`}
        </a>
        <button type="button" onClick={simulateStudentMessage}>
          Aluno mandou mensagem
        </button>
        <button type="button" onClick={simulateStudentReaction}>
          Aluno reagiu
        </button>
        <button type="button" onClick={resetDemo}>
          Zerar estado
        </button>
        {/* Plugin buttons on the right of BBB's top bar; the demo only places RIGHT ones. */}
        <span className="demo-nav-bar-right">
          {uiStore.navBarItems
            .filter((item) => item.props.position === 'right')
            .map((item) => (
              <button
                key={item.id}
                type="button"
                className="demo-nav-bar-button"
                title={item.props.tooltip}
                aria-label={item.props.label}
                data-test={item.props.dataTest}
                disabled={item.props.disabled}
                onClick={item.props.onClick}
              >
                {item.props.icon.svgContent as React.ReactNode}
              </button>
            ))}
        </span>
      </header>
      <div className="demo-body">
        <nav className="demo-rail" aria-label="Menu lateral">
          <button
            type="button"
            className={uiStore.openPanel === 'gallery' ? 'active' : ''}
            onClick={() => openDemoPanel(uiStore.openPanel === 'gallery' ? null : 'gallery')}
          >
            Apps
          </button>
          {uiStore.genericContentItems.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.props.name}
              data-test={item.props.dataTest}
              className={uiStore.openPanel === item.id ? 'active' : ''}
              onClick={() => openDemoPanel(uiStore.openPanel === item.id ? null : item.id)}
            >
              {item.props.name}
            </button>
          ))}
        </nav>
        {uiStore.openPanel === 'gallery' && (
          <aside className="demo-gallery">
            <h2>Galeria de apps</h2>
            {uiStore.appsGalleryItems.length + uiStore.genericContentItems.length === 0 && (
              <p className="demo-empty">Nenhum app para este papel.</p>
            )}
            {/* Sidebar panels from plugins are listed in the gallery too, like in BBB. */}
            {uiStore.genericContentItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="demo-gallery-item"
                onClick={() => openDemoPanel(item.id)}
              >
                {item.props.name}
              </button>
            ))}
            {uiStore.appsGalleryItems.map((item) => (
              <button
                key={item.name}
                type="button"
                className="demo-gallery-item"
                onClick={item.onClick}
              >
                {item.name}
              </button>
            ))}
          </aside>
        )}
        {uiStore.genericContentItems
          .filter((item) => item.id === uiStore.openPanel)
          .map((item) => (
            <aside key={item.id} className="demo-sidekick">
              <SidekickContentHost item={item} />
            </aside>
          ))}
        <main className="demo-presentation">
          <p>Área da apresentação</p>
        </main>
      </div>
      {uiStore.floatingWindows.map((floatingWindow) => (
        <FloatingWindowHost key={floatingWindow.id} floatingWindow={floatingWindow} />
      ))}
      <ClassMascot pluginUuid="demo" pluginName="ClassMascot" assetsBaseUrl="" />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<DemoShell />);
