import { lazy, Suspense, useEffect, useState } from 'react';
import { useSiteTheme } from '@/lib/useSiteTheme';

const CodeMirrorJavaEditor = lazy(() => import('@/components/java-playground/CodeMirrorJavaEditor'));

interface Props {
  fileName: string;
  code: string;
  onChange: (value: string) => void;
  status?: string;
  busy?: boolean;
}

export default function JavaEditorPane({
  fileName,
  code,
  onChange,
  status,
  busy = false,
}: Props) {
  const siteTheme = useSiteTheme();
  // The editor is only rendered after mount. During the static build the lazy module can still be
  // pending on the first page rendered, which writes an unresolved Suspense boundary into that
  // page's HTML; hydration then waits forever for streamed content that never arrives.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const loading = <p className="jp-editor-loading">Loading editor…</p>;

  return (
    <div className="jp-editor">
      <div className="jp-editor-header">
        <span>{fileName}</span>
        <span className="jp-status">{status || 'Editable'}</span>
      </div>
      <div className="jp-editor-body">
        {mounted ? (
          <Suspense fallback={loading}>
            <CodeMirrorJavaEditor
              code={code}
              onChange={onChange}
              readOnly={busy}
              theme={siteTheme}
            />
          </Suspense>
        ) : (
          loading
        )}
      </div>
    </div>
  );
}
