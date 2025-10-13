# Contexts Documentation

Este directorio contiene todos los contexts de React que manejan el estado global de la aplicación.

## Tabla de Contenidos

1. [AuthContext](#authcontext)
2. [ProfileContext](#profilecontext)
3. [CategoriesContext](#categoriescontext)
4. [ProfessionalsContext](#professionalscontext)
5. [BookingsContext](#bookingscontext)
6. [ChatsContext](#chatscontext)
7. [FavoritesContext](#favoritescontext)
8. [NotificationsContext](#notificationscontext)
9. [SubscriptionsContext](#subscriptionscontext)

---

## AuthContext

Maneja la autenticación del usuario y el cambio entre modos (cliente/profesional).

### Uso

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    currentMode,
    canSwitchMode,
    login, 
    logout, 
    register,
    switchMode,
  } = useAuth();

  // ...
}
```

### Funciones principales

- `login(user)` - Inicia sesión con un usuario
- `logout()` - Cierra sesión
- `register(data)` - Registra un nuevo usuario
- `switchMode(mode)` - Cambia entre modo cliente/profesional
- `sendPasswordResetEmail(email)` - Envía email de recuperación

---

## ProfileContext

Maneja el perfil del usuario actual (tanto cliente como profesional).

### Uso

```tsx
import { useProfile } from '../contexts/ProfileContext';

function MyComponent() {
  const {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    updateProfessionalProfile,
    uploadAvatar,
    updateLocation,
  } = useProfile();

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user]);
}
```

### Funciones principales

- `fetchProfile(userId)` - Obtiene el perfil completo del usuario
- `updateProfile(updates)` - Actualiza datos del perfil
- `updateProfessionalProfile(updates)` - Actualiza perfil profesional
- `uploadAvatar(file, userId)` - Sube un nuevo avatar
- `updateLocation(lat, lng, address?, city?, state?)` - Actualiza ubicación
- `updateLastSeen()` - Actualiza última conexión (automático)

---

## CategoriesContext

Maneja las categorías de servicios.

### Uso

```tsx
import { useCategories } from '../contexts/CategoriesContext';

function MyComponent() {
  const { categories, loading, error } = useCategories();

  return (
    <View>
      {categories.map(category => (
        <Text key={category.id}>{category.name}</Text>
      ))}
    </View>
  );
}
```

### Funciones principales

- `refetch()` - Recarga las categorías

---

## ProfessionalsContext

Maneja los profesionales y sus perfiles.

### Uso

```tsx
import { useProfessionals } from '../contexts/ProfessionalsContext';

function MyComponent() {
  const {
    professionals,
    currentProfessional,
    loading,
    fetchProfessionalsByCategory,
    fetchProfessionalById,
    fetchNearbyProfessionals,
  } = useProfessionals();

  useEffect(() => {
    fetchProfessionalsByCategory(categoryId);
  }, [categoryId]);
}
```

### Funciones principales

- `fetchProfessionalsByCategory(categoryId)` - Busca por categoría
- `fetchProfessionalById(professionalId)` - Obtiene detalle de un profesional
- `fetchNearbyProfessionals(lat, lng, radius)` - Busca por ubicación
- `refetch()` - Recarga la lista

---

## BookingsContext

Maneja las reservas/citas.

### Uso

```tsx
import { useBookings } from '../contexts/BookingsContext';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, currentMode } = useAuth();
  const {
    bookings,
    loading,
    fetchBookings,
    createBooking,
    cancelBooking,
    confirmBooking,
    completeBooking,
  } = useBookings();

  useEffect(() => {
    if (user?.id) {
      fetchBookings(user.id, currentMode);
    }
  }, [user, currentMode]);

  const handleCreateBooking = async () => {
    await createBooking({
      professionalProfileId: 'prof-id',
      bookingDate: '2024-12-20',
      startTime: '10:00',
      serviceName: 'Consulta',
      price: 100,
    });
  };
}
```

### Funciones principales

- `fetchBookings(profileId, userType)` - Obtiene reservas del usuario
- `fetchBookingById(bookingId)` - Detalle de una reserva
- `createBooking(data)` - Crea nueva reserva
- `updateBookingStatus(id, status, notes?)` - Cambia estado
- `cancelBooking(id, reason)` - Cancela reserva
- `confirmBooking(id)` - Confirma reserva
- `completeBooking(id)` - Marca como completada

---

## ChatsContext

Maneja las conversaciones y mensajes.

### Uso

```tsx
import { useChats } from '../contexts/ChatsContext';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createOrGetConversation,
  } = useChats();

  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
    }
  }, [user]);

  const handleSendMessage = async () => {
    await sendMessage(conversationId, 'Hola!', 'text');
  };
}
```

### Funciones principales

- `fetchConversations(profileId)` - Obtiene conversaciones
- `fetchConversationById(id)` - Detalle de conversación
- `fetchMessages(conversationId)` - Mensajes de conversación
- `sendMessage(conversationId, content, type?, pendingData?)` - Envía mensaje
- `createOrGetConversation(clientId, professionalId)` - Crea o busca conversación
- `markMessageAsRead(messageId)` - Marca mensaje como leído
- `setPendingConversation(...)` - Configura conversación pendiente

**Nota:** Los mensajes nuevos se actualizan automáticamente vía Realtime.

---

## FavoritesContext

Maneja los profesionales favoritos del usuario.

### Uso

```tsx
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const {
    favorites,
    favoriteProfessionals,
    loading,
    fetchFavorites,
    toggleFavorite,
    isFavorite,
  } = useFavorites();

  useEffect(() => {
    if (user?.id) {
      fetchFavorites(user.id);
    }
  }, [user]);

  const handleToggleFavorite = async (professionalId: string) => {
    await toggleFavorite(professionalId);
  };
}
```

### Funciones principales

- `fetchFavorites(clientProfileId)` - Obtiene favoritos del usuario
- `addFavorite(professionalProfileId)` - Agrega a favoritos
- `removeFavorite(professionalProfileId)` - Elimina de favoritos
- `toggleFavorite(professionalProfileId)` - Alterna favorito
- `isFavorite(professionalProfileId)` - Verifica si es favorito

---

## NotificationsContext

Maneja las notificaciones del usuario.

### Uso

```tsx
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user]);
}
```

### Funciones principales

- `fetchNotifications(profileId)` - Obtiene notificaciones
- `markAsRead(notificationId)` - Marca como leída
- `markAllAsRead(profileId)` - Marca todas como leídas
- `deleteNotification(notificationId)` - Elimina notificación
- `unreadCount` - Contador de no leídas

**Nota:** Las notificaciones nuevas se actualizan automáticamente vía Realtime.

---

## SubscriptionsContext

Maneja las suscripciones y planes.

### Uso

```tsx
import { useSubscriptions } from '../contexts/SubscriptionsContext';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const {
    currentSubscription,
    availablePlans,
    loading,
    fetchCurrentSubscription,
    createSubscription,
    cancelSubscription,
  } = useSubscriptions();

  useEffect(() => {
    if (user?.id) {
      fetchCurrentSubscription(user.id);
    }
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    await createSubscription(planId);
  };
}
```

### Funciones principales

- `fetchCurrentSubscription(profileId)` - Obtiene suscripción activa
- `fetchAvailablePlans()` - Obtiene planes disponibles (se carga automáticamente)
- `createSubscription(planId)` - Crea nueva suscripción
- `cancelSubscription(id, reason?, feedback?)` - Cancela suscripción
- `updateSubscriptionPlan(id, newPlanId)` - Cambia de plan

---

## Jerarquía de Providers

Los providers están anidados en el siguiente orden en `App.tsx`:

```tsx
<AuthProvider>
  <ProfileProvider>
    <CategoriesProvider>
      <ProfessionalsProvider>
        <SubscriptionsProvider>
          <BookingsProvider>
            <ChatsProvider>
              <FavoritesProvider>
                <NotificationsProvider>
                  {/* App */}
                </NotificationsProvider>
              </FavoritesProvider>
            </ChatsProvider>
          </BookingsProvider>
        </SubscriptionsProvider>
      </ProfessionalsProvider>
    </CategoriesProvider>
  </ProfileProvider>
