/**
 * NSQF Service
 * Handles API calls related to NSQF levels and courses
 */

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

// Create axios instance for NSQF API
const nsqfApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
nsqfApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response models
export interface NSQFCourse {
  course_name: string;
  nsqf_level: number;
}

export interface NSQFResponse {
  course_name: string;
  nsqf_level: number;
  found: boolean;
}

export interface NSQFStats {
  total_courses: number;
  courses_by_level: Record<string, number>;
  collection_name: string;
}

export class NSQFService {
  /**
   * Get NSQF level for a specific course by name
   * @param courseName - Name of the course
   * @returns Promise with course NSQF information
   */
  static async getNSQFByCourse(courseName: string): Promise<NSQFResponse> {
    try {
      const response = await nsqfApi.get('/nsqf/course', {
        params: { course_name: courseName }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching NSQF level:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Failed to fetch NSQF level'
      );
    }
  }

  /**
   * Search for courses by partial name match
   * @param query - Search query string
   * @param limit - Maximum number of results (default: 10)
   * @returns Promise with array of matching courses
   */
  static async searchCourses(query: string, limit: number = 10): Promise<NSQFCourse[]> {
    try {
      const response = await nsqfApi.get('/nsqf/search', {
        params: { query, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching courses:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Failed to search courses'
      );
    }
  }

  /**
   * Get all courses for a specific NSQF level
   * @param nsqfLevel - NSQF level (1-10)
   * @param limit - Maximum number of results (default: 20)
   * @returns Promise with array of courses at the specified level
   */
  static async getCoursesByLevel(nsqfLevel: number, limit: number = 20): Promise<NSQFCourse[]> {
    try {
      const response = await nsqfApi.get(`/nsqf/level/${nsqfLevel}`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching courses by level:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Failed to fetch courses by level'
      );
    }
  }

  /**
   * Get statistics about the NSQF courses database
   * @returns Promise with database statistics
   */
  static async getNSQFStats(): Promise<NSQFStats> {
    try {
      const response = await nsqfApi.get('/nsqf/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching NSQF stats:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Failed to fetch NSQF statistics'
      );
    }
  }
}
