import { useEffect, useMemo, useState } from 'react'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function createPreviewDocument({ projectName, selectedFileName, viewMode, refreshKey }) {
  const safeProjectName = escapeHtml(projectName || 'No project')
  const safeFileName = escapeHtml(selectedFileName || '선택된 파일 없음')
  const modeLabel = viewMode === 'mobile' ? 'Mobile Preview' : 'Desktop Preview'

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #e2e8f0;
        background:
          radial-gradient(circle at 18% 10%, rgba(34, 211, 238, 0.18), transparent 28rem),
          radial-gradient(circle at 90% 0%, rgba(16, 185, 129, 0.13), transparent 24rem),
          #07111f;
      }
      .page {
        min-height: 100vh;
        padding: ${viewMode === 'mobile' ? '22px 16px' : '44px'};
      }
      .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: ${viewMode === 'mobile' ? '28px' : '48px'};
      }
      .logo {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 800;
      }
      .logo-mark {
        display: grid;
        width: 34px;
        height: 34px;
        place-items: center;
        border-radius: 10px;
        background: rgba(34, 211, 238, 0.12);
        color: #67e8f9;
        border: 1px solid rgba(34, 211, 238, 0.28);
      }
      .status {
        border: 1px solid rgba(52, 211, 153, 0.25);
        border-radius: 999px;
        padding: 7px 11px;
        color: #6ee7b7;
        background: rgba(16, 185, 129, 0.1);
        font-size: 11px;
        font-weight: 800;
      }
      .hero {
        display: grid;
        grid-template-columns: ${viewMode === 'mobile' ? '1fr' : 'minmax(0, 1.1fr) minmax(260px, 0.9fr)'};
        gap: ${viewMode === 'mobile' ? '18px' : '32px'};
        align-items: stretch;
      }
      .card {
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 26px;
        background: rgba(15, 23, 42, 0.82);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
        padding: ${viewMode === 'mobile' ? '22px' : '32px'};
      }
      .eyebrow {
        margin: 0 0 12px;
        color: #67e8f9;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        color: #f8fafc;
        font-size: ${viewMode === 'mobile' ? '34px' : '56px'};
        line-height: 0.96;
        letter-spacing: -0.06em;
      }
      p {
        color: #94a3b8;
        line-height: 1.65;
      }
      .meta {
        display: grid;
        gap: 10px;
        margin-top: 22px;
      }
      .meta-row {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        border-top: 1px solid rgba(148, 163, 184, 0.13);
        padding-top: 10px;
        color: #64748b;
        font-size: 12px;
      }
      .meta-row strong {
        max-width: 58%;
        overflow: hidden;
        color: #cbd5e1;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .preview-list {
        display: grid;
        gap: 12px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .preview-list li {
        border: 1px solid rgba(51, 65, 85, 0.78);
        border-radius: 18px;
        padding: 16px;
        background: rgba(2, 6, 23, 0.45);
      }
      .preview-list strong {
        display: block;
        margin-bottom: 4px;
        color: #e2e8f0;
      }
      .preview-list span {
        color: #64748b;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <nav class="nav">
        <div class="logo"><span class="logo-mark">&lt;/&gt;</span>${safeProjectName}</div>
        <div class="status">Run #${refreshKey}</div>
      </nav>
      <section class="hero">
        <article class="card">
          <p class="eyebrow">${modeLabel}</p>
          <h1>실행 화면 미리보기</h1>
          <p>
            백엔드 Preview 서버가 연결되면 이 영역에 실제 프로젝트 실행 화면이 표시됩니다.
            현재는 프론트 구조 확인을 위한 Preview Shell입니다.
          </p>
          <div class="meta">
            <div class="meta-row"><span>Project</span><strong>${safeProjectName}</strong></div>
            <div class="meta-row"><span>Current file</span><strong>${safeFileName}</strong></div>
            <div class="meta-row"><span>Viewport</span><strong>${viewMode === 'mobile' ? '390px Mobile' : 'Responsive PC'}</strong></div>
          </div>
        </article>
        <article class="card">
          <p class="eyebrow">Review flow</p>
          <ul class="preview-list">
            <li><strong>1. Codex 작업</strong><span>요청사항을 코드에 반영합니다.</span></li>
            <li><strong>2. Run 확인</strong><span>PC/Mobile 화면에서 결과를 봅니다.</span></li>
            <li><strong>3. 코멘트</strong><span>광고주 또는 팀원이 피드백을 남깁니다.</span></li>
          </ul>
        </article>
      </section>
    </main>
  </body>
</html>`
}

function revokePreviewUrls(previewContent) {
  previewContent?.images?.forEach((image) => {
    if (image.url && image.revoke !== false) URL.revokeObjectURL(image.url)
  })
  previewContent?.assetUrls?.forEach((url) => URL.revokeObjectURL(url))
}

function EmptyPreview({ previewContent }) {
  return (
    <div className="grid h-full min-h-[180px] place-items-center bg-[#07111f] px-6 text-center">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
          Preview guide
        </p>
        <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-50">
          {previewContent?.title || 'Preview Shell'}
        </h3>
        <p className="mt-3 max-w-md text-xs leading-6 text-slate-400">
          {previewContent?.message ||
            '이미지 파일을 선택하거나 이미지가 들어 있는 폴더를 선택한 뒤 Run을 눌러보세요.'}
        </p>
      </div>
    </div>
  )
}

function ImagePreview({ previewContent, onReorderGallery }) {
  const images = previewContent?.images || []
  const canReorder =
    previewContent?.type === 'gallery' &&
    typeof onReorderGallery === 'function' &&
    images.length > 1

  if (images.length === 0) return <EmptyPreview previewContent={previewContent} />

  return (
    <div className="h-full min-h-[180px] overflow-y-auto bg-[#f8fafc]">
      <div className="border-b border-slate-200 bg-white px-4 py-3 text-slate-900">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          {previewContent.type === 'gallery' ? 'Media sequence' : 'Media file'}
        </p>
        <h3 className="mt-1 truncate text-sm font-bold">
          {previewContent.title}
        </h3>
        {previewContent.message && (
          <p className="mt-1 text-xs text-slate-500">{previewContent.message}</p>
        )}
      </div>

      <div className="mx-auto max-w-[1080px] bg-white">
        {images.map((image, index) => (
          <figure key={`${image.path}-${index}`} className="m-0">
            {image.kind === 'video' ? (
              <video
                src={image.url}
                className="block h-auto w-full bg-black"
                controls
                muted
                playsInline
              />
            ) : (
              <img
                src={image.url}
                alt={image.name}
                className="block h-auto w-full"
                loading={index > 2 ? 'lazy' : 'eager'}
              />
            )}
            {previewContent.type === 'gallery' && (
              <figcaption className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-500">
                <span className="min-w-0 truncate">
                  {String(index + 1).padStart(2, '0')} · {image.name}
                </span>
                {canReorder && (
                  <span className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => onReorderGallery(index, index - 1)}
                      disabled={index === 0}
                      className="rounded border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-500 transition hover:border-cyan-300 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ↑ 위로
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorderGallery(index, index + 1)}
                      disabled={index === images.length - 1}
                      className="rounded border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-500 transition hover:border-cyan-300 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ↓ 아래
                    </button>
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}

function HtmlPreview({ previewContent, viewMode, refreshKey }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col bg-white">
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2 text-slate-900">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Static HTML Preview
        </p>
        <div className="mt-1 flex min-w-0 items-center justify-between gap-3">
          <h3 className="truncate text-sm font-bold">{previewContent.title}</h3>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            local assets linked
          </span>
        </div>
      </div>

      <iframe
        key={`html-${viewMode}-${refreshKey}-${previewContent.title}`}
        title="정적 HTML 미리보기"
        srcDoc={previewContent.html}
        sandbox="allow-scripts allow-forms allow-popups"
        className="min-h-0 flex-1 border-0 bg-white"
      />
    </div>
  )
}

function ProjectPreview({
  projectName,
  selectedFileName,
  refreshKey,
  isRunning,
  previewContent,
  onReorderGallery,
}) {
  const [viewMode, setViewMode] = useState('desktop')
  const previewDocument = useMemo(
    () =>
      createPreviewDocument({
        projectName,
        selectedFileName,
        viewMode,
        refreshKey,
      }),
    [projectName, refreshKey, selectedFileName, viewMode],
  )
  const shouldUseIframe =
    !previewContent || previewContent.type === 'shell'

  useEffect(() => () => revokePreviewUrls(previewContent), [previewContent])

  return (
    <section className="flex h-full min-h-[220px] flex-col bg-[#0d1119]">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-800 bg-[#111722] px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Live Preview
          </span>
          <span className="truncate text-[10px] text-slate-600">
            {isRunning ? 'Running...' : projectName}
          </span>
        </div>

        <div className="flex rounded-lg bg-slate-950/60 p-1">
          {[
            ['desktop', 'PC'],
            ['mobile', 'Mobile'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setViewMode(value)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition ${
                viewMode === value
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[#080d15] p-3">
        <div
          className={`mx-auto h-full min-h-[180px] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/30 transition-all ${
            viewMode === 'mobile'
              ? 'max-w-[390px] ring-4 ring-slate-800'
              : 'w-full'
          }`}
        >
          {shouldUseIframe ? (
            <iframe
              key={`${viewMode}-${refreshKey}`}
              title="프로젝트 미리보기"
              srcDoc={previewDocument}
              className="h-full min-h-[180px] w-full border-0 bg-white"
            />
          ) : previewContent.type === 'html' ? (
            <HtmlPreview
              previewContent={previewContent}
              viewMode={viewMode}
              refreshKey={refreshKey}
            />
          ) : previewContent.type === 'image' ||
            previewContent.type === 'gallery' ? (
            <ImagePreview
              previewContent={previewContent}
              onReorderGallery={onReorderGallery}
            />
          ) : (
            <EmptyPreview previewContent={previewContent} />
          )}
        </div>
      </div>
    </section>
  )
}

export default ProjectPreview
