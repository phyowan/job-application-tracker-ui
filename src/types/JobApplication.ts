// Enums matching backend API
export enum ApplicationStatus {
  Applied = 1,
  UnderReview = 2,
  Interview = 3,
  Offer = 4,
  Rejected = 5,
  Withdrawn = 6
}

// Main JobApplication interface matching backend JobApplicationDto
export interface JobApplication {
  id: number;
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

// Create DTO interface matching backend CreateJobApplicationDto
export interface CreateJobApplicationDto {
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string; // ISO date string
}

// Update DTO interface matching backend UpdateJobApplicationDto
export interface UpdateJobApplicationDto {
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string; // ISO date string
}

// Form state interface for client-side form handling
export interface JobApplicationFormData {
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string;
}

// Validation errors interface
export interface FormErrors {
  company?: string;
  position?: string;
  status?: string;
  dateApplied?: string;
  general?: string;
}

// API response interfaces
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Status option for dropdown
export interface StatusOption {
  value: ApplicationStatus;
  label: string;
}

// Utility function to get status label
export const getStatusLabel = (status: ApplicationStatus): string => {
  switch (status) {
    case ApplicationStatus.Applied:
      return 'Applied';
    case ApplicationStatus.UnderReview:
      return 'Under Review';
    case ApplicationStatus.Interview:
      return 'Interview';
    case ApplicationStatus.Offer:
      return 'Offer';
    case ApplicationStatus.Rejected:
      return 'Rejected';
    case ApplicationStatus.Withdrawn:
      return 'Withdrawn';
    default:
      return 'Unknown';
  }
};

// Get all status options for dropdown
export const getStatusOptions = (): StatusOption[] => {
  return [
    { value: ApplicationStatus.Applied, label: 'Applied' },
    { value: ApplicationStatus.UnderReview, label: 'Under Review' },
    { value: ApplicationStatus.Interview, label: 'Interview' },
    { value: ApplicationStatus.Offer, label: 'Offer' },
    { value: ApplicationStatus.Rejected, label: 'Rejected' },
    { value: ApplicationStatus.Withdrawn, label: 'Withdrawn' }
  ];
};

// Utility function to format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Utility function to format date for input field (YYYY-MM-DD)
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};