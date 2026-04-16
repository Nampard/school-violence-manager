export interface TeacherProfile {
  schoolName: string
  teacherName: string
}

export const emptyTeacherProfile: TeacherProfile = {
  schoolName: '',
  teacherName: '',
}

export function getProfileDisplay(profile: TeacherProfile) {
  return {
    schoolName: profile.schoolName.trim() || '소속학교 미입력',
    teacherName: profile.teacherName.trim() ? `${profile.teacherName.trim()} 교사` : '교사 이름 미입력',
  }
}
