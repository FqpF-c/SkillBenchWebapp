import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    serverTimestamp,
    runTransaction 
  } from 'firebase/firestore';
  import { db, DB_PATHS } from '../config/firebase';
  
  class FirestoreService {
    async getUserData(phoneNumber) {
      try {
        const userRef = doc(db, DB_PATHS.USERS, phoneNumber);
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
        
        const completeUserData = {
          username: userData.username || 'User',
          phone_number: phoneNumber,
          college: userData.college || '',
          department: userData.department || '',
          batch: userData.batch || '',
          email: userData.email || '',
          gender: userData.gender || 'prefer_not_to_say',
          current_firebase_uid: firebaseUID,
          created_at: serverTimestamp(),
          last_login: serverTimestamp(),
          total_request: {
            practice_mode: 0,
            test_mode: 0,
          },
          daily_usage: 0,
          total_usage: 0
        };

        await setDoc(doc(db, DB_PATHS.USERS, phoneNumber), completeUserData);

        console.log('User registered successfully in Firestore');
        
        return { success: true };
      } catch (error) {
        console.error('Error registering user:', error);
        throw error;
      }
    }
  
    async updateUserData(phoneNumber, userData) {
      try {
        const userRef = doc(db, DB_PATHS.USERS, phoneNumber);
        await updateDoc(userRef, {
          ...userData,
          last_login: serverTimestamp()
        });
  
        console.log('User data updated successfully in Firestore');
        
        return { success: true };
      } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
      }
    }
  
    async checkUserExists(phoneNumber) {
      try {
        const userRef = doc(db, DB_PATHS.USERS, phoneNumber);
        const userSnap = await getDoc(userRef);
        return userSnap.exists();
      } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
      }
    }

    async loadCategoryTitles() {
      try {
        const titlesRef = doc(db, DB_PATHS.PREP_TITLE, 'Title');
        const docSnapshot = await getDoc(titlesRef);
        
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data && data['Title'] && Array.isArray(data['Title'])) {
            return data['Title'];
          }
        }
        return [];
      } catch (error) {
        console.error('Error loading category titles:', error);
        return [];
      }
    }

    async loadDisplayTitles() {
      try {
        const displayDoc = await getDoc(doc(db, DB_PATHS.PREP_TITLE, 'TitleDisplay'));
        
        if (displayDoc.exists()) {
          const data = displayDoc.data();
          const titles = {};
          
          for (const [key, value] of Object.entries(data || {})) {
            if (typeof value === 'string') {
              titles[key] = value;
            } else {
              titles[key] = key;
            }
          }
          
          return titles;
        }
        return {};
      } catch (error) {
        console.error('Error loading display titles:', error);
        return {};
      }
    }

    async loadCategoryItems(categoryId) {
      try {
        const categoryItemsRef = doc(db, DB_PATHS.PREP_TITLE, categoryId, categoryId);
        const docSnapshot = await getDoc(categoryItemsRef);
        
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data && data[categoryId] && Array.isArray(data[categoryId])) {
            const rawItems = data[categoryId];
            const formattedItems = [];
            
            for (const item of rawItems) {
              let itemName;
              let formattedItem;
              
              if (typeof item === 'object' && item !== null) {
                formattedItem = { ...item };
                itemName = formattedItem['name'] || Object.keys(formattedItem)[0]?.toString() || 'Unknown';
              } else if (typeof item === 'string') {
                itemName = item;
                formattedItem = { 'name': itemName };
              } else {
                itemName = item?.toString() || 'Unknown';
                formattedItem = { 'name': itemName };
              }
              
              formattedItem['iconAsset'] = this.getAssetForTopic(itemName);
              formattedItem['color'] = this.getColorForTopic(itemName);
              
              if (!formattedItem['name']) {
                formattedItem['name'] = itemName;
              }
              
              formattedItems.push(formattedItem);
            }
            
            return formattedItems;
          }
        }
        return [];
      } catch (error) {
        console.error(`Error loading items for ${categoryId}:`, error);
        return [];
      }
    }

    async loadSubcategoryTopics(categoryId, subcategory) {
      try {
        const topicsRef = doc(db, DB_PATHS.PREP_TITLE, categoryId, categoryId, subcategory, 'Topics');
        const docSnapshot = await getDoc(topicsRef);
        
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data && data.Topics && Array.isArray(data.Topics)) {
            return data.Topics.map(topic => topic.toString());
          }
        }
        return [];
      } catch (error) {
        console.error(`Error loading topics for ${subcategory}:`, error);
        return [];
      }
    }

    // Helper methods
    getAssetForTopic(topicName) {
      const normalizedName = topicName.toLowerCase().trim();
      
      const topicAssetMap = {
        'c': '/assets/programming/c.png',
        'c++': '/assets/programming/cpp.png',
        'cpp': '/assets/programming/cpp.png',
        'java': '/assets/programming/java.png',
        'python': '/assets/programming/python.png',
        'kotlin': '/assets/programming/kotlin.png',
        'swift': '/assets/programming/swift.png',
        'flutter': '/assets/programming/flutter.png',
        'react': '/assets/programming/react.png',
        'react native': '/assets/programming/react.png',
        'web development': '/assets/programming/web_development.png',
        'web': '/assets/programming/web_development.png',
        'aws': '/assets/programming/aws.png',
        'javascript': '/assets/programming/javascript.png',
        'js': '/assets/programming/javascript.png',
        'html': '/assets/programming/html.png',
        'css': '/assets/programming/css.png',
      };
      
      return topicAssetMap[normalizedName] || '/assets/programming/default.png';
    }

    getColorForTopic(topicName) {
      const normalizedName = topicName.toLowerCase().trim();
      
      const categoryColors = {
        'c': '#5C6BC0',
        'c++': '#42A5F5',
        'java': '#EF5350',
        'python': '#66BB6A',
        'kotlin': '#AB47BC',
        'swift': '#FF7043',
        'flutter': '#29B6F6',
        'react': '#26C6DA',
        'web development': '#26A69A',
        'aws': '#FF9800',
        'javascript': '#F7DF1E',
        'html': '#E34F26',
        'css': '#1572B6',
      };
      
      return categoryColors[normalizedName] || '#366D9C';
    }
  }
  
  export default new FirestoreService();