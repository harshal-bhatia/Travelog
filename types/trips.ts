export interface Trip {
  id: string;
  name: string;
  destination: string;
  budget: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface CreateTripFormValues {
  name: string;
  destination: string;
  budget: number;
  startDate: string;
  endDate?: string;
}
