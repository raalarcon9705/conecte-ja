# 📋 Plan de Implementación - App de Servicios Profesionales

## 🗂️ Estructura de Carpetas

```
conecteja/                                 # Monorepo Nx
│
├── apps/                                  # Aplicaciones
│   │
│   ├── mobile/                            # App React Native con Expo
│   │   ├── src/
│   │   │   ├── app/                       # App Router de Expo
│   │   │   ├── components/
│   │   │   │   ├── common/                # Componentes reutilizables
│   │   │   │   ├── professional/          # Componentes de profesionales
│   │   │   │   ├── chat/                  # Componentes de chat
│   │   │   │   └── subscription/          # Componentes de planes
│   │   │   ├── screens/
│   │   │   │   ├── auth/                  # Login, registro, onboarding
│   │   │   │   ├── home/                  # Búsqueda y listado
│   │   │   │   ├── profile/               # Perfil de usuario
│   │   │   │   ├── professional/          # Detalles del profesional
│   │   │   │   ├── chat/                  # Sistema de mensajería
│   │   │   │   ├── bookings/              # Reservas y agenda
│   │   │   │   ├── premium/               # Suscripciones
│   │   │   │   └── settings/              # Configuraciones
│   │   │   ├── navigation/                # Navegación
│   │   │   ├── hooks/                     # Custom hooks
│   │   │   ├── contexts/                  # Context providers
│   │   │   └── services/                  # Servicios específicos mobile
│   │   │       ├── location/              # Geolocalización
│   │   │       ├── payment/               # Integración de pagos
│   │   │       ├── notifications/         # Push notifications
│   │   │       └── whatsapp/              # Deep links WhatsApp
│   │   ├── assets/
│   │   │   ├── fonts/                     # Fuentes
│   │   │   └── images/                    # Imágenes
│   │   ├── android/                       # Configuración Android
│   │   ├── ios/                           # Configuración iOS
│   │   ├── app.json
│   │   └── project.json                   # Configuración Nx
│   │
│   ├── admin/                             # Panel Admin Next.js
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/               # Páginas de autenticación
│   │   │   │   ├── api/                  # API Routes
│   │   │   │   ├── dashboard/            # Dashboard principal
│   │   │   │   ├── usuarios/             # Gestión de usuarios
│   │   │   │   ├── profissionais/        # Gestión de profesionales
│   │   │   │   ├── categorias/           # Gestión de categorías
│   │   │   │   ├── assinaturas/          # Gestión de suscripciones
│   │   │   │   ├── relatorios/           # Reportes y estadísticas
│   │   │   │   └── configuracoes/        # Configuración del sistema
│   │   │   ├── components/
│   │   │   │   ├── charts/               # Gráficos y estadísticas
│   │   │   │   ├── tables/               # Tablas de datos
│   │   │   │   └── forms/                # Formularios
│   │   │   └── lib/                      # Utilidades
│   │   ├── public/
│   │   ├── specs/                        # Tests
│   │   └── project.json                  # Configuración Nx
│   │
│   └── admin-e2e/                        # Tests E2E del admin
│       ├── src/
│       │   ├── e2e/
│       │   ├── fixtures/
│       │   └── support/
│       └── project.json
│
├── libs/                                  # Librerías compartidas
│   │
│   ├── shared/                            # Código compartido
│   │   ├── types/                         # TypeScript types
│   │   │   └── src/lib/                   # Definiciones de tipos
│   │   ├── constants/                     # Constantes
│   │   │   └── src/lib/                   # Constantes de la app
│   │   └── utils/                         # Utilidades
│   │       └── src/lib/                   # Funciones utilitarias
│   │
│   ├── supabase/                          # Cliente Supabase
│   │   ├── src/lib/
│   │   │   ├── client.ts                  # Cliente Supabase
│   │   │   ├── auth/                      # Autenticación
│   │   │   ├── database/                  # Queries DB
│   │   │   ├── storage/                   # Storage
│   │   │   └── realtime/                  # Realtime subscriptions
│   │   └── project.json
│   │
│   ├── ui-mobile/                         # Componentes UI Mobile
│   │   ├── src/lib/
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── input/
│   │   │   └── ...                        # Otros componentes
│   │   └── project.json
│   │
│   └── ui-web/                            # Componentes UI Web
│       ├── src/lib/
│       │   ├── button/
│       │   ├── card/
│       │   ├── input/
│       │   └── ...                        # Otros componentes
│       └── project.json
│
├── supabase/                              # (Pendiente) Configuración Supabase
│   ├── migrations/                        # Migraciones SQL
│   ├── functions/                         # Edge Functions
│   │   ├── reset-weekly-contacts/        # Resetear contactos semanales
│   │   ├── send-notification/            # Enviar notificaciones
│   │   ├── verify-subscription/          # Verificar suscripción
│   │   └── generate-stats/               # Generar estadísticas
│   └── seed/                              # Datos iniciales
│
├── docs/                                  # Documentación
│   ├── business.md                        # Plan de negocio
│   ├── architecture.md                    # (Pendiente)
│   ├── database-schema.md                 # (Pendiente)
│   ├── api-endpoints.md                   # (Pendiente)
│   ├── deployment.md                      # (Pendiente)
│   └── legal/                             # (Pendiente)
│       ├── termos-de-uso.md
│       ├── politica-privacidade.md
│       └── lgpd-compliance.md
│
├── tools/                                 # Herramientas y scripts
│   └── scripts/                           # Scripts de automatización
│       ├── setup.sh                       # (Pendiente)
│       ├── deploy.sh                      # (Pendiente)
│       └── backup.sh                      # (Pendiente)
│
├── nx.json                                # Configuración Nx
├── package.json                           # Dependencias root
├── pnpm-workspace.yaml                    # Workspace PNPM
├── tsconfig.base.json                     # TypeScript base config
└── README.md                              # Documentación principal
```

