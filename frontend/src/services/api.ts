import { ClassItem, CreateClassPayload, HoldCreatedResponse, HoldDetail, StudentHoldItem } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return {} as T;
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Response had no JSON body
  }

  if (!res.ok) {
    let errorMsg = data?.error || data?.message || 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    if (res.status === 409) {
      if (!data?.error) errorMsg = 'সিট খালি নেই অথবা এই ক্লাসে আপনার ইতিমধ্যে একটি আবেদন রয়েছে।';
    } else if (res.status === 404) {
      if (!data?.error) errorMsg = 'অনুরোধকৃত তথ্যটি পাওয়া যায়নি।';
    } else if (res.status === 403) {
      if (!data?.error) errorMsg = 'আপনি এই আবেদনটি পরিবর্তন করার অনুমতিপ্রাপ্ত নন।';
    } else if (res.status === 400) {
      if (!data?.error) errorMsg = 'ভুল তথ্য প্রদান করা হয়েছে। ১৭ ডিজিটের জন্ম নিবন্ধন নম্বর সঠিকভাবে দিন।';
    }
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    throw err;
  }

  return data as T;
}

export const api = {
  async getClasses(): Promise<ClassItem[]> {
    const res = await fetch(`${API_BASE_URL}/classes`);
    return handleResponse<ClassItem[]>(res);
  },

  async getClass(classId: string): Promise<ClassItem> {
    const res = await fetch(`${API_BASE_URL}/classes/${classId}`);
    return handleResponse<ClassItem>(res);
  },

  async createClass(payload: CreateClassPayload): Promise<ClassItem> {
    const res = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return handleResponse<ClassItem>(res);
  },

  async createHold(classId: string, studentId: string): Promise<HoldCreatedResponse> {
    const res = await fetch(`${API_BASE_URL}/classes/${classId}/holds`, {
      method: 'POST',
      headers: {
        'X-Student-Id': studentId
      }
    });
    return handleResponse<HoldCreatedResponse>(res);
  },

  async getHold(holdId: string): Promise<HoldDetail> {
    const res = await fetch(`${API_BASE_URL}/holds/${holdId}`);
    return handleResponse<HoldDetail>(res);
  },

  async confirmHold(holdId: string, studentId: string): Promise<{ holdId: string; status: string }> {
    const res = await fetch(`${API_BASE_URL}/holds/${holdId}/confirm`, {
      method: 'POST',
      headers: {
        'X-Student-Id': studentId
      }
    });
    return handleResponse<{ holdId: string; status: string }>(res);
  },

  async cancelHold(holdId: string, studentId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/holds/${holdId}`, {
      method: 'DELETE',
      headers: {
        'X-Student-Id': studentId
      }
    });
    return handleResponse<void>(res);
  },

  async getMyHolds(studentId: string): Promise<StudentHoldItem[]> {
    const res = await fetch(`${API_BASE_URL}/me/holds`, {
      headers: {
        'X-Student-Id': studentId
      }
    });
    return handleResponse<StudentHoldItem[]>(res);
  }
};

