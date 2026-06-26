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
  let file

  if (node.handle) file = await node.handle.getFile()
  else if (node.entry) file = await entryFile(node.entry)
  else file = node.file

  if (!file) throw new Error('파일을 읽을 수 없습니다.')

  const extension = node.name.includes('.')
    ? node.name.split('.').pop().toLowerCase()
    : node.name.toLowerCase()
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
