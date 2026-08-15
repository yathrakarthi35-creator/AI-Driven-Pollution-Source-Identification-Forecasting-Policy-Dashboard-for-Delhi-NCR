import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Persist or update user profile in Firestore
    if (result.user) {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(
        userRef,
        {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    }
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Types for user data
export interface UserAlertPreference {
  phone: string;
  email: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  stationId: string;
  thresholdAqi: number;
  updatedAt?: any;
}

export interface CommunitySmogReport {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  location: string;
  landmark: string;
  severity: 'Visible Smog Plume' | 'Burning Leaves/Waste' | 'Dust/Construction' | 'Traffic Congestion Choke';
  description: string;
  reportedAqiEstimate?: number;
  timestamp: any;
}

export interface SavedCommuteRoute {
  id: string;
  routeName: string;
  origin: string;
  destination: string;
  preferredMode: string;
  departureTime: string;
  avgExposureUgm3: number;
  savedAt: any;
}

// 1. User Alert Preferences in Firestore
export const saveUserAlertPrefs = async (userId: string, prefs: Partial<UserAlertPreference>) => {
  const prefRef = doc(db, 'users', userId, 'subscriptions', 'primary');
  await setDoc(prefRef, { ...prefs, updatedAt: serverTimestamp() }, { merge: true });
};

export const getUserAlertPrefs = async (userId: string): Promise<UserAlertPreference | null> => {
  const prefRef = doc(db, 'users', userId, 'subscriptions', 'primary');
  const snap = await getDoc(prefRef);
  if (snap.exists()) {
    return snap.data() as UserAlertPreference;
  }
  return null;
};

// 2. User Favorite/Pinned Stations
export const toggleUserSavedStation = async (userId: string, stationId: string, isSaved: boolean) => {
  const stationRef = doc(db, 'users', userId, 'saved_stations', stationId);
  if (isSaved) {
    await setDoc(stationRef, { stationId, savedAt: serverTimestamp() });
  } else {
    await deleteDoc(stationRef);
  }
};

export const getUserSavedStations = async (userId: string): Promise<string[]> => {
  const stationsCol = collection(db, 'users', userId, 'saved_stations');
  const snap = await getDocs(stationsCol);
  return snap.docs.map((d) => d.id);
};

// 3. Community Smog Ground Reports
export const submitCommunityReport = async (
  report: Omit<CommunitySmogReport, 'id' | 'timestamp'>
) => {
  const reportsCol = collection(db, 'community_reports');
  const newDocRef = doc(reportsCol);
  await setDoc(newDocRef, {
    ...report,
    id: newDocRef.id,
    timestamp: serverTimestamp(),
  });
  return newDocRef.id;
};

export const subscribeCommunityReports = (
  callback: (reports: CommunitySmogReport[]) => void
) => {
  const reportsCol = collection(db, 'community_reports');
  const q = query(reportsCol, orderBy('timestamp', 'desc'), limit(25));
  return onSnapshot(q, (snapshot) => {
    const list: CommunitySmogReport[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId || '',
        userName: data.userName || 'Citizen Reporter',
        userPhoto: data.userPhoto || '',
        location: data.location || 'Delhi-NCR',
        landmark: data.landmark || '',
        severity: data.severity || 'Visible Smog Plume',
        description: data.description || '',
        reportedAqiEstimate: data.reportedAqiEstimate,
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
      });
    });
    callback(list);
  });
};

// 4. User Saved Commute Routes
export const saveUserCommuteRoute = async (userId: string, route: Omit<SavedCommuteRoute, 'id' | 'savedAt'>) => {
  const routesCol = collection(db, 'users', userId, 'saved_routes');
  const newRouteRef = doc(routesCol);
  await setDoc(newRouteRef, {
    ...route,
    id: newRouteRef.id,
    savedAt: serverTimestamp(),
  });
  return newRouteRef.id;
};

export const getUserCommuteRoutes = async (userId: string): Promise<SavedCommuteRoute[]> => {
  const routesCol = collection(db, 'users', userId, 'saved_routes');
  const snap = await getDocs(routesCol);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      routeName: data.routeName || 'My Commute',
      origin: data.origin || '',
      destination: data.destination || '',
      preferredMode: data.preferredMode || 'Metro',
      departureTime: data.departureTime || '09:00',
      avgExposureUgm3: data.avgExposureUgm3 || 0,
      savedAt: data.savedAt ? data.savedAt.toDate() : new Date(),
    };
  });
};
