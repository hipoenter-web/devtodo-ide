const TEXT_EXTENSIONS = new Set([
  'c',
  'cc',
  'cpp',
  'cs',
  'css',
  'csv',
  'env',
  'gitignore',
  'go',
  'graphql',
  'h',
  'hpp',
  'html',
  'java',
  'js',
  'json',
  'jsx',
  'license',
  'log',
  'makefile',
  'md',
  'mjs',
  'php',
  'properties',
  'py',
  'rb',
  'rs',
  'scss',
  'sh',
  'sql',
  'svg',
  'toml',
  'ts',
  'tsx',
  'txt',
  'vue',
  'xml',
  'yaml',
  'yml',
])

export const IMAGE_EXTENSIONS = new Set([
  'avif',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
])

export const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm'])

const STATIC_PREVIEW_FILE_LIMIT = 700
const STATIC_PREVIEW_TEXT_LIMIT = 3 * 1024 * 1024

function getExtension(fileName) {
  return fileName.includes('.')
    ? fileName.split('.').pop().toLowerCase()
    : fileName.toLowerCase()
}

export function isImageFileName(fileName) {
  return IMAGE_EXTENSIONS.has(getExtension(fileName))
}

export function isVideoFileName(fileName) {
  return VIDEO_EXTENSIONS.has(getExtension(fileName))
}

export function isPreviewMediaFileName(fileName) {
  return isImageFileName(fileName) || isVideoFileName(fileName)
}

function createId(sourceId, path) {
  return `${sourceId}:${path}`
}

function sortNodes(nodes) {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name, 'ko', { numeric: true })
  })
}

function entryFile(entry) {
  return new Promise((resolve, reject) => entry.file(resolve, reject))
}

async function getNodeFile(node) {
  if (node.handle) return node.handle.getFile()
  if (node.entry) return entryFile(node.entry)
  return node.file
}

function entryChildren(entry) {
  return new Promise((resolve, reject) => {
    const reader = entry.createReader()
    const entries = []

    const readBatch = () => {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(entries)
          return
        }

        entries.push(...batch)
        readBatch()
      }, reject)
    }

    readBatch()
  })
}

function nodeFromHandle(handle, sourceId, parentPath = '') {
  const path = parentPath ? `${parentPath}/${handle.name}` : handle.name
  const isDirectory = handle.kind === 'directory'

  return {
    id: createId(sourceId, path),
    name: handle.name,
    path,
    type: isDirectory ? 'folder' : 'file',
    children: isDirectory ? [] : undefined,
    loaded: !isDirectory,
    handle,
    sourceId,
  }
}

export function createWorkspaceFromDirectoryHandle(directoryHandle) {
  const sourceId = crypto.randomUUID()
  return [nodeFromHandle(directoryHandle, sourceId)]
}

function nodeFromEntry(entry, sourceId, parentPath = '') {
  const path = parentPath ? `${parentPath}/${entry.name}` : entry.name

  return {
    id: createId(sourceId, path),
    name: entry.name,
    path,
    type: entry.isDirectory ? 'folder' : 'file',
    children: entry.isDirectory ? [] : undefined,
    loaded: !entry.isDirectory,
    entry,
    sourceId,
  }
}

export async function createWorkspaceFromDrop(dataTransfer) {
  const sourceId = crypto.randomUUID()
  const items = [...dataTransfer.items].filter((item) => item.kind === 'file')

  if (items.length === 0) {
    throw new Error('드롭한 폴더를 확인할 수 없습니다.')
  }

  if (typeof items[0]?.getAsFileSystemHandle === 'function') {
    const handles = (
      await Promise.all(items.map((item) => item.getAsFileSystemHandle()))
    ).filter(Boolean)

    const directoryHandles = handles.filter((handle) => handle.kind === 'directory')
    if (directoryHandles.length === 0) {
      throw new Error('파일이 아니라 프로젝트 폴더를 올려주세요.')
    }

    return sortNodes(
      directoryHandles.map((handle) => nodeFromHandle(handle, sourceId)),
    )
  }

  const entries = items
    .map((item) => item.webkitGetAsEntry?.())
    .filter((entry) => entry?.isDirectory)

  if (entries.length === 0) {
    throw new Error('이 브라우저에서는 폴더 드롭을 읽을 수 없습니다.')
  }

  return sortNodes(entries.map((entry) => nodeFromEntry(entry, sourceId)))
}

