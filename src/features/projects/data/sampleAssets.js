const sampleMediaModules = import.meta.glob(
  '../../../../sample-projects/**/*.{avif,gif,ico,jpeg,jpg,png,svg,webp,mp4,mov,webm}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
)

const videoExtensions = new Set(['mp4', 'mov', 'webm'])

function normalize(value) {
  return String(value || '').normalize('NFC')
}

function getExtension(fileName) {
  return fileName.includes('.')
    ? fileName.split('.').pop().toLowerCase()
    : fileName.toLowerCase()
}

function getFileName(path) {
  return path.split('/').pop() || path
}

function getSamplePath(modulePath) {
  const marker = 'sample-projects/'
  const markerIndex = modulePath.indexOf(marker)

  return markerIndex >= 0
    ? modulePath.slice(markerIndex + marker.length)
    : modulePath
}

function naturalCompare(a, b) {
  return a.name.localeCompare(b.name, 'ko', {
    numeric: true,
    sensitivity: 'base',
  })
}

const sampleMedia = Object.entries(sampleMediaModules)
  .map(([modulePath, url]) => {
    const samplePath = getSamplePath(modulePath)
    const [folderName, ...pathParts] = samplePath.split('/')
    const name = getFileName(samplePath)
    const extension = getExtension(name)
    const kind = videoExtensions.has(extension) ? 'video' : 'image'

    return {
      id: `sample:${samplePath}`,
      name,
      path: `sample-projects/${samplePath}`,
      folderName,
      relativePath: pathParts.join('/'),
      type: kind === 'video' ? `video/${extension}` : `image/${extension}`,
      kind,
      url,
      revoke: false,
    }
  })
  .sort(naturalCompare)

export function getSampleProjectMedia(project) {
  const folderName = normalize(project?.folderName)

  return sampleMedia
    .filter((media) => normalize(media.folderName) === folderName)
    .map(({ folderName: _folderName, relativePath: _relativePath, ...media }) => ({
      ...media,
      projectId: project.id,
    }))
}
