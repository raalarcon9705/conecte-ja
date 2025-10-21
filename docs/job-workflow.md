# 📋 Flujo de Trabajos y Aceptación de Profesionales

## 📖 Índice

1. [Visión General](#visión-general)
2. [Flujo Completo del Sistema](#flujo-completo-del-sistema)
3. [Estados del Trabajo](#estados-del-trabajo)
4. [Sistema de Ubicación](#sistema-de-ubicación)
5. [Aceptación de Profesional](#aceptación-de-profesional)
6. [Integración con Calendario](#integración-con-calendario)
7. [Especificaciones Técnicas](#especificaciones-técnicas)
8. [Casos de Uso](#casos-de-uso)

---

## 🎯 Visión General

El sistema de trabajos permite que los **clientes** publiquen trabajos y los **profesionales** apliquen a ellos. El flujo garantiza que:

- ✅ Solo profesionales pueden aplicar a trabajos
- ✅ La conversación requiere haber aplicado primero
- ✅ Solo el cliente puede aceptar al profesional
- ✅ La ubicación exacta solo se revela al profesional aceptado
- ✅ El trabajo se cierra automáticamente al aceptar un profesional
- ✅ Se crea un evento en el calendario automáticamente

---

## 🔄 Flujo Completo del Sistema

### 1️⃣ Cliente Publica un Trabajo

**Pantalla**: `apps/mobile/src/screens/jobs/CreateJobScreen.tsx`

```typescript
// El cliente crea un trabajo con:
const jobData = {
  client_profile_id: user.id,
  title: "Necesito electricista urgente",
  description: "Reparar instalación eléctrica...",
  location_city: "São Paulo",
  location_latitude: -23.5505,     // Coordenadas exactas
  location_longitude: -46.6333,    // Se guardan, pero no se revelan
  budget_min: 100.00,
  budget_max: 200.00,
  budget_type: 'hourly',
  start_date: '2025-10-25',
  status: 'open',                  // Estado inicial
  expires_at: Date.now() + 30 days
}
```

**Base de Datos**:
- Tabla: `job_postings`
- Estado: `'open'`
- `selected_professional_id`: `null`

---

### 2️⃣ Profesional Ve el Trabajo

**Pantalla**: `apps/mobile/src/screens/jobs/JobsListScreen.tsx` → `JobDetailScreen.tsx`

El profesional puede:
- ✅ Ver información completa del trabajo
- ✅ Ver ubicación **aproximada** (círculo de ~1km)
- ✅ Dar like/dislike al trabajo
- ✅ Aplicar al trabajo

**Ubicación Mostrada**:
```typescript
// En JobDetailScreen.tsx línea 262
const showLocation = isOwner || hasApplied;

// Ubicación aproximada para NO aplicados
<LocationMap
  latitude={job.location_latitude}
  longitude={job.location_longitude}
  privacy={showLocation ? LocationPrivacy.EXACT : LocationPrivacy.APPROXIMATE}
  radius={1000}  // Círculo de 1km
/>
```

---

### 3️⃣ Profesional Aplica al Trabajo

**Pantalla**: `apps/mobile/src/screens/jobs/JobApplyScreen.tsx`

```typescript
// El profesional envía una aplicación
const applicationData = {
  job_posting_id: jobId,
  professional_profile_id: professionalProfile.id,
  cover_letter: "Tengo 10 años de experiencia...",
  proposed_price: 150.00,
  status: 'pending'  // Estado inicial
}
```

**Base de Datos**:
- Tabla: `job_applications`
- Estado: `'pending'`
- Trigger: Incrementa `applications_count` en `job_postings`

**Después de Aplicar**:
- ✅ El profesional ahora ve la ubicación **exacta**
- ✅ Aparece botón "Contactar Cliente"

---

### 4️⃣ Profesional Inicia Conversación

**Pantalla**: `apps/mobile/src/screens/jobs/JobDetailScreen.tsx` (líneas 210-247)

```typescript
// Solo disponible si hasApplied === true
const handleContactClient = async () => {
  // Crear o obtener conversación (requiere job_id)
  const conversationId = await createOrGetConversation(
    job.client_profile_id,  // profiles.id del cliente
    user.id,                // profiles.id del profesional
    jobId                   // REQUERIDO: vincula conversación al trabajo
  );

  // Navegar al chat
  navigation.navigate('ChatDetail', { conversationId });
}
```

**Base de Datos**:
- Tabla: `conversations`
- Campos obligatorios:
  - `client_profile_id`
  - `professional_profile_id`
  - `job_id` (NOT NULL - vincula la conversación al trabajo)
- Constraint único: `(client_profile_id, professional_profile_id, job_id)`

**Regla de Negocio**:
- ⛔ **No se puede crear conversación sin job_id**
- ⛔ **No se puede chatear sin haber aplicado primero**

---

### 5️⃣ Cliente y Profesional Conversan

**Contexto**: `apps/mobile/src/contexts/ChatsContext.tsx`

Ambos pueden:
- Intercambiar mensajes en tiempo real
- Ver el historial de mensajes
- El cliente ve las aplicaciones del profesional

---

### 6️⃣ Cliente Acepta al Profesional

**⚠️ FUNCIONALIDAD A IMPLEMENTAR**

#### Opción A: Desde el Chat (RECOMENDADO)

**Pantalla**: `apps/mobile/src/screens/chat/ChatDetailScreen.tsx`

Agregar un banner/botón en el chat:

```typescript
// Banner en la parte superior del chat
{currentConversation?.job_id && !job?.selected_professional_id && isClient && (
  <View className="bg-blue-50 p-4 border-b border-blue-200">
    <Text variant="body" weight="semibold" className="mb-2">
      ¿Quieres contratar a {professionalName}?
    </Text>
    <Button
      variant="primary"
      size="sm"
      onPress={() => handleAcceptProfessional()}
    >
      Aceptar y Cerrar Trabajo
    </Button>
  </View>
)}

// Función de aceptación
const handleAcceptProfessional = async () => {
  try {
    // 1. Obtener información de la conversación y aplicación
    const { data: conversation } = await supabase
      .from('conversations')
      .select('job_id, professional_profile_id')
      .eq('id', conversationId)
      .single();

    const { data: application } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_posting_id', conversation.job_id)
      .eq('professional_profile_id', conversation.professional_profile_id)
      .single();

    // 2. Actualizar el trabajo (cerrar y asignar profesional)
    const { error: jobError } = await supabase
      .from('job_postings')
      .update({
        selected_professional_id: conversation.professional_profile_id,
        selected_at: new Date().toISOString(),
        status: 'in_progress'  // Cambia de 'open' a 'in_progress'
      })
      .eq('id', conversation.job_id);

    if (jobError) throw jobError;

    // 3. Actualizar la aplicación aceptada
    const { error: appError } = await supabase
      .from('job_applications')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', application.id);

    if (appError) throw appError;

    // 4. Rechazar automáticamente otras aplicaciones
    await supabase
      .from('job_applications')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })
      .eq('job_posting_id', conversation.job_id)
      .neq('id', application.id)
      .eq('status', 'pending');

    // 5. Crear evento en el calendario (bookings)
    const { data: jobData } = await supabase
      .from('job_postings')
      .select('*, profiles!job_postings_client_profile_id_fkey(*)')
      .eq('id', conversation.job_id)
      .single();

    await supabase
      .from('bookings')
      .insert({
        client_profile_id: jobData.client_profile_id,
        professional_profile_id: conversation.professional_profile_id,
        booking_date: jobData.start_date || new Date(),
        start_time: '09:00',  // Hora default o extraída del job
        service_name: jobData.title,
        service_description: jobData.description,
        price: jobData.budget_max || jobData.budget_min,
        location_address: jobData.location_address,
        location_latitude: jobData.location_latitude,
        location_longitude: jobData.location_longitude,
        status: 'confirmed'
      });

    // 6. Enviar mensaje de sistema en el chat
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_profile_id: user.id,
        message_type: 'system',
        content: `🎉 ${professionalName} ha sido aceptado para este trabajo. El trabajo se ha cerrado y se creó un evento en el calendario.`
      });

    // 7. Notificar al profesional
    await supabase
      .from('notifications')
      .insert({
        profile_id: conversation.professional_profile_id,
        type: 'job_accepted',
        title: '¡Felicitaciones!',
        body: `Has sido aceptado para el trabajo: ${jobData.title}`,
        action_url: `/bookings/${bookingId}`,
        action_data: { job_id: conversation.job_id }
      });

    Alert.alert(
      '¡Profesional Aceptado!',
      'Se ha creado el evento en tu calendario y el trabajo se cerró.'
    );
  } catch (error) {
    console.error('Error accepting professional:', error);
    Alert.alert('Error', 'No se pudo aceptar al profesional');
  }
}
```

#### Opción B: Desde la Lista de Aplicaciones

**Pantalla**: Nueva pantalla `ApplicationDetailScreen.tsx`

```typescript
// Ver detalles de una aplicación específica y aceptar
<Button
  variant="primary"
  onPress={() => acceptApplication(applicationId)}
>
  Aceptar Profesional
</Button>
```

---

## 📍 Sistema de Ubicación

### Estados de Privacidad

```typescript
enum LocationPrivacy {
  APPROXIMATE = 'approximate',  // Círculo difuso (~1km)
  EXACT = 'exact'               // Marcador preciso
}
```

### Reglas de Visibilidad

| Usuario | Condición | Ubicación Mostrada | Botones de Navegación |
|---------|-----------|-------------------|----------------------|
| **Cliente (owner)** | Siempre | `EXACT` | ✅ Sí |
| **Profesional aceptado** | `selected_professional_id === professionalProfile.id` | `EXACT` | ✅ Sí |
| **Profesional aplicado** | `hasApplied === true` pero NO aceptado | `APPROXIMATE` | ❌ No |
| **Profesional no aplicado** | `hasApplied === false` | `APPROXIMATE` | ❌ No |

**Estado**: ✅ **IMPLEMENTADO** - La lógica fue corregida el 21 de octubre, 2025

### Implementación Actual (JobDetailScreen.tsx)

**Archivo**: `apps/mobile/src/screens/jobs/JobDetailScreen.tsx`

```typescript
// LÍNEAS 39, 262-266 - ✅ IMPLEMENTADO CORRECTAMENTE
// 1. Obtener professionalProfile del contexto de Auth
const { user, currentMode, professionalProfile } = useAuth();

// 2. Verificar si es el profesional aceptado
const isOwner = job.client_profile_id === user?.id;
const isSelectedProfessional = job.selected_professional_id === professionalProfile?.id;
const showLocation = isOwner || isSelectedProfessional;

// LÍNEAS 362-379 - Mostrar mapa
<LocationMap
  latitude={job.location_latitude}
  longitude={job.location_longitude}
  privacy={showLocation ? LocationPrivacy.EXACT : LocationPrivacy.APPROXIMATE}
  radius={1000}
/>

{showLocation && (
  <NavigationButtons
    latitude={job.location_latitude}
    longitude={job.location_longitude}
  />
)}
```

### Botones de Navegación

**Componente**: `libs/ui-mobile/src/lib/NavigationButtons.tsx`

Abre la ubicación en:
- **Uber** - Para transporte al lugar
- **Waze** - Navegación GPS
- **Google Maps** - Navegación GPS
- **Apple Maps** (iOS) - Navegación nativa

```typescript
const navigationApps = {
  uber: `uber://?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`,
  waze: `waze://?ll=${lat},${lng}&navigate=yes`,
  googleMaps: `google.navigation:q=${lat},${lng}`,
  appleMaps: `maps://?daddr=${lat},${lng}`
}
```

---

## 🎯 Estados del Trabajo

```typescript
type JobStatus =
  | 'open'        // Publicado, aceptando aplicaciones
  | 'in_progress' // Profesional aceptado, trabajo en curso
  | 'completed'   // Trabajo finalizado
  | 'canceled'    // Cancelado por el cliente
  | 'expired';    // Expiró sin recibir aplicaciones

// Transiciones de estado
'open' → 'in_progress'  // Cuando se acepta a un profesional
'in_progress' → 'completed'  // Cuando se marca como completado
'open' → 'canceled'     // Si el cliente cancela
'open' → 'expired'      // Si expira (trigger automático)
```

### Visibilidad del Trabajo

```typescript
// Trabajos visibles en listado público
WHERE status IN ('open', 'in_progress')

// Después de aceptar profesional
// El trabajo con status = 'in_progress' NO debe aparecer en búsquedas públicas
// Solo visible para:
// - El cliente (owner)
// - El profesional aceptado
```

---

## 📅 Integración con Calendario

### Tabla: bookings

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  client_profile_id UUID REFERENCES profiles(id),
  professional_profile_id UUID REFERENCES professional_profiles(id),

  -- Fecha y hora
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration_minutes INTEGER,

  -- Servicio
  service_name VARCHAR(255),
  service_description TEXT,
  price DECIMAL(10, 2),

  -- Ubicación (copiada del job)
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),

  -- Estado
  status VARCHAR(20) DEFAULT 'confirmed',

  -- Referencia al trabajo original (opcional, para trazabilidad)
  source_job_id UUID REFERENCES job_postings(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Crear Evento Automáticamente

```typescript
// Al aceptar al profesional
const createBookingFromJob = async (
  jobId: string,
  professionalProfileId: string
) => {
  // 1. Obtener datos del trabajo
  const { data: job } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', jobId)
    .single();

  // 2. Crear booking
  const { data: booking } = await supabase
    .from('bookings')
    .insert({
      client_profile_id: job.client_profile_id,
      professional_profile_id: professionalProfileId,
      booking_date: job.start_date || new Date(),
      start_time: '09:00', // O extraer del campo schedule del job
      service_name: job.title,
      service_description: job.description,
      price: job.budget_max || job.budget_min,
      location_address: job.location_address,
      location_latitude: job.location_latitude,
      location_longitude: job.location_longitude,
      status: 'confirmed',
      source_job_id: jobId  // Trazabilidad
    })
    .select()
    .single();

  return booking;
}
```

---

## 🛠️ Especificaciones Técnicas

### 1. Actualizar JobDetailScreen.tsx

**Archivo**: `apps/mobile/src/screens/jobs/JobDetailScreen.tsx`

**Estado**: ✅ **COMPLETADO** (21 de octubre, 2025)

```typescript
// ✅ IMPLEMENTADO CORRECTAMENTE
const { user, currentMode, professionalProfile } = useAuth();

const isOwner = job.client_profile_id === user?.id;
const isSelectedProfessional = job.selected_professional_id === professionalProfile?.id;
const showLocation = isOwner || isSelectedProfessional;
```

### 2. Crear ApplicationDetailScreen.tsx

**Archivo**: `apps/mobile/src/screens/jobs/ApplicationDetailScreen.tsx`

```typescript
// Nueva pantalla para ver detalles de una aplicación
export default function ApplicationDetailScreen({ route, navigation }) {
  const { applicationId } = route.params;

  // Ver:
  // - Datos del profesional
  // - Cover letter
  // - Precio propuesto
  // - Botón "Aceptar"
  // - Botón "Rechazar"
}
```

### 3. Actualizar ChatDetailScreen.tsx

**Archivo**: `apps/mobile/src/screens/chat/ChatDetailScreen.tsx`

**Agregar**:
- Banner de aceptación si es el cliente y el trabajo aún está abierto
- Función `handleAcceptProfessional()`
- Mensaje de sistema cuando se acepta

### 4. Agregar Queries RLS

**Archivo**: Nueva migración SQL

```sql
-- Ocultar trabajos cerrados de búsquedas públicas
CREATE POLICY "Only show open jobs in public searches"
  ON job_postings FOR SELECT
  USING (
    status = 'open' OR
    client_profile_id = auth.uid() OR
    selected_professional_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- Permitir al cliente actualizar selected_professional_id
CREATE POLICY "Clients can select professional for their jobs"
  ON job_postings FOR UPDATE
  USING (client_profile_id = auth.uid())
  WITH CHECK (client_profile_id = auth.uid());
```

### 5. Función Edge para Notificaciones

**Archivo**: `supabase/functions/notify-job-acceptance/index.ts`

```typescript
// Edge Function que se dispara al aceptar un profesional
Deno.serve(async (req) => {
  const { job_id, professional_id } = await req.json();

  // Enviar push notification
  await sendPushNotification(professional_id, {
    title: '¡Felicitaciones!',
    body: 'Has sido aceptado para un nuevo trabajo',
    data: { job_id }
  });

  return new Response('OK', { status: 200 });
});
```

---

## 📋 Casos de Uso

### Caso 1: Flujo Exitoso

```
1. Cliente crea trabajo → status: 'open'
2. Profesional A ve trabajo → ubicación aproximada
3. Profesional A aplica → ve ubicación exacta
4. Profesional A inicia chat → conversación vinculada al trabajo
5. Cliente acepta a Profesional A →
   - status cambia a 'in_progress'
   - selected_professional_id = Profesional A
   - Se crea evento en calendario
   - Se rechazan otras aplicaciones
   - Profesional A ve botones de navegación
6. Trabajo desaparece de búsquedas públicas
7. Profesional B (no aceptado) pierde acceso a ubicación exacta
```

### Caso 2: Cliente Cancela Trabajo

```
1. Cliente crea trabajo → status: 'open'
2. Varios profesionales aplican
3. Cliente cancela trabajo → status: 'canceled'
4. Trabajo desaparece de búsquedas
5. Aplicaciones se marcan como rechazadas
6. Se notifica a profesionales aplicados
```

### Caso 3: Trabajo Expira

```
1. Cliente crea trabajo → expires_at: 30 días
2. No recibe aplicaciones
3. Trigger automático → status: 'expired'
4. Trabajo se oculta de búsquedas
```

---

## ✅ Checklist de Implementación

### Base de Datos
- [x] Tabla `job_postings` con `selected_professional_id`
- [x] Tabla `job_applications` con estados
- [x] Tabla `conversations` con `job_id` obligatorio
- [x] Tabla `bookings` para eventos de calendario
- [ ] RLS policies para ocultar trabajos cerrados
- [ ] Trigger para auto-expirar trabajos

### Implementado ✅
- [x] **Lógica de ubicación corregida** - Solo profesional aceptado ve ubicación exacta
- [x] **AuthContext con professionalProfile** - Disponible en toda la app
- [x] **JobDetailScreen actualizado** - Usa professionalProfile del contexto

### Backend
- [ ] Edge Function para notificaciones de aceptación
- [ ] Función para crear booking desde job
- [ ] Función para rechazar aplicaciones automáticamente

### Frontend - Mobile
- [ ] Actualizar lógica de `showLocation` en JobDetailScreen
- [ ] Agregar banner de aceptación en ChatDetailScreen
- [ ] Crear ApplicationDetailScreen
- [ ] Implementar función `acceptProfessional()`
- [ ] Agregar filtro para ocultar trabajos cerrados en JobsListScreen
- [ ] Mostrar badge "Aceptado" en aplicaciones

### UI/UX
- [ ] Diseñar banner de aceptación en chat
- [ ] Mensaje de sistema al aceptar profesional
- [ ] Animación de confirmación
- [ ] Estado de carga durante aceptación

### Testing
- [ ] Test: Solo cliente puede aceptar
- [ ] Test: Trabajo se cierra al aceptar
- [ ] Test: Ubicación solo para aceptado
- [ ] Test: Booking se crea correctamente
- [ ] Test: Otras aplicaciones se rechazan

---

## 🎨 Mockups de UI

### Banner en Chat (Cliente)

```
┌─────────────────────────────────────────┐
│  💼 Trabajo: Electricista urgente       │
│                                         │
│  ¿Quieres contratar a Juan Pérez?      │
│                                         │
│  [ Aceptar y Cerrar Trabajo ]          │
└─────────────────────────────────────────┘
```

### Mensaje de Sistema (Después de Aceptar)

```
─────────────────────────────────
     🎉 SISTEMA

Juan Pérez ha sido aceptado para
este trabajo.

✅ Trabajo cerrado
✅ Evento creado en calendario
✅ Ubicación exacta compartida
─────────────────────────────────
```

---

## 📚 Referencias

- [Esquema de Base de Datos](../supabase/migrations/20251012151452_initial_database_structure.sql)
- [Sistema de Trabajos](../supabase/migrations/20251013023629_job_postings_system.sql)
- [Conversaciones con job_id](../supabase/migrations/20251021034118_add_job_id_to_conversations.sql)
- [Componente LocationMap](../libs/ui-mobile/src/lib/LocationMap.tsx)
- [Componente NavigationButtons](../libs/ui-mobile/src/lib/NavigationButtons.tsx)

---

**Última actualización**: 21 de octubre, 2025
**Versión**: 1.0
**Estado**: Pendiente de implementación
