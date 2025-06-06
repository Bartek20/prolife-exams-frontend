export interface AppStorageState {
  current: {
    access_code: string | null,
    response_uuid: string | null,
    exam_token: string | null,
    last_focus: number
  },
  results: {[key: string]: any},
  student: {
    name: string | null,
    surname: string | null,
    email: string | null,
  },
  admin: {
    token: string | null
  }
}

export interface ExamConfig {
  id: number
  access_code: string
  start_time: string
  end_time: string | null
  duration: string
  question_number: number
  passing_score: number
  can_go_back: boolean
  is_global_duration: boolean
}
export interface ExamState {
  uuid: string
  start_time: string
  end_time?: string
  questions: Question[]
}
export interface AppState {
  headerType: 'normal' | 'exit' | 'clock'
  clockText?: string
  currentQuestion?: Question
  selectedAnswer: number
  hasAnswerChanged: boolean
}
interface Student {
  name: string
  surname: string
  email: string
}
interface Exam {
  name: string
  access_code: string
  isDEMO: boolean
  uuid: string
  start_time: string
  end_time?: string
}
interface Score {
  exam: number
  max: number
  passing: number
}
export interface Question {
  index: number
  uuid?: string
  question: string
  images: {
    question?: string
    options?: string[]
  }
  options: string[]
  answer: number
  correct?: number
  start_time?: string
}

export interface ExamResult {
  student: Student
  exam: Exam
  score: Score
  questions: Question[]
}


/*/ Admin Types /*/
interface AdminExamConfig extends Exam {
  id: number
  responses: number
  start_time: string
  end_time: string | null
}

export interface authorizeResponse {
  success: boolean
  message: string
  token?: string
}
export interface logoutResponse {
  success: boolean
}
export interface getExamsResponse {
  success: boolean
  exams: AdminExamConfig[]
}
