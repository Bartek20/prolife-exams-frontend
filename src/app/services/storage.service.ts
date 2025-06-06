import { Injectable } from '@angular/core';
import { AppStorageState } from '../types';

type MaybeNull = string | null;
type Result = {
  key: string;
  value: {
    exam_name: string;
    exam_time: number;
    exam_token: string;
    student: string;
  } | null
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly DEFAULT_STATE: AppStorageState = {
    current: {
      access_code: null,
      response_uuid: null,
      exam_token: null,
      last_focus: 0
    },
    results: {},
    student: {
      name: null,
      surname: null,
      email: null,
    },
    admin: {
      token: null
    }
  }
  private readonly isStorageAvailable: boolean;
  private currentState!: AppStorageState

  constructor() {
    try {
      const testKey = "appExamsTestKey";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      this.isStorageAvailable = true;
    } catch (e) {
      this.isStorageAvailable = false;
    }

    this.currentState = this.loadData()
    this.saveData()
    window.addEventListener('storage', (event) => {
      if (!event.key || event.key !== 'appExams') return;
      let data
      try {
        data = JSON.parse(event.newValue || '{}');
      } catch (e) {
        console.error(`Error parsing config JSON: ${e}`);
        this.saveData(this.DEFAULT_STATE);
        return
      }
      this.deepMerge(this.DEFAULT_STATE, data);
      this.saveData(data)
      this.currentState = data;
    });
  }

  // Current state
  get accessCode(): MaybeNull {
    return this.currentState.current.access_code;
  }
  set accessCode(value: MaybeNull) {
    this.currentState.current.access_code = value;
    this.saveData()
  }

  get responseUuid(): MaybeNull {
    return this.currentState.current.response_uuid;
  }
  set responseUuid(value: MaybeNull) {
    this.currentState.current.response_uuid = value;
  }

  get examToken(): MaybeNull {
    return this.currentState.current.exam_token;
  }
  set examToken(examToken: MaybeNull) {
    this.currentState.current.exam_token = examToken;
    this.saveData()
  }

  // Student state
  get studentName(): MaybeNull {
    return this.currentState.student.name;
  }
  set studentName(value: MaybeNull) {
    this.currentState.student.name = value;
    this.saveData()
  }

  get studentSurname(): MaybeNull {
    return this.currentState.student.surname;
  }
  set studentSurname(value: MaybeNull) {
    this.currentState.student.surname = value;
    this.saveData()
  }

  get studentEmail(): MaybeNull {
    return this.currentState.student.email;
  }
  set studentEmail(value: MaybeNull) {
    this.currentState.student.email = value;
    this.saveData()
  }

  // Results state
  get results() {
    return this.currentState.results;
  }
  get result(): Function {
    return (uuid: string): Result => {
      return this.currentState.results[uuid];
    }
  }
  set result({ key, value }: Result) {
    if (!value) delete this.currentState.results[key];
    else this.currentState.results[key] = value
    this.saveData()
  }

  // Admin state
  get adminToken(): MaybeNull {
    return this.currentState.admin.token;
  }
  set adminToken(value: MaybeNull) {
    this.currentState.admin.token = value;
    this.saveData()
  }

  private deepMerge(defaults: any, store: any) {
    if (!defaults) return undefined;
    const keys = Object.keys(defaults);
    for (const key of keys) {
      // Store key does not exist
      if (store[key] === undefined) {
        store[key] = defaults[key];
        continue;
      }
      // Key types does not match
      if (typeof store[key] !== typeof defaults[key] && defaults[key] !== undefined && defaults[key] !== null) {
        store[key] = defaults[key];
        continue;
      }
      // Key is object - deep merge
      if (typeof defaults[key] === 'object') {
        this.deepMerge(defaults[key], store[key]);
      }
    }
    return store;
  }
  private loadData() {
    if (!this.isStorageAvailable) return this.DEFAULT_STATE;
    let data: any = localStorage.getItem('appExams');

    if (!data) {
      this.saveData(this.DEFAULT_STATE)
      return this.DEFAULT_STATE
    }

    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error(`Error parsing config JSON: ${e}`);
      this.saveData(this.DEFAULT_STATE)
      return this.DEFAULT_STATE;
    }
    this.deepMerge(this.DEFAULT_STATE, data);

    return data;
  }
  private saveData(data: AppStorageState | undefined = undefined) {
    if (!this.isStorageAvailable) return;
    localStorage.setItem('appExams', JSON.stringify(data ?? this.currentState, (k, v) => v === undefined ? null : v));
  }
}