export function createWorkspaceFromFileList(fileList) {
  const files = [...fileList]
  if (files.length === 0) throw new Error('선택된 폴더가 없습니다.')

  const sourceId = crypto.randomUUID()
  const rootMap = new Map()

  for (const file of files) {
    const relativePath = file.webkitRelativePath || file.name
    const parts = relativePath.split('/').filter(Boolean)
    let currentMap = rootMap
    let parentPath = ''

    parts.forEach((part, index) => {
      const path = parentPath ? `${parentPath}/${part}` : part
      const isFile = index === parts.length - 1

      if (!currentMap.has(part)) {
        currentMap.set(part, {
          id: createId(sourceId, path),
          name: part,
          path,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
          childMap: isFile ? undefined : new Map(),
          loaded: true,
          file: isFile ? file : undefined,
          sourceId,
        })
      }

      const node = currentMap.get(part)
      if (!isFile) {
        currentMap = node.childMap
        parentPath = path
      }
    })
  }

  const finalize = (map) =>
    sortNodes(
      [...map.values()].map(({ childMap, ...node }) => ({
        ...node,
        children: childMap ? finalize(childMap) : undefined,
      })),
    )

  return finalize(rootMap)
}

export async function loadFolderChildren(node) {
  if (node.type !== 'folder' || node.loaded) return node.children || []

  if (node.handle) {
    const children = []
    for await (const handle of node.handle.values()) {
      children.push(nodeFromHandle(handle, node.sourceId, node.path))
    }
    return sortNodes(children)
  }

  if (node.entry) {
    const entries = await entryChildren(node.entry)
    return sortNodes(
      entries.map((entry) => nodeFromEntry(entry, node.sourceId, node.path)),
    )
  }

  return node.children || []
}

export async function readWorkspaceFile(node) {
  const file = await getNodeFile(node)

  if (!file) throw new Error('파일을 읽을 수 없습니다.')

  const extension = getExtension(node.name)
  const isText =
    file.type.startsWith('text/') ||
    file.type.includes('json') ||
    file.type.includes('javascript') ||
    file.type.includes('xml') ||
    TEXT_EXTENSIONS.has(extension)

  if (!isText) {
    return {
      content: '이 파일은 텍스트 형식이 아니므로 코드 편집기에서 표시할 수 없습니다.',
      editable: false,
    }
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      content: '5MB를 초과하는 파일은 브라우저 편집기에서 열지 않습니다.',
      editable: false,
    }
  }

  return {
    content: await file.text(),
    editable: true,
    writable: Boolean(
      node.handle && typeof node.handle.createWritable === 'function',
    ),
  }
}

export async function readWorkspaceImage(node) {
  const media = await readWorkspaceMedia(node)

  if (media.kind !== 'image') {
    throw new Error('지원하는 이미지 파일이 아닙니다.')
  }

  return media
}

export async function readWorkspaceMedia(node) {
  const file = await getNodeFile(node)

  if (!file) throw new Error('미리보기 파일을 읽을 수 없습니다.')

  const isImage = isImageFileName(node.name) || file.type.startsWith('image/')
  const isVideo = isVideoFileName(node.name) || file.type.startsWith('video/')

  if (!isImage && !isVideo) {
    throw new Error('지원하는 미리보기 파일이 아닙니다.')
  }

  const extension = getExtension(node.name)

  return {
    id: node.id,
    name: node.name,
    path: node.path,
    size: file.size,
    type: file.type || `${isVideo ? 'video' : 'image'}/${extension}`,
    kind: isVideo ? 'video' : 'image',
    url: URL.createObjectURL(file),
    revoke: true,
  }
}

export async function collectFolderImages(node, limit = 60) {
  return collectFolderMedia(node, limit).then((media) =>
    media.filter((item) => item.kind === 'image'),
  )
}

export async function collectFolderMedia(node, limit = 80) {
  if (node.type !== 'folder') return []

  const children = node.loaded ? node.children || [] : await loadFolderChildren(node)
  const mediaNodes = sortNodes(children).filter(
    (child) => child.type === 'file' && isPreviewMediaFileName(child.name),
  )

  const limitedNodes = mediaNodes.slice(0, limit)
  const media = await Promise.all(
    limitedNodes.map((child) => readWorkspaceMedia(child)),
  )

  return media
}

