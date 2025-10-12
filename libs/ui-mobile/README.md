# ui-mobile

Librería de componentes UI para React Native con NativeWind (Tailwind CSS) para la aplicación Conecteja.

## 📦 Componentes Disponibles

### Componentes Básicos
- **Button** - Botones con múltiples variantes (primary, secondary, outline, ghost, danger)
- **Input** - Campos de entrada con soporte para iconos, validación y tipos especiales
- **Text** - Componente de texto tipográfico con variantes predefinidas
- **Container** - Contenedor base con padding configurable

### Componentes de Layout
- **Card** - Tarjetas con variantes (default, outlined, elevated)
- **Divider** - Separadores horizontales y verticales
- **Spacer** - Espaciadores con tamaños predefinidos
- **Screen** - Wrapper para pantallas con SafeAreaView y ScrollView opcional

### Componentes de Display
- **Avatar** - Avatar de usuario con soporte para imágenes, iniciales y badges
- **Badge** - Insignias con múltiples variantes de color
- **Rating** - Sistema de calificación con estrellas
- **Tag** - Etiquetas/chips con soporte para iconos y eliminación

### Componentes de Feedback
- **Loading** - Indicador de carga con texto opcional
- **Modal** - Modal personalizable con posiciones (center, bottom)
- **Empty** - Estado vacío con icono, título, descripción y acción
- **Alert** - Alertas con variantes (info, success, warning, error)

### Componentes de Formulario
- **Checkbox** - Casilla de verificación
- **RadioButton** - Botón de opción
- **Switch** - Interruptor toggle

### Componentes de Navegación
- **Tabs** - Pestañas con variantes (default, pills) y badges

### Componentes Específicos de la App

#### Búsqueda y Filtros
- **SearchBar** - Barra de búsqueda con filtros
- **FilterChip** - Chip de filtro con contador

#### Profesionales
- **ProfessionalCard** - Tarjeta de profesional con avatar, rating, ubicación
- **CategoryCard** - Tarjeta de categoría de servicio
- **ServiceCard** - Tarjeta de servicio individual
- **ReviewCard** - Tarjeta de reseña con respuesta del profesional

#### Chat y Comunicación
- **ChatBubble** - Burbuja de mensaje con soporte para imágenes
- **ConversationCard** - Tarjeta de conversación en lista de chats

#### Suscripciones y Estadísticas
- **SubscriptionCard** - Tarjeta de plan de suscripción
- **StatCard** - Tarjeta de estadística con tendencias
- **BookingCard** - Tarjeta de reserva/cita

#### Utilidades
- **LocationTag** - Etiqueta de ubicación con distancia
- **PriceTag** - Etiqueta de precio con período
- **VerificationBadge** - Badge de verificación
- **ImageGallery** - Galería de imágenes con vista completa

## 🚀 Uso

```tsx
/** @jsxImportSource nativewind */
import React from 'react';
import { 
  Button, 
  Input, 
  Card, 
  ProfessionalCard,
  SearchBar,
  Screen 
} from '@conecteja/ui-mobile';

function MyScreen() {
  return (
    <Screen scrollable>
      <SearchBar 
        placeholder="Buscar profesionales"
        showFilter
        onFilterPress={() => {}}
      />
      
      <ProfessionalCard
        name="Juan Pérez"
        category="Plomero"
        rating={4.5}
        reviewCount={23}
        distance={2.5}
        isPremium
        isVerified
        onPress={() => {}}
      />
      
      <Button variant="primary" onPress={() => {}}>
        Ver Perfil
      </Button>
    </Screen>
  );
}
```

## 🎨 Personalización

Todos los componentes aceptan la prop `className` para personalización adicional con clases de Tailwind:

```tsx
<Button className="mt-4 shadow-xl" variant="primary">
  Mi Botón
</Button>
```

## 📝 Nota Importante

**Cada archivo de componente debe iniciar con:**
```tsx
/** @jsxImportSource nativewind */
```

Esto es necesario para que NativeWind funcione correctamente con JSX.

## 🧪 Testing

```bash
nx test ui-mobile
```

## 📚 Recursos

- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Native](https://reactnative.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
