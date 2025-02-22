export type Note = {
  id: number;
  content: string;
  groupId: number | null;
  createdAt: Date;
  group?: NoteGroup | null;
};

export type NoteGroup = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: Note[];
};