function getParentPath(path) {
  return path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''
}

function normalizePath(path) {
  const parts = []

  path.split('/').forEach((part) => {
    if (!part || part === '.') return
    if (part === '..') {
      parts.pop()
      return
    }
    parts.push(part)
  })

  return parts.join('/')
}

function splitUrlReference(reference) {
  const hashIndex = reference.indexOf('#')
  const queryIndex = reference.indexOf('?')
  const indexes = [hashIndex, queryIndex].filter((index) => index >= 0)
  const splitIndex = indexes.length > 0 ? Math.min(...indexes) : -1

  if (splitIndex < 0) return { path: reference, suffix: '' }

  return {
    path: reference.slice(0, splitIndex),
    suffix: reference.slice(splitIndex),
  }
}

function safeDecodeUri(value) {
  try {
    return decodeURI(value)
  } catch {
    return value
  }
}

function isExternalReference(reference) {
  const value = reference.trim()

  return (
    !value ||
    value.startsWith('#') ||
    value.startsWith('//') ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  )
}

function resolveAssetPath(reference, basePath, rootPath) {
  if (isExternalReference(reference)) return null

  const { path } = splitUrlReference(reference.trim())
  if (!path) return null

  const decodedPath = safeDecodeUri(path)
  const candidatePath = decodedPath.startsWith('/')
    ? `${rootPath}/${decodedPath.slice(1)}`
    : `${basePath}/${decodedPath}`

  return normalizePath(candidatePath)
}

function replaceReference(reference, basePath, rootPath, assetUrlMap) {
  const resolvedPath = resolveAssetPath(reference, basePath, rootPath)
  if (!resolvedPath) return reference

  return assetUrlMap.get(resolvedPath) || reference
}

