export interface ClassItem {
  id: string;
  name: string;
  totalSeats: number;
  heldSeats: number;
  confirmedSeats: number;
  availableSeats: number;
}

export interface CreateClassPayload {
  name: string;
  totalSeats: number;
}

export interface HoldCreatedResponse {
  holdId: string;
  classId: string;
  studentId: string;
  status: 'HELD' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
}

export interface HoldDetail {
  holdId: string;
  classId: string;
  status: 'HELD' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
}

export interface StudentHoldItem {
  holdId: string;
  classId: string;
  className: string;
  status: 'HELD' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
}

export interface ActiveHoldState {
  holdId: string;
  classId: string;
  className: string;
  expiresAt: string;
  status: 'HELD' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
}

