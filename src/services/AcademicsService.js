import { db } from '../config/firebase';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';

export class AcademicsService {
  /**
   * Get all departments for a college
   * @param {string} collegeId - The college ID
   * @returns {Promise<Array>} Array of department names
   */
  static async getDepartments(collegeId) {
    try {
      if (!collegeId) throw new Error('College ID is required');
      
      const collegeDocRef = doc(db, 'colleges', collegeId);
      const collegeDoc = await getDoc(collegeDocRef);
      
      if (!collegeDoc.exists()) {
        throw new Error('College data not found');
      }
      
      const data = collegeDoc.data();
      if (data && data.Departments) {
        return Array.isArray(data.Departments) ? data.Departments : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  /**
   * Get all semesters for a department
   * @param {string} collegeId - The college ID
   * @param {string} departmentId - The department ID
   * @returns {Promise<Array>} Array of semester names
   */
  static async getSemesters(collegeId, departmentId) {
    try {
      if (!collegeId || !departmentId) {
        throw new Error('College ID and Department ID are required');
      }
      
      const departmentDocRef = doc(db, 'colleges', collegeId, 'Departments', departmentId);
      const departmentDoc = await getDoc(departmentDocRef);
      
      if (!departmentDoc.exists()) {
        throw new Error('Department data not found');
      }
      
      const data = departmentDoc.data();
      if (data && data.semesters) {
        return Array.isArray(data.semesters) ? data.semesters : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching semesters:', error);
      throw error;
    }
  }

  /**
   * Get all subjects for a semester
   * @param {string} collegeId - The college ID
   * @param {string} departmentId - The department ID
   * @param {string} semesterId - The semester ID
   * @returns {Promise<Array>} Array of subject names
   */
  static async getSubjects(collegeId, departmentId, semesterId) {
    try {
      if (!collegeId || !departmentId || !semesterId) {
        throw new Error('College ID, Department ID, and Semester ID are required');
      }
      
      const semesterDocRef = doc(db, 'colleges', collegeId, 'Departments', departmentId, 'Semesters', semesterId);
      const semesterDoc = await getDoc(semesterDocRef);
      
      if (!semesterDoc.exists()) {
        throw new Error('Semester data not found');
      }
      
      const data = semesterDoc.data();
      if (data && data.subjectList) {
        return Array.isArray(data.subjectList) ? data.subjectList : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  /**
   * Get all units for a subject
   * @param {string} collegeId - The college ID
   * @param {string} departmentId - The department ID
   * @param {string} semesterId - The semester ID
   * @param {string} subjectId - The subject ID
   * @returns {Promise<Array>} Array of unit names
   */
  static async getUnits(collegeId, departmentId, semesterId, subjectId) {
    try {
      if (!collegeId || !departmentId || !semesterId || !subjectId) {
        throw new Error('All parameters are required');
      }
      
      const unitsDocRef = doc(db, 'colleges', collegeId, 'Departments', departmentId, 'Semesters', semesterId, subjectId, 'Units');
      const unitsDoc = await getDoc(unitsDocRef);
      
      if (!unitsDoc.exists()) {
        throw new Error('Units data not found');
      }
      
      const data = unitsDoc.data();
      if (data && data.Units) {
        return Array.isArray(data.Units) ? data.Units : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching units:', error);
      throw error;
    }
  }

  /**
   * Get questions data for practice/test mode
   * @param {string} collegeId - The college ID
   * @param {string} departmentId - The department ID
   * @param {string} semesterId - The semester ID
   * @param {string} subjectId - The subject ID
   * @param {string} unitId - The unit ID
   * @returns {Promise<Object>} Questions data
   */
  static async getQuestionsData(collegeId, departmentId, semesterId, subjectId, unitId) {
    try {
      if (!collegeId || !departmentId || !semesterId || !subjectId || !unitId) {
        throw new Error('All parameters are required');
      }
      
      // First, check if unit exists as a collection (for questions)
      const questionsRef = collection(db, 'colleges', collegeId, 'Departments', departmentId, 'Semesters', semesterId, subjectId, unitId);
      const questionsSnapshot = await getDocs(questionsRef);
      
      const questions = [];
      questionsSnapshot.forEach((doc) => {
        questions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        topicName: subjectId,
        unitName: unitId,
        department: departmentId,
        semester: semesterId,
        questions: questions,
        metadata: {
          collegeId,
          departmentId,
          semesterId,
          subjectId,
          unitId
        }
      };
    } catch (error) {
      console.error('Error fetching questions data:', error);
      throw error;
    }
  }
}