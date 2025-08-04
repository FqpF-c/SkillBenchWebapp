import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

class PrepService {
  constructor() {
    this.categoryTitles = [];
    this.categoryItems = {};
    this.displayTitles = {};
    this.isLoaded = false;
  }

  async loadAllData() {
    try {
      console.log('🚀 Starting PrepService data load...');
      
      await this.loadCategoryTitles();
      await this.loadDisplayTitles();
      await this.loadAllCategoryItems();
      
      this.isLoaded = true;
      console.log('✅ PrepService data load complete');
      
      return {
        categoryTitles: this.categoryTitles,
        categoryItems: this.categoryItems,
        displayTitles: this.displayTitles
      };
    } catch (error) {
      console.error('❌ PrepService load error:', error);
      throw error;
    }
  }

  async loadCategoryTitles() {
    try {
      console.log('📋 Loading category titles from /prep/Title');
      
      const titlesDoc = await getDoc(doc(db, 'prep', 'Title'));
      
      if (titlesDoc.exists()) {
        const data = titlesDoc.data();
        console.log('📋 Title document data:', data);
        
        if (data && data['Title'] && Array.isArray(data['Title'])) {
          this.categoryTitles = data['Title'];
          console.log('✅ Category titles loaded:', this.categoryTitles);
        } else {
          console.warn('⚠️ Title field missing or not an array');
          console.log('Available fields:', Object.keys(data || {}));
          this.categoryTitles = [];
        }
      } else {
        console.warn('⚠️ /prep/Title document does not exist');
        this.categoryTitles = [];
      }
    } catch (error) {
      console.error('❌ Error loading category titles:', error);
      this.categoryTitles = [];
    }
  }

  async loadDisplayTitles() {
    try {
      console.log('🏷️ Loading display titles from /prep/TitleDisplay');
      
      const displayDoc = await getDoc(doc(db, 'prep', 'TitleDisplay'));
      
      if (displayDoc.exists()) {
        const data = displayDoc.data();
        console.log('🏷️ TitleDisplay document data:', data);
        
        const titles = {};
        
        for (const categoryId of this.categoryTitles) {
          if (data && data[categoryId] && typeof data[categoryId] === 'string') {
            titles[categoryId] = data[categoryId];
          } else {
            titles[categoryId] = categoryId;
          }
        }
        
        this.displayTitles = titles;
        console.log('✅ Display titles loaded:', this.displayTitles);
      } else {
        console.warn('⚠️ /prep/TitleDisplay document does not exist');
        this.displayTitles = {};
      }
    } catch (error) {
      console.error('❌ Error loading display titles:', error);
      this.displayTitles = {};
    }
  }

  async loadAllCategoryItems() {
    console.log('📦 Loading all category items...');
    
    for (const categoryId of this.categoryTitles) {
      await this.loadCategoryItems(categoryId);
    }
    
    console.log('✅ All category items loaded:', this.categoryItems);
  }

  async loadCategoryItems(categoryId) {
    try {
      console.log(`📦 Loading items for category: ${categoryId}`);
      
      const categoryItemsRef = doc(db, 'prep', 'Title', categoryId, categoryId);
      console.log(`📦 Document path: prep/Title/${categoryId}/${categoryId}`);
      
      const docSnapshot = await getDoc(categoryItemsRef);
      console.log(`📦 ${categoryId} document exists:`, docSnapshot.exists());
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log(`📦 ${categoryId} raw document data:`, data);
        
        if (data && data[categoryId] && Array.isArray(data[categoryId])) {
          const rawItems = data[categoryId];
          console.log(`📦 Raw items for ${categoryId}:`, rawItems);
          
          const formattedItems = [];
          
          for (const item of rawItems) {
            let itemName;
            let formattedItem;
            
            if (typeof item === 'object' && item !== null) {
              formattedItem = { ...item };
              itemName = formattedItem['name'] || Object.keys(formattedItem)[0] || 'Unknown';
            } else if (typeof item === 'string') {
              itemName = item;
              formattedItem = { name: itemName };
            } else {
              itemName = item?.toString() || 'Unknown';
              formattedItem = { name: itemName };
            }
            
            if (!formattedItem['name']) {
              formattedItem['name'] = itemName;
            }
            
            formattedItems.push(formattedItem);
          }
          
          this.categoryItems[categoryId] = formattedItems;
          console.log(`✅ ${categoryId}: ${formattedItems.length} items processed`);
        } else {
          console.warn(`⚠️ ${categoryId} field missing or not an array`);
          console.log('Available fields:', Object.keys(data || {}));
          this.categoryItems[categoryId] = [];
        }
      } else {
        console.warn(`⚠️ Document /prep/Title/${categoryId}/${categoryId} does not exist`);
        this.categoryItems[categoryId] = [];
      }
    } catch (error) {
      console.error(`❌ Error loading items for ${categoryId}:`, error);
      this.categoryItems[categoryId] = [];
    }
  }

  getCategoryTitles() {
    return this.categoryTitles;
  }

  getCategoryItems(categoryId) {
    return this.categoryItems[categoryId] || [];
  }

  getDisplayTitle(categoryId) {
    return this.displayTitles[categoryId] || categoryId;
  }

  getAllData() {
    return {
      categoryTitles: this.categoryTitles,
      categoryItems: this.categoryItems,
      displayTitles: this.displayTitles,
      isLoaded: this.isLoaded
    };
  }
}

export default new PrepService();