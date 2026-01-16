const API_BASE = {
  auth: 'https://functions.poehali.dev/0cd64a83-9e83-46f9-af74-51188cdb58ae',
  groups: 'https://functions.poehali.dev/c773dc60-74a2-4b60-99cf-9c08d77f6e23',
  students: 'https://functions.poehali.dev/70baa7bf-5aa8-4fa2-92d9-950ca31579de',
  attendance: 'https://functions.poehali.dev/5a193d5d-2c57-4a45-bb02-73dbbb01b20d',
  transactions: 'https://functions.poehali.dev/1ebcd5ce-86f7-4573-ac0c-91a97656f57c',
};

export interface User {
  id: number;
  login: string;
  role: 'admin' | 'trainer' | 'student';
  full_name: string;
  email?: string;
  student_id?: number;
  group_id?: number;
  balance?: number;
}

export interface Group {
  id: number;
  name: string;
  trainer_id?: number;
  trainer_name?: string;
  schedule?: string;
  cost_per_session: number;
  student_count?: number;
}

export interface Student {
  id: number;
  user_id: number;
  group_id?: number;
  full_name: string;
  login: string;
  balance: number;
  group_name?: string;
  attendance_percentage?: number;
  total_visits?: number;
  total_sessions?: number;
}

export interface Transaction {
  id: number;
  student_id: number;
  amount: number;
  transaction_type: 'payment' | 'charge' | 'adjustment';
  description?: string;
  created_at: string;
  created_by?: number;
  created_by_name?: string;
  student_name?: string;
}

export const api = {
  auth: {
    login: async (login: string, password: string): Promise<{ user: User }> => {
      const response = await fetch(API_BASE.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка авторизации');
      return data;
    },
  },

  groups: {
    getAll: async (): Promise<Group[]> => {
      const response = await fetch(API_BASE.groups);
      const data = await response.json();
      return data.groups || [];
    },

    create: async (group: Partial<Group>): Promise<Group> => {
      const response = await fetch(API_BASE.groups, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка создания группы');
      return data.group;
    },
  },

  students: {
    getAll: async (): Promise<Student[]> => {
      const response = await fetch(API_BASE.students);
      const data = await response.json();
      return data.students || [];
    },

    create: async (student: {
      full_name: string;
      birth_date?: string;
      parent_contact?: string;
      group_id?: number;
    }): Promise<{ student_id: number; login: string; temp_password: string }> => {
      const response = await fetch(API_BASE.students, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка создания ученика');
      return data;
    },
  },

  attendance: {
    getByStudent: async (studentId: number) => {
      const response = await fetch(`${API_BASE.attendance}?student_id=${studentId}`);
      const data = await response.json();
      return data.attendance || [];
    },

    getByGroup: async (groupId: number) => {
      const response = await fetch(`${API_BASE.attendance}?group_id=${groupId}`);
      const data = await response.json();
      return data.attendance || [];
    },

    mark: async (params: {
      group_id: number;
      session_date: string;
      present_students: number[];
      trainer_comment?: string;
      trainer_id?: number;
    }) => {
      const response = await fetch(API_BASE.attendance, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка отметки посещаемости');
      return data;
    },
  },

  transactions: {
    getAll: async (): Promise<Transaction[]> => {
      const response = await fetch(API_BASE.transactions);
      const data = await response.json();
      return data.transactions || [];
    },

    getByStudent: async (studentId: number): Promise<Transaction[]> => {
      const response = await fetch(`${API_BASE.transactions}?student_id=${studentId}`);
      const data = await response.json();
      return data.transactions || [];
    },

    addPayment: async (params: {
      student_id: number;
      amount: number;
      description?: string;
      created_by?: number;
    }) => {
      const response = await fetch(API_BASE.transactions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка пополнения баланса');
      return data;
    },
  },
};