---

## 📅 Plan de Implementación (16 Semanas)

### **FASE 1: Preparación y Setup (Semanas 1-2)**

#### Semana 1: Configuración Inicial
- **Día 1-2**: Setup del proyecto React Native con Expo/CLI
  - Configurar TypeScript
  - Instalar dependencias base
  - Configurar ESLint y Prettier
  
- **Día 3-4**: Configuración de Supabase
  - Crear proyecto en Supabase
  - Diseñar schema de base de datos
  - Crear tablas principales (users, profiles, professional_profiles)
  - Configurar Row Level Security (RLS)
  
- **Día 5**: Setup del Panel Administrativo
  - Crear proyecto Next.js
  - Configurar conexión con Supabase
  - Setup de autenticación admin

#### Semana 2: Infraestructura Base
- **Día 1-2**: Configuración de servicios externos
  - Google Maps API / Mapbox
  - Mercado Pago / Stripe (sandbox)
  - Firebase/Expo para notificaciones
  
- **Día 3-4**: Estructura de navegación
  - Configurar React Navigation
  - Crear navegación básica (Auth, Main, Tabs)
  - Implementar splash screen
  
- **Día 5**: Documentación legal
  - Redactar Términos de Uso
  - Redactar Política de Privacidad (LGPD)
  - Crear pantallas de consentimiento

---

### **FASE 2: Módulo de Autenticación (Semanas 3-4)**

#### Semana 3: Sistema de Autenticación
- **Día 1-2**: Registro y Login
  - Pantalla de onboarding
  - Registro con email/password
  - Login con email/password
  - Validación de formularios
  
- **Día 3-4**: Autenticación Social
  - Login con Google
  - Login con Apple (iOS)
  - Manejo de sesiones
  
- **Día 5**: Recuperación de contraseña
  - Reset password flow
  - Verificación de email

#### Semana 4: Perfiles de Usuario
- **Día 1-3**: Creación de perfiles
  - Selección de tipo de usuario (Cliente/Profesional)
  - Formulario de información básica
  - Upload de foto de perfil
  - Selección de categoría (para profesionales)
  
- **Día 4-5**: Edición de perfil
  - Pantalla de editar perfil
  - Validaciones
  - Integración con Supabase Storage

---

### **FASE 3: Módulo de Geolocalización y Búsqueda (Semanas 5-6)**

#### Semana 5: Geolocalización
- **Día 1-2**: Implementar servicio de ubicación
  - Solicitar permisos de ubicación
  - Obtener ubicación actual del usuario
  - Guardar ubicación del profesional
  
- **Día 3-5**: Mapa de profesionales
  - Integrar Google Maps/Mapbox
  - Mostrar profesionales en el mapa
  - Calcular distancias
  - Filtrar por radio de búsqueda

#### Semana 6: Sistema de Búsqueda
- **Día 1-2**: Búsqueda básica
  - Barra de búsqueda
  - Filtros por categoría
  - Filtros por distancia
  
- **Día 3-4**: Lista de profesionales
  - Card de profesional
  - Lista con scroll infinito
  - Ordenamiento (distancia, rating, precio)
  
- **Día 5**: Favoritos
  - Marcar profesionales favoritos
  - Lista de favoritos

---

### **FASE 4: Módulo de Perfiles Profesionales (Semana 7)**

#### Semana 7: Detalles del Profesional
- **Día 1-2**: Pantalla de detalles
  - Información completa del profesional
  - Galería de fotos/portafolio
  - Servicios ofrecidos
  - Horarios disponibles
  
- **Día 3-4**: Sistema de reseñas
  - Mostrar reseñas y calificaciones
  - Formulario de reseña (post-servicio)
  - Cálculo de rating promedio
  
- **Día 5**: Verificación
  - Badge de verificación
  - Pantalla de verificación (subir documentos)
  - Estado de verificación

---

### **FASE 5: Módulo de Comunicación (Semanas 8-9)**

#### Semana 8: Chat Interno
- **Día 1-3**: Sistema de chat básico
  - Lista de conversaciones
  - Pantalla de chat 1-a-1
  - Envío/recepción de mensajes en tiempo real (Supabase Realtime)
  - Indicadores de lectura
  
- **Día 4-5**: Multimedia en chat
  - Envío de imágenes (solo Premium)
  - Envío de ubicación (solo Premium)
  - Previsualización de imágenes

#### Semana 9: Integración WhatsApp
- **Día 1-2**: Deep links a WhatsApp
  - Botón "Contactar por WhatsApp" (solo Premium)
  - Generar mensaje predefinido
  - Validación de plan Premium
  
- **Día 3-4**: Gestión de contactos
  - Sistema de créditos (plan Free: 3/semana)
  - Contador de contactos
  - Reset semanal automático
  
- **Día 5**: Notificaciones
  - Notificaciones push de mensajes
  - Notificaciones de nuevos contactos

---

### **FASE 6: Módulo de Reservas (Semana 10)**

#### Semana 10: Sistema de Agenda
- **Día 1-2**: Calendario del profesional
  - Configurar disponibilidad horaria
  - Bloquear fechas/horarios
  - Vista de agenda
  
- **Día 3-4**: Reservas de cliente
  - Selección de fecha y hora
  - Confirmación de reserva
  - Estado de reservas (pendiente, confirmada, completada)
  
- **Día 5**: Recordatorios
  - Notificaciones de recordatorio (24h antes)
  - Cancelación de reservas
  - Reprogramación

---

### **FASE 7: Módulo de Pagos y Suscripciones (Semanas 11-12)**

#### Semana 11: Integración de Pagos
- **Día 1-2**: Setup Mercado Pago/Stripe
  - Configurar SDK
  - Crear producto de suscripción
  - Webhooks para validación
  
- **Día 3-4**: Flujo de pago
  - Pantalla de planes (Free, Starter, Premium)
  - Comparación de características
  - Proceso de checkout
  
- **Día 5**: Validación de suscripción
  - Verificar estado de suscripción
  - Restricciones por plan
  - Expiración y renovación

#### Semana 12: Gestión de Suscripciones
- **Día 1-2**: Panel de suscripción
  - Ver plan actual
  - Historial de pagos
  - Facturas
  
- **Día 3-4**: Cambio de planes
  - Upgrade/downgrade
  - Cancelación
  - Reembolsos
  
- **Día 5**: Edge Functions
  - Verificar suscripción (cron job)
  - Resetear contactos semanales
  - Enviar recordatorios de pago

---

### **FASE 8: Módulo Premium y Estadísticas (Semana 13)**

#### Semana 13: Funcionalidades Premium
- **Día 1-2**: Dashboard del profesional
  - Métricas de perfil (visitas, contactos)
  - Gráficos de actividad
  - Estadísticas de conversión
  
- **Día 3-4**: Destaque en búsquedas
  - Badge "Profissional Premium"
  - Posicionamiento en resultados
  - Algoritmo de ranking
  
- **Día 5**: Soporte prioritario
  - Chat de soporte
  - Formulario de contacto
  - Centro de ayuda

---

### **FASE 9: Panel Administrativo (Semanas 14-15)**

#### Semana 14: Dashboard Admin
- **Día 1-2**: Dashboard principal
  - Métricas generales (usuarios, ingresos, actividad)
  - Gráficos de crecimiento
  - KPIs principales
  
- **Día 3-4**: Gestión de usuarios
  - Listar usuarios/profesionales
  - Ver detalles de perfil
  - Suspender/activar usuarios
  - Verificar profesionales manualmente
  
- **Día 5**: Gestión de categorías
  - CRUD de categorías
  - Activar/desactivar categorías
  - Estadísticas por categoría

#### Semana 15: Administración Avanzada
- **Día 1-2**: Gestión de suscripciones
  - Ver todas las suscripciones activas
  - Historial de pagos
  - Cancelar/extender suscripciones
  
- **Día 3-4**: Reportes
  - Reporte de ingresos
  - Reporte de actividad
  - Exportar a CSV/PDF
  
- **Día 5**: Moderación
  - Revisar reseñas reportadas
  - Moderar contenido inapropiado
  - Sistema de reportes

---

### **FASE 10: Testing y Optimización (Semana 16)**

#### Semana 16: QA y Launch
- **Día 1-2**: Testing exhaustivo
  - Testing funcional de todos los módulos
  - Testing de flujos completos
  - Testing en dispositivos reales (Android/iOS)
  - Verificar restricciones por plan
  
- **Día 3**: Optimización
  - Optimizar consultas a base de datos
  - Optimizar imágenes y assets
  - Implementar caché
  - Performance testing
  
- **Día 4**: Preparación de lanzamiento
  - Configurar ambiente de producción
  - Migrar base de datos
  - Configurar dominios
  - Setup de monitoring (Sentry, Analytics)
  
- **Día 5**: Lanzamiento Beta
  - Deploy en stores (TestFlight, Google Play Beta)
  - Onboarding de primeros usuarios
  - Monitoreo de bugs

---

## 🎯 Entregables por Fase

### MVP (Semanas 1-10)
- ✅ Autenticación completa
- ✅ Perfiles de usuario
- ✅ Búsqueda por geolocalización
- ✅ Chat interno básico
- ✅ Sistema de reservas básico
- ✅ Plan gratuito funcional

### Beta Pública (Semanas 11-15)
- ✅ Sistema de pagos integrado
- ✅ Planes Premium activos
- ✅ Estadísticas para profesionales
- ✅ Panel administrativo completo
- ✅ WhatsApp integration

### Producción (Semana 16+)
- ✅ App optimizada y testeada
- ✅ Documentación completa
- ✅ Compliance legal (LGPD)
- ✅ Monitoring y analytics
- ✅ Soporte técnico

---

## 🔧 Stack Tecnológico Detallado

### Frontend Mobile
- React Native (0.81+)
- Expo (SDK 54+)
- TypeScript
- Expo Router (File-based routing)
- React Query / TanStack Query
- Zustand (state management)
- React Hook Form + Zod (validación)
- NativeWind (Tailwind para React Native)

### Backend
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Supabase Edge Functions (Deno)

### Servicios Externos
- Google Maps API / Mapbox
- Mercado Pago SDK / Stripe
- Expo Push Notifications / Firebase Cloud Messaging
- Cloudinary (optional para optimización de imágenes)

### Panel Admin
- Next.js 15 (App Router)
- Shadcn/ui
- Recharts (gráficos)
- TailwindCSS

### DevOps
- GitHub Actions (CI/CD)
- Expo EAS Build
- Vercel (panel admin)
- Supabase Cloud
- Nx Cloud (caché de builds)

---

## 📊 Métricas de Éxito

### Técnicas
- Tiempo de carga < 2 segundos
- Crash rate < 1%
- App size < 50MB
- Battery consumption optimizado

### Negocio
- 100 profesionales en primer mes
- 500 usuarios activos en 3 meses
- 10% conversión a Premium
- Rating > 4.5 estrellas

---

## 📍 Sistema de Geolocalización y Privacidad

### Estrategia de Ubicación Aproximada

Para proteger la privacidad de los clientes, implementaremos un sistema de ubicación aproximada hasta que se concrete el servicio:

#### **Antes de cerrar el servicio:**
- Mostrar solo ubicación aproximada en el mapa
- Redondear coordenadas a 2-3 decimales (precisión ~100-1000m)
- Mostrar área circular o polígono del barrio
- Solo indicar zona/barrio sin dirección exacta

#### **Después de cerrar/confirmar el servicio:**
- Revelar dirección completa
- Mostrar botones para abrir en apps de navegación:
  - **Apps de transporte:** Uber, 99Taxi
  - **Apps de mapas:** Waze, Google Maps, Apple Maps
  - **Fallback web:** Para usuarios sin apps instaladas

### Deep Links para Navegación

```typescript
// Estructura de deep links por plataforma
const navigationApps = {
  // Apps de transporte
  uber: `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`,
  '99taxi': `99taxi://routeRequest?destiny=${lat},${lng}`,

  // Apps de mapas
  waze: `waze://?ll=${lat},${lng}&navigate=yes`,
  googleMaps: Platform.OS === 'ios'
    ? `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`
    : `google.navigation:q=${lat},${lng}`,
  appleMaps: `maps://?daddr=${lat},${lng}`,

  // Fallbacks web (si no tienen la app instalada)
  googleMapsWeb: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  wazeWeb: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
};
```

### Mapas Recomendados (Sin Costo)

#### **1. OpenStreetMap + React Native Maps (RECOMENDADO)**
- ✅ **Completamente gratuito**
- ✅ Sin límites de requests
- ✅ Datos abiertos
- ✅ Buen soporte en LATAM
- ⚠️ Requiere servidor de tiles propio o usar tiles gratuitos
- **Tiles gratuitos:** `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Librería:** `react-native-maps` (soporta OSM)

#### **2. Mapbox (Plan Gratuito)**
- ✅ 50,000 map loads/mes gratis
- ✅ 100,000 geocoding requests/mes
- ✅ Excelente rendimiento
- ✅ Mapas offline
- ⚠️ Requiere registro con tarjeta (pero no cobra sin autorización)
- **Ideal para:** MVP y escalar gradualmente

#### **3. Google Maps Platform (Créditos Gratuitos)**
- ✅ $200 USD/mes en créditos gratis
- ✅ ~28,000 map loads/mes
- ✅ Mejor cobertura en Brasil
- ⚠️ Requiere tarjeta de crédito
- **Ideal para:** Producción con tráfico moderado

#### **4. Nominatim (Geocoding Gratuito)**
- ✅ Completamente gratis
- ✅ Basado en OpenStreetMap
- ✅ Sin límite de requests totales
- ⚠️ Límite: 1 request/segundo
- **Usar para:** Convertir direcciones a coordenadas

### Implementación Recomendada

```typescript
// Fase 1: MVP (Sin costo)
- Mapas: OpenStreetMap + react-native-maps
- Geocoding: Nominatim (1 req/seg)
- Tiles: OSM tiles públicos

// Fase 2: Crecimiento
- Mapas: Mapbox (50k loads/mes gratis)
- Geocoding: Mapbox (100k/mes gratis)
- Fallback: Nominatim

// Fase 3: Producción
- Mapas: Google Maps ($200/mes gratis)
- Geocoding: Google Geocoding
- Backup: Mapbox
```

### Algoritmo de Privacidad

```typescript
// Función para aproximar ubicación
function approximateLocation(lat: number, lng: number, precision: number = 2): {
  approximate: { lat: number; lng: number };
  radius: number;
} {
  return {
    approximate: {
      lat: parseFloat(lat.toFixed(precision)),
      lng: parseFloat(lng.toFixed(precision))
    },
    radius: precision === 2 ? 1000 : 100 // metros
  };
}

// Estados de visibilidad de ubicación
enum LocationPrivacy {
  HIDDEN = 'hidden',           // No mostrar ubicación
  APPROXIMATE = 'approximate', // Mostrar área aproximada (default)
  EXACT = 'exact'             // Mostrar dirección exacta (post-booking)
}
```

### Costos Estimados (Escenario Real)

Asumiendo **10,000 usuarios activos/mes**:

| Servicio | Loads/Usuario | Total Loads | Costo Mensual |
|----------|---------------|-------------|---------------|
| **OSM** | Ilimitado | Ilimitado | **$0** |
| **Mapbox** | 5 loads | 50,000 | **$0** (dentro del plan) |
| **Google Maps** | 5 loads | 50,000 | **$0** (dentro de créditos) |

**Conclusión:** Con hasta 10k usuarios, no pagarías nada en mapas. 🎉

---