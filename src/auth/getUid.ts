import { useUid } from './UidProvider';

/**
 * Hook for components that need blocking UID access
 * Usage inside React components:
 * 
 * const getUidOrThrow = useGetUidOrThrow();
 * const handleSubmit = async () => {
 *   const uid = await getUidOrThrow();
 *   // use uid for database operations
 * };
 */
export const useGetUidOrThrow = () => {
  const { getUidOrThrow } = useUid();
  return getUidOrThrow;
};

/**
 * Hook for components that need immediate UID access (non-blocking)
 * Usage inside React components:
 * 
 * const { uid, loading } = useCurrentUid();
 * if (loading) return <Spinner />;
 * if (!uid) return <LoginPrompt />;
 */
export const useCurrentUid = () => {
  const { uid, loading } = useUid();
  return { uid, loading };
};

/**
 * Hook for components that need the full user object
 * Usage inside React components:
 * 
 * const { user, uid, loading } = useFirebaseUser();
 * if (loading) return <Spinner />;
 * if (!user) return <LoginPrompt />;
 */
export const useFirebaseUser = () => {
  const { user, uid, loading } = useUid();
  return { user, uid, loading };
};

/**
 * Factory function for creating services that need UID access
 * Usage in service constructors:
 * 
 * class QuizService {
 *   constructor(private getUidOrThrow: () => Promise<string>) {}
 *   
 *   async saveQuizResult(score: number) {
 *     const uid = await this.getUidOrThrow();
 *     // use uid for database operations
 *   }
 * }
 * 
 * // In component:
 * const getUidOrThrow = useGetUidOrThrow();
 * const quizService = new QuizService(getUidOrThrow);
 */
export type GetUidOrThrowFunction = (timeoutMs?: number) => Promise<string>;