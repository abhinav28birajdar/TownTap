// Firebase Authentication Service for LocalMart
// Handles all authentication operations as specified in LocalMart requirements

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  User,
  UserCredential,
  ConfirmationResult,
  RecaptchaVerifier,
  ApplicationVerifier
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, firestore } from './config';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  profile_picture_url?: string;
  user_type: 'customer' | 'business' | 'admin';
  fcm_token?: string;
  created_at: any;
  updated_at: any;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  userProfile?: UserProfile;
  error?: string;
}

export interface BusinessProfile {
  id: string;
  owner_id: string;
  business_name: string;
  description?: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  contact_person: string;
  contact_phone: string;
  operating_hours: Record<string, { open: string; close: string; is_closed: boolean }>;
  delivery_radius_km?: number;
  min_order_value?: number;
  delivery_charge?: number;
  business_category_type: 'type_a' | 'type_b' | 'type_c';
  specialized_categories: string[];
  is_approved: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval';
  avg_rating: number;
  total_reviews: number;
  created_at: any;
  updated_at: any;
}

class FirebaseAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  // Initialize reCAPTCHA for phone auth
  setupRecaptcha(containerId: string): RecaptchaVerifier {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }
    
    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });

    return this.recaptchaVerifier;
  }

  // Email & Password Authentication
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await this.getUserProfile(credential.user.uid);
      
      return {
        success: true,
        user: credential.user,
        userProfile
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signUpWithEmail(
    email: string, 
    password: string, 
    fullName: string, 
    userType: 'customer' | 'business' = 'customer'
  ): Promise<AuthResponse> {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(credential.user, {
        displayName: fullName
      });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        id: credential.user.uid,
        email,
        full_name: fullName,
        user_type: userType,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      await setDoc(doc(firestore, 'users', credential.user.uid), userProfile);

      return {
        success: true,
        user: credential.user,
        userProfile
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Phone Authentication
  async signInWithPhoneNumber(phoneNumber: string): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> {
    try {
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized. Call setupRecaptcha first.');
      }

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, this.recaptchaVerifier);
      
      return {
        success: true,
        confirmationResult
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async verifyPhoneOTP(confirmationResult: ConfirmationResult, otp: string, userData?: { fullName: string; userType: 'customer' | 'business' }): Promise<AuthResponse> {
    try {
      const credential = await confirmationResult.confirm(otp);
      
      // Check if user profile exists
      let userProfile = await this.getUserProfile(credential.user.uid);
      
      // If new user and userData provided, create profile
      if (!userProfile && userData) {
        userProfile = {
          id: credential.user.uid,
          email: credential.user.email || '',
          full_name: userData.fullName,
          phone_number: credential.user.phoneNumber || '',
          user_type: userData.userType,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };

        await setDoc(doc(firestore, 'users', credential.user.uid), userProfile);
      }

      return {
        success: true,
        user: credential.user,
        userProfile: userProfile || undefined
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Social Authentication (Google, Facebook)
  async signInWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      
      // Check if user profile exists, create if not
      let userProfile = await this.getUserProfile(result.user.uid);
      
      if (!userProfile) {
        userProfile = {
          id: result.user.uid,
          email: result.user.email || '',
          full_name: result.user.displayName || 'User',
          profile_picture_url: result.user.photoURL || undefined,
          user_type: 'customer',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };

        await setDoc(doc(firestore, 'users', result.user.uid), userProfile);
      }

      return {
        success: true,
        user: result.user,
        userProfile: userProfile || undefined
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signInWithFacebook(accessToken: string): Promise<AuthResponse> {
    try {
      const credential = FacebookAuthProvider.credential(accessToken);
      const result = await signInWithCredential(auth, credential);
      
      // Check if user profile exists, create if not
      let userProfile = await this.getUserProfile(result.user.uid);
      
      if (!userProfile) {
        userProfile = {
          id: result.user.uid,
          email: result.user.email || '',
          full_name: result.user.displayName || 'User',
          profile_picture_url: result.user.photoURL || undefined,
          user_type: 'customer',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };

        await setDoc(doc(firestore, 'users', result.user.uid), userProfile);
      }

      return {
        success: true,
        user: result.user,
        userProfile: userProfile || undefined
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(firestore, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(firestore, 'users', userId);
      await updateDoc(docRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Business Profile Management
  async createBusinessProfile(ownerUserId: string, businessData: Omit<BusinessProfile, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; businessId?: string; error?: string }> {
    try {
      const businessRef = doc(collection(firestore, 'businesses'));
      const businessProfile: BusinessProfile = {
        id: businessRef.id,
        owner_id: ownerUserId,
        ...businessData,
        is_approved: false,
        status: 'pending_approval',
        avg_rating: 0,
        total_reviews: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      await setDoc(businessRef, businessProfile);

      // Update user type to business
      await this.updateUserProfile(ownerUserId, { user_type: 'business' });

      return {
        success: true,
        businessId: businessRef.id
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getBusinessProfile(businessId: string): Promise<BusinessProfile | null> {
    try {
      const docRef = doc(firestore, 'businesses', businessId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as BusinessProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching business profile:', error);
      return null;
    }
  }

  async getBusinessByOwnerId(ownerId: string): Promise<BusinessProfile | null> {
    try {
      const q = query(collection(firestore, 'businesses'), where('owner_id', '==', ownerId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as BusinessProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching business by owner:', error);
      return null;
    }
  }

  // Password Reset
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign Out
  async signOutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Utility Methods
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'Email address is already registered.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code.';
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Auth state observer
  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}

// Export singleton instance
export const firebaseAuth = new FirebaseAuthService();
export default firebaseAuth;