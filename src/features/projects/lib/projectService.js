import { findClient } from '../data/clients'
import { canAccessProject } from '../data/permissions'
import { projectCatalog } from '../data/projects'
import { getSampleProjectMedia } from '../data/sampleAssets'
import { resolveDemoUser } from '../data/users'

function withClient(project) {
  const client = findClient(project.clientId)

  return {
    ...project,
    client,
    clientName: client?.name || '미지정 광고주',
  }
}

export function getVisibleProjects(currentUser) {
  const roleId = currentUser?.role?.id

  if (roleId === 'master') {
    return projectCatalog.map(withClient)
  }

  const demoUser = resolveDemoUser(currentUser)

  if (demoUser) {
    return projectCatalog
      .filter((project) => canAccessProject(project.id, demoUser.id))
      .map(withClient)
  }

  if (roleId === 'team') {
    return projectCatalog
      .filter((project) => canAccessProject(project.id, 'team-design'))
      .map(withClient)
  }

  if (roleId === 'client') {
    return projectCatalog.slice(0, 1).map(withClient)
  }

  return []
}

export function createCatalogProjectPreview(project) {
  const media = getSampleProjectMedia(project)

  if (media.length === 0) {
    return {
      type: 'message',
      title: project.name,
      message:
        '이 샘플 프로젝트에 연결된 이미지/GIF/영상 파일을 찾지 못했습니다.',
    }
  }

  return {
    type: 'gallery',
    title: project.name,
    message: `${project.clientName} · ${media.length}개 파일을 파일명 순서대로 연결했습니다. 필요하면 위/아래 버튼으로 순서를 조정하세요.`,
    images: media,
    galleryOrderScope: `sample:${project.id}`,
  }
}
