import axios, { AxiosResponse } from 'axios';
import {
  JobApplication,
  CreateJobApplicationDto,
  UpdateJobApplicationDto
} from '../types/JobApplication';

// API base configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ;

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for logging or auth tokens
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(`HTTP ${status}: ${data?.message || 'Server error'}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: No response from server');
    } else {
      // Something else happened
      throw new Error(`Request error: ${error.message}`);
    }
  }
);

// Job Application API service
export class JobApplicationService {
  private static readonly ENDPOINT = '/jobapplications';

  /**
   * Get all job applications
   */
  static async getAll(): Promise<JobApplication[]> {
    try {
      const response: AxiosResponse<JobApplication[]> = await apiClient.get(
        this.ENDPOINT
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw error;
    }
  }

  /**
   * Get a specific job application by ID
   */
  static async getById(id: number): Promise<JobApplication> {
    try {
      const response: AxiosResponse<JobApplication> = await apiClient.get(
        `${this.ENDPOINT}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching job application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new job application
   */
  static async create(jobApplication: CreateJobApplicationDto): Promise<JobApplication> {
    try {
      const response: AxiosResponse<JobApplication> = await apiClient.post(
        this.ENDPOINT,
        jobApplication
      );
      return response.data;
    } catch (error) {
      console.error('Error creating job application:', error);
      throw error;
    }
  }

  /**
   * Update an existing job application
   */
  static async update(
    id: number,
    jobApplication: UpdateJobApplicationDto
  ): Promise<JobApplication> {
    try {
      const response: AxiosResponse<JobApplication> = await apiClient.put(
        `${this.ENDPOINT}/${id}`,
        jobApplication
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating job application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a job application
   */
  static async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error deleting job application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update only the status of a job application
   */
  static async updateStatus(
    id: number,
    status: number
  ): Promise<JobApplication> {
    try {
      // First get the current application
      const currentApp = await this.getById(id);
      
      // Update with new status
      const updateDto: UpdateJobApplicationDto = {
        company: currentApp.company,
        position: currentApp.position,
        status: status,
        dateApplied: currentApp.dateApplied
      };
      
      return await this.update(id, updateDto);
    } catch (error) {
      console.error(`Error updating status for job application ${id}:`, error);
      throw error;
    }
  }
}

// Utility functions for API error handling
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (status === 400) {
      return data?.message || 'Invalid request data';
    } else if (status === 404) {
      return 'Job application not found';
    } else if (status === 500) {
      return 'Server error occurred';
    } else {
      return data?.message || `HTTP ${status} error`;
    }
  } else if (error.request) {
    return 'Network error: Unable to connect to server';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};



export default JobApplicationService;