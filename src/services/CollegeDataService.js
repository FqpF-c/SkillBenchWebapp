// College Data Service - mirrors Flutter college data loading
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Service for loading college data from Firestore
 * Mirrors the Flutter implementation for college/department/batch loading
 */
class CollegeDataService {
  constructor() {
    this.COLLEGES_PATH = 'skillbench/login_credentials';
    this.collegeCache = null;
  }

  /**
   * Load all colleges from Firestore
   * @returns {Promise<Array>} - Array of college names
   */
  async loadColleges() {
    try {
      console.log('[COLLEGE] Loading colleges from Firestore...');

      // Check cache first
      if (this.collegeCache) {
        return this.collegeCache;
      }

      const docRef = doc(db, this.COLLEGES_PATH);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const colleges = data.colleges || [];
        // Add "No Organization" as default option
        this.collegeCache = ['No Organization', ...colleges];
        console.log('[COLLEGE] Loaded colleges:', this.collegeCache.length);
        return this.collegeCache;
      } else {
        console.warn('[COLLEGE] No colleges document found');
        return ['No Organization'];
      }
    } catch (error) {
      console.error('[COLLEGE] Error loading colleges:', error);
      return ['No Organization'];
    }
  }

  /**
   * Load college-specific data (departments, batches, email suffix)
   * @param {string} collegeName - Name of the college
   * @returns {Promise<Object>} - College data object
   */
  async loadCollegeData(collegeName) {
    try {
      console.log('[COLLEGE] Loading data for college:', collegeName);

      // Special case for "No Organization"
      if (collegeName === 'No Organization') {
        return {
          departments: ['No Organization'],
          batches: ['No Organization'],
          emailSuffix: '',
          college: collegeName
        };
      }

      const docRef = doc(db, this.COLLEGES_PATH, collegeName, 'data');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('[COLLEGE] Loaded college data for:', collegeName);

        return {
          departments: data.departments || [],
          batches: data.batches || [],
          emailSuffix: data.ends_with || '',
          college: collegeName
        };
      } else {
        console.warn('[COLLEGE] No data found for college:', collegeName);
        return {
          departments: [],
          batches: [],
          emailSuffix: '',
          college: collegeName
        };
      }
    } catch (error) {
      console.error('[COLLEGE] Error loading college data:', error);
      return {
        departments: [],
        batches: [],
        emailSuffix: '',
        college: collegeName
      };
    }
  }

  /**
   * Generate organization email based on prefix and college suffix
   * @param {string} emailPrefix - Email prefix (alphanumeric + dots/underscores)
   * @param {string} emailSuffix - College email suffix
   * @returns {string} - Generated organization email
   */
  generateOrganizationEmail(emailPrefix, emailSuffix) {
    if (!emailPrefix || !emailSuffix) return '';

    // Validate prefix: alphanumeric + dots/underscores only
    const cleanPrefix = emailPrefix
      .toLowerCase()
      .replace(/[^a-z0-9._]/g, '');

    return `${cleanPrefix}${emailSuffix}`;
  }

  /**
   * Validate email prefix format
   * @param {string} prefix - Email prefix to validate
   * @returns {boolean} - True if valid format
   */
  validateEmailPrefix(prefix) {
    if (!prefix) return false;
    // Only alphanumeric characters, dots, and underscores allowed
    return /^[a-zA-Z0-9._]+$/.test(prefix);
  }

  /**
   * Clear college cache (useful for refreshing data)
   */
  clearCache() {
    this.collegeCache = null;
    console.log('[COLLEGE] Cache cleared');
  }

  /**
   * Validate if college exists in the loaded data
   * @param {string} collegeName - College name to validate
   * @returns {Promise<boolean>} - True if college exists
   */
  async validateCollege(collegeName) {
    const colleges = await this.loadColleges();
    return colleges.includes(collegeName);
  }
}

export default new CollegeDataService();