function rewriteCssUrls(cssText, basePath, rootPath, assetUrlMap) {
  return cssText.replace(/url\(([^)]+)\)/gi, (match, rawReference) => {
    const reference = rawReference.trim().replace(/^['"]|['"]$/g, '')
    const replaced = replaceReference(reference, basePath, rootPath, assetUrlMap)

    return replaced === reference ? match : `url("${replaced}")`
  })
}

function rewriteSrcSet(value, basePath, rootPath, assetUrlMap) {
  return value
    .split(',')
    .map((part) => {
      const trimmedPart = part.trim()
      if (!trimmedPart) return part

      const [reference, ...descriptors] = trimmedPart.split(/\s+/)
      const replaced = replaceReference(reference, basePath, rootPath, assetUrlMap)

      return [replaced, ...descriptors].join(' ')
    })
    .join(', ')
}

function rewriteHtmlReferences(htmlText, indexPath, rootPath, assetUrlMap) {
  const basePath = getParentPath(indexPath)

  return htmlText
    .replace(
      /\b(src|href|poster)=("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
      (match, attributeName, fullValue, doubleQuoted, singleQuoted, unquoted) => {
        const value = doubleQuoted ?? singleQuoted ?? unquoted ?? ''
        const replaced = replaceReference(value, basePath, rootPath, assetUrlMap)

        if (replaced === value) return match

        if (fullValue.startsWith("'")) return `${attributeName}='${replaced}'`
        if (fullValue.startsWith('"')) return `${attributeName}="${replaced}"`
        return `${attributeName}=${replaced}`
      },
    )
    .replace(
      /\bsrcset=("([^"]*)"|'([^']*)')/gi,
      (match, fullValue, doubleQuoted, singleQuoted) => {
        const value = doubleQuoted ?? singleQuoted ?? ''
        const replaced = rewriteSrcSet(value, basePath, rootPath, assetUrlMap)

        if (replaced === value) return match

        return fullValue.startsWith("'")
          ? `srcset='${replaced}'`
          : `srcset="${replaced}"`
      },
    )
}

async function readNodeText(node) {
  const file = await getNodeFile(node)

  if (!file) throw new Error(`${node.path} 파일을 읽을 수 없습니다.`)

  if (file.size > STATIC_PREVIEW_TEXT_LIMIT) {
    throw new Error(`${node.path} 파일이 너무 커서 Preview에 연결하지 않았습니다.`)
  }

  return file.text()
}

async function collectFolderFiles(node, limit = STATIC_PREVIEW_FILE_LIMIT) {
  const files = []

  async function walk(currentNode) {
    if (files.length >= limit) return

    if (currentNode.type === 'file') {
      files.push(currentNode)
      return
    }

    const children = currentNode.loaded
      ? currentNode.children || []
      : await loadFolderChildren(currentNode)

    for (const child of sortNodes(children)) {
      if (files.length >= limit) break
      await walk(child)
    }
  }

  await walk(node)

  return files
}

function pickIndexHtml(files, rootPath) {
  const htmlFiles = files.filter(
    (file) => file.name.toLowerCase() === 'index.html',
  )

  return (
    htmlFiles.find((file) => file.path === `${rootPath}/index.html`) ||
    htmlFiles.sort((a, b) => a.path.length - b.path.length)[0] ||
    null
  )
}

async function createAssetObjectUrl(node, assetUrlMap, assetUrls) {
  const file = await getNodeFile(node)

  if (!file) return

  const url = URL.createObjectURL(file)
  assetUrlMap.set(node.path, url)
  assetUrls.push(url)
}

export async function createStaticHtmlPreview(node) {
  if (node.type !== 'folder') {
    throw new Error('정적 HTML Preview는 폴더에서만 만들 수 있습니다.')
  }

  const files = await collectFolderFiles(node)
  const indexNode = pickIndexHtml(files, node.path)

  if (!indexNode) {
    throw new Error('index.html 파일을 찾지 못했습니다.')
  }

  const assetUrlMap = new Map()
  const assetUrls = []
  const cssNodes = []

  await Promise.all(
    files.map(async (fileNode) => {
      if (fileNode.id === indexNode.id) return

      const extension = getExtension(fileNode.name)
      if (extension === 'css') {
        cssNodes.push(fileNode)
        return
      }

      await createAssetObjectUrl(fileNode, assetUrlMap, assetUrls)
    }),
  )

  await Promise.all(
    cssNodes.map(async (cssNode) => {
      try {
        const cssText = await readNodeText(cssNode)
        const rewrittenCss = rewriteCssUrls(
          cssText,
          getParentPath(cssNode.path),
          node.path,
          assetUrlMap,
        )
        const cssUrl = URL.createObjectURL(
          new Blob([rewrittenCss], { type: 'text/css' }),
        )

        assetUrlMap.set(cssNode.path, cssUrl)
        assetUrls.push(cssUrl)
      } catch {
        await createAssetObjectUrl(cssNode, assetUrlMap, assetUrls)
      }
    }),
  )

  const indexHtml = await readNodeText(indexNode)
  const html = rewriteHtmlReferences(
    indexHtml,
    indexNode.path,
    node.path,
    assetUrlMap,
  )

  return {
    type: 'html',
    title: indexNode.name,
    message: `${indexNode.path} 기준으로 HTML/CSS/이미지 경로를 연결했습니다.`,
    html,
    assetUrls,
  }
}

async function hasWritePermission(fileHandle) {
  const permission = { mode: 'readwrite' }

  if (typeof fileHandle.queryPermission === 'function') {
    const currentPermission = await fileHandle.queryPermission(permission)
    if (currentPermission === 'granted') return true
  }

  if (typeof fileHandle.requestPermission === 'function') {
    const nextPermission = await fileHandle.requestPermission(permission)
    return nextPermission === 'granted'
  }

  return true
}

export async function writeWorkspaceFile(node, content) {
  if (!node.handle || typeof node.handle.createWritable !== 'function') {
    throw new Error('이 방식으로 연 파일은 원본 저장 권한이 없습니다.')
  }

  const permitted = await hasWritePermission(node.handle)
  if (!permitted) {
    throw new Error('브라우저에서 파일 쓰기 권한이 허용되지 않았습니다.')
  }

  const writable = await node.handle.createWritable()
  await writable.write(content)
  await writable.close()
}

export function updateTreeNode(nodes, nodeId, updater) {
  return nodes.map((node) => {
    if (node.id === nodeId) return updater(node)
    if (!node.children) return node

    return {
      ...node,
      children: updateTreeNode(node.children, nodeId, updater),
    }
  })
}

export function countLoadedFiles(nodes) {
  return nodes.reduce(
    (count, node) =>
      count +
      (node.type === 'file' ? 1 : countLoadedFiles(node.children || [])),
    0,
  )
}
