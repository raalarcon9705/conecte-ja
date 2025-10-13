// Export all contexts from a single entry point
export { AuthProvider, useAuth } from './AuthContext';
export type { AccountMode } from '@conecteja/supabase';

export { CategoriesProvider, useCategories } from './CategoriesContext';

export { ProfessionalsProvider, useProfessionals } from './ProfessionalsContext';
export type { Professional } from './ProfessionalsContext';

export { ChatsProvider, useChats } from './ChatsContext';
export type { ConversationWithProfiles, MessageWithSender } from './ChatsContext';

export { BookingsProvider, useBookings } from './BookingsContext';
export type { BookingWithDetails, BookingStatus } from './BookingsContext';

export { FavoritesProvider, useFavorites } from './FavoritesContext';

export { NotificationsProvider, useNotifications } from './NotificationsContext';
export type { NotificationType } from './NotificationsContext';

export { SubscriptionsProvider, useSubscriptions } from './SubscriptionsContext';
export type { SubscriptionWithPlan, SubscriptionStatus } from './SubscriptionsContext';

export { ProfileProvider, useProfile } from './ProfileContext';
export type { ProfileWithProfessional } from './ProfileContext';

