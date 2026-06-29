import { hashPassword } from '../services/security.js'

const DEMO_PASSWORD = 'demo123'

export const clients = [
  {
    key: 'econer',
    name: '에코너',
    manager: '에코너 광고주',
  },
  {
    key: 'damoae',
    name: '다모애',
    manager: '다모애 광고주',
  },
  {
    key: 'seoripul',
    name: '서리풀 막걸리',
    manager: '서리풀 광고주',
  },
  {
    key: 'coolbottle',
    name: '쿨보틀',
    manager: '쿨보틀 광고주',
  },
]

export const projects = [
  {
    key: 'econer-multitab',
    clientKey: 'econer',
    name: '에코너 멀티탭',
    folderName: '에코너 멀티탭',
    type: 'design-gallery',
    status: 'review',
    description: '멀티탭 상세페이지 디자인 이미지 검수용 샘플',
  },
  {
    key: 'damoae-detail-page',
    clientKey: 'damoae',
    name: '다모애 페이지 완성',
    folderName: '다모애 페이지 완성',
    type: 'design-gallery',
    status: 'review',
    description: '상세페이지 이미지 구성 검수용 샘플',
  },
  {
    key: 'seoripul-makgeolli',
    clientKey: 'seoripul',
    name: '서리풀 막걸리',
    folderName: '서리풀 막걸리',
    type: 'design-gallery',
    status: 'review',
    description: '막걸리 상세페이지 이미지 순서 검수용 샘플',
  },
  {
    key: 'coolbottle-first-page',
    clientKey: 'coolbottle',
    name: '쿨보틀 최초 완성 페이지',
    folderName: '쿨보틀 최초 완성 페이지',
    type: 'design-gallery',
    status: 'review',
    description: '쿨보틀 상세페이지 이미지 구성 검수용 샘플',
  },
]

export const users = [
  {
    key: 'master',
    username: 'master',
    name: 'Master',
    role: 'master',
    aliases: ['master', '관리자', 'gangseong', '강성걸'],
    passwordHash: hashPassword(DEMO_PASSWORD),
    projectKeys: projects.map((project) => project.key),
  },
  {
    key: 'team-design',
    username: 'team',
    name: 'Design Team',
    role: 'team',
    aliases: ['team', '팀원', 'designer', '디자이너'],
    passwordHash: hashPassword(DEMO_PASSWORD),
    projectKeys: projects.map((project) => project.key),
  },
  {
    key: 'client-econer',
    username: 'econer',
    name: '에코너 광고주',
    role: 'client',
    aliases: ['econer', '에코너', '에코너 광고주'],
    passwordHash: hashPassword(DEMO_PASSWORD),
    projectKeys: ['econer-multitab'],
  },
  {
    key: 'client-damoae',
    username: 'damoae',
    name: '다모애 광고주',
    role: 'client',
    aliases: ['damoae', '다모애', '다모애 광고주'],
    passwordHash: hashPassword(DEMO_PASSWORD),
    projectKeys: ['damoae-detail-page'],
  },
  {
    key: 'client-seoripul',
    username: 'seoripul',
    name: '서리풀 광고주',
    role: 'client',
    aliases: ['seoripul', '서리풀', '서리풀 막걸리'],
    passwordHash: hashPassword(DEMO_PASSWORD),
    projectKeys: ['seoripul-makgeolli'],
  },
  {
    key: 'client-coolbottle',
    username: 'coolbottle',
    name: '쿨보틀 광고주',
    role: 'client',
    aliases: ['coolbottle', '쿨보틀', '쿨보틀 광고주'],
    passwordHash: hashPassword(DEMO_PASSWORD),
    projectKeys: ['coolbottle-first-page'],
  },
]

export const starterTodos = [
  {
    text: 'Web IDE 기본 레이아웃 확인하기',
    completed: true,
  },
  {
    text: 'Preview 이미지 순서 검수하기',
    completed: false,
  },
  {
    text: '리뷰 코멘트 남기기',
    completed: false,
  },
]

export const starterComments = [
  {
    author: 'Codex',
    role: 'System',
    message: '작업 결과를 보고 의견을 남기는 공간입니다.',
  },
]
