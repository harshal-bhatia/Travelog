export interface Note {
  id: string;
  tripId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteFormValues {
  title: string;
  content: string;
}