</AuthProvider>
```

Esta jerarquía permite que los contexts internos accedan a los externos cuando sea necesario.

---

## Exportaciones Centralizadas

Todos los contexts se pueden importar desde un solo archivo:

```tsx
import {
  useAuth,
  useProfile,
  useCategories,
  useProfessionals,
  useBookings,
  useChats,
  useFavorites,
  useNotifications,
  useSubscriptions,
} from '../contexts';
```

---

## Mejores Prácticas

1. **Siempre usar los hooks** - No acceder directamente a los contexts
2. **Manejar loading y error** - Mostrar estados apropiados en la UI
3. **Refetch cuando sea necesario** - Usar `refetch()` después de operaciones importantes
4. **Cleanup en useEffect** - Los contexts manejan la limpieza automáticamente
5. **Realtime updates** - ChatsContext y NotificationsContext tienen actualizaciones automáticas
6. **Verificar autenticación** - Siempre verificar `user` antes de fetch operations
7. **Modo actual** - En BookingsContext y screens relacionados, considerar `currentMode`

---

## Tipos TypeScript

Todos los types están exportados desde los contexts:

```tsx
import type {
  BookingStatus,
  BookingWithDetails,
  ConversationWithProfiles,
  MessageWithSender,
  NotificationType,
  Professional,
  ProfileWithProfessional,
  SubscriptionStatus,
  SubscriptionWithPlan,
} from '../contexts';
```

