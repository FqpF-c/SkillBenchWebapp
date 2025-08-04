// src/hooks/useSubjects.js
import { useState, useEffect, useCallback } from 'react';
import { firebaseSubjectService } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

export const useSubjects = (options = {}) => {
  const {
    fetchOnMount = true,
    includeProgramming = true,
    includeAcademic = true,
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
  } = options;

  const { user } = useAuth();
  
  const [state, setState] = useState({
    // Programming subjects
    programmingCategories: [],
    programmingSubjects: [],
    
    // Academic subjects
    academicDepartments: [],
    academicSemesters: [],
    academicSubjects: [],
    
    // All subjects combined
    allSubjects: [],
    
    // Loading states
    isLoading: false,
    isProgrammingLoading: false,
    isAcademicLoading: false,
    
    // Error states
    error: null,
    programmingError: null,
    academicError: null,
    
    // Metadata
    totalSubjects: 0,
    programmingCount: 0,
    academicCount: 0,
    lastUpdated: null
  });

  // Fetch programming subjects
  const fetchProgrammingSubjects = useCallback(async () => {
    if (!includeProgramming) return;

    setState(prev => ({ 
      ...prev, 
      isProgrammingLoading: true, 
      programmingError: null 
    }));

    try {
      const data = await firebaseSubjectService.fetchProgrammingSubjects();
      
      setState(prev => ({
        ...prev,
        programmingCategories: data.categories,
        programmingSubjects: data.categories.flatMap(cat => 
          cat.subjects.map(subject => ({
            ...subject,
            categoryName: cat.displayName,
            categoryId: cat.id
          }))
        ),
        programmingCount: data.totalSubjects,
        isProgrammingLoading: false,
        lastUpdated: new Date().toISOString()
      }));

      console.log('Programming subjects loaded successfully');
    } catch (error) {
      console.error('Failed to fetch programming subjects:', error);
      setState(prev => ({
        ...prev,
        isProgrammingLoading: false,
        programmingError: error.message
      }));
    }
  }, [includeProgramming]);

  // Fetch academic subjects
  const fetchAcademicSubjects = useCallback(async (college, department = null, semester = null) => {
    if (!includeAcademic || !college) return;

    setState(prev => ({ 
      ...prev, 
      isAcademicLoading: true, 
      academicError: null 
    }));

    try {
      const data = await firebaseSubjectService.fetchAcademicSubjects(college, department, semester);
      
      setState(prev => ({
        ...prev,
        academicDepartments: data.departments || prev.academicDepartments,
        academicSemesters: data.semesters || prev.academicSemesters,
        academicSubjects: data.subjects || prev.academicSubjects,
        academicCount: data.totalSubjects || prev.academicCount,
        isAcademicLoading: false,
        lastUpdated: new Date().toISOString()
      }));

      console.log('Academic subjects loaded successfully');
    } catch (error) {
      console.error('Failed to fetch academic subjects:', error);
      setState(prev => ({
        ...prev,
        isAcademicLoading: false,
        academicError: error.message
      }));
    }
  }, [includeAcademic]);

  // Fetch all subjects
  const fetchAllSubjects = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const promises = [];

      // Fetch programming subjects
      if (includeProgramming) {
        promises.push(fetchProgrammingSubjects());
      }

      // Fetch academic subjects if user has college info
      if (includeAcademic && user?.college) {
        promises.push(fetchAcademicSubjects(user.college, user.department, user.batch));
      }

      await Promise.all(promises);

      // Update combined subjects list
      setState(prev => {
        const combined = [
          ...prev.programmingSubjects,
          ...prev.academicSubjects
        ];

        return {
          ...prev,
          allSubjects: combined,
          totalSubjects: combined.length,
          isLoading: false,
          lastUpdated: new Date().toISOString()
        };
      });

    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, [includeProgramming, includeAcademic, user, fetchProgrammingSubjects, fetchAcademicSubjects]);

  // Refresh subjects
  const refreshSubjects = useCallback(() => {
    firebaseSubjectService.clearCache();
    return fetchAllSubjects();
  }, [fetchAllSubjects]);

  // Get subjects by category
  const getSubjectsByCategory = useCallback((categoryId) => {
    return state.programmingSubjects.filter(subject => 
      subject.categoryId === categoryId
    );
  }, [state.programmingSubjects]);

  // Get subjects by type
  const getSubjectsByType = useCallback((type) => {
    return state.allSubjects.filter(subject => subject.type === type);
  }, [state.allSubjects]);

  // Search subjects
  const searchSubjects = useCallback((query) => {
    if (!query.trim()) return state.allSubjects;

    const searchTerm = query.toLowerCase().trim();
    return state.allSubjects.filter(subject => 
      subject.name.toLowerCase().includes(searchTerm) ||
      subject.displayName.toLowerCase().includes(searchTerm) ||
      (subject.categoryName && subject.categoryName.toLowerCase().includes(searchTerm))
    );
  }, [state.allSubjects]);

  // Get subject by ID
  const getSubjectById = useCallback((id) => {
    return state.allSubjects.find(subject => subject.id === id);
  }, [state.allSubjects]);

  // Check if subject exists
  const hasSubject = useCallback((id) => {
    return state.allSubjects.some(subject => subject.id === id);
  }, [state.allSubjects]);

  // Get subjects for question generation (formatted for API)
  const getSubjectsForQuestionGeneration = useCallback(() => {
    return {
      programming: state.programmingCategories.map(category => ({
        categoryId: category.id,
        categoryName: category.displayName,
        subjects: category.subjects.map(subject => ({
          id: subject.id,
          name: subject.name,
          displayName: subject.displayName
        }))
      })),
      academic: state.academicSubjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        displayName: subject.displayName,
        college: subject.college,
        department: subject.department,
        semester: subject.semester
      })),
      totalCount: state.totalSubjects
    };
  }, [state.programmingCategories, state.academicSubjects, state.totalSubjects]);

  // Effect for initial load
  useEffect(() => {
    if (fetchOnMount) {
      fetchAllSubjects();
    }
  }, [fetchOnMount, fetchAllSubjects]);

  // Effect for auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing subjects...');
      refreshSubjects();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshSubjects]);

  // Effect to update combined subjects when individual lists change
  useEffect(() => {
    const combined = [
      ...state.programmingSubjects,
      ...state.academicSubjects
    ];

    setState(prev => ({
      ...prev,
      allSubjects: combined,
      totalSubjects: combined.length
    }));
  }, [state.programmingSubjects, state.academicSubjects]);

  return {
    // Data
    programmingCategories: state.programmingCategories,
    programmingSubjects: state.programmingSubjects,
    academicDepartments: state.academicDepartments,
    academicSemesters: state.academicSemesters,
    academicSubjects: state.academicSubjects,
    allSubjects: state.allSubjects,
    
    // Counts
    totalSubjects: state.totalSubjects,
    programmingCount: state.programmingCount,
    academicCount: state.academicCount,
    
    // Loading states
    isLoading: state.isLoading,
    isProgrammingLoading: state.isProgrammingLoading,
    isAcademicLoading: state.isAcademicLoading,
    
    // Error states
    error: state.error,
    programmingError: state.programmingError,
    academicError: state.academicError,
    
    // Metadata
    lastUpdated: state.lastUpdated,
    hasData: state.totalSubjects > 0,
    
    // Actions
    fetchAllSubjects,
    fetchProgrammingSubjects,
    fetchAcademicSubjects,
    refreshSubjects,
    
    // Utilities
    getSubjectsByCategory,
    getSubjectsByType,
    searchSubjects,
    getSubjectById,
    hasSubject,
    getSubjectsForQuestionGeneration
  };
};

export default useSubjects;