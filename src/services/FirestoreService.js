import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    serverTimestamp,
    runTransaction 
  } from 'firebase/firestore';
  import { firestore } from '../config/firebase';
  
  class FirestoreService {
    async getUserData(phoneNumber) {
      try {
        const userRef = doc(firestore, 'skillbench', 'ALL_USERS', 'users', phoneNumber);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          return userSnap.data();
        }
        
        return null;
      } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
      }
    }
  
    async registerUser(phoneNumber, userData) {
      try {
        const firebaseUID = userData.firebaseUID || 'anonymous-user';
        
        await runTransaction(firestore, async (transaction) => {
          const mainUserRef = doc(firestore, 'skillbench', 'ALL_USERS', 'users', phoneNumber);
          const userSnapshot = await transaction.get(mainUserRef);
          const existingData = userSnapshot.exists() ? userSnapshot.data() : null;
  
          const completeUserData = {
            ...userData,
            phone_number: phoneNumber,
            username: userData.username || existingData?.username || 'User',
            current_firebase_uid: firebaseUID,
            created_at: userSnapshot.exists() ? 
              (existingData?.created_at || serverTimestamp()) : 
              serverTimestamp(),
            last_login: serverTimestamp(),
            streaks: userData.streaks || existingData?.streaks || 0,
            coins: userData.coins || existingData?.coins || 5,
            xp: userData.xp || existingData?.xp || 20,
            daily_usage: userData.daily_usage || existingData?.daily_usage || 0,
            total_usage: userData.total_usage || existingData?.total_usage || 0,
            gender: userData.gender || existingData?.gender || 'prefer_not_to_say',
            total_request: userData.total_request || existingData?.total_request || {
              practice_mode: 0,
              test_mode: 0,
            },
          };
  
          transaction.set(mainUserRef, completeUserData, { merge: true });
  
          if (userData.college && userData.department && userData.batch) {
            const collegeUserRef = doc(
              firestore, 
              'skillbench', 
              userData.college, 
              userData.department, 
              userData.batch, 
              'users', 
              phoneNumber
            );
  
            transaction.set(collegeUserRef, {
              phone_number: phoneNumber,
              username: userData.username,
              current_firebase_uid: firebaseUID,
              reference: mainUserRef,
            }, { merge: true });
          }
        });
  
        console.log('User registered successfully');
        
        return { success: true };
      } catch (error) {
        console.error('Error registering user:', error);
        throw error;
      }
    }
  
    async updateUserStats(phoneNumber, stats) {
      try {
        const userRef = doc(firestore, 'skillbench', 'ALL_USERS', 'users', phoneNumber);
        await updateDoc(userRef, {
          ...stats,
          last_login: serverTimestamp()
        });
  
        console.log('User stats updated successfully');
        
        return { success: true };
      } catch (error) {
        console.error('Error updating user stats:', error);
        throw error;
      }
    }
  
    async checkUserExists(phoneNumber) {
      try {
        const userRef = doc(firestore, 'skillbench', 'ALL_USERS', 'users', phoneNumber);
        const userSnap = await getDoc(userRef);
        return userSnap.exists();
      } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
      }
    }
  }
  
  export default new FirestoreService();