import { Profiler, useLayoutEffect, useEffect, useRef, type ReactNode } from 'react';
import { collectDomMetrics, finishRenderDebugTrace, logProfilerRender, logRenderDebug, type RenderDebugTrace } from '../utils/renderDebug';

interface DebuggableMarkdownContentProps {
  children: ReactNode;
  className: string;
  debugTrace: RenderDebugTrace | null;
  developerMode: boolean;
  profilerId: string;
}

function DebuggableMarkdownContent({ children, className, debugTrace, developerMode, profilerId }: DebuggableMarkdownContentProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!developerMode || !debugTrace) return;
    logRenderDebug(debugTrace, 'dom:commit', collectDomMetrics(contentRef.current));
  });

  useEffect(() => {
    if (!developerMode || !debugTrace) return undefined;
    const frameId = window.requestAnimationFrame(() => {
      logRenderDebug(debugTrace, 'dom:next-frame-visible', collectDomMetrics(contentRef.current));
      finishRenderDebugTrace(debugTrace, 'next-frame-visible');
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [debugTrace, developerMode]);

  const content = <div ref={contentRef} className={className}>{children}</div>;
  if (!developerMode || !debugTrace) return content;

  return (
    <Profiler
      id={profilerId}
      onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
        logProfilerRender(debugTrace, id, phase, actualDuration, baseDuration, startTime, commitTime);
      }}
    >
      {content}
    </Profiler>
  );
}

export default DebuggableMarkdownContent;
