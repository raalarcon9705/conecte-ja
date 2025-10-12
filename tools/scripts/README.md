# Scripts de Desarrollo

Este directorio contiene scripts útiles para el desarrollo y mantenimiento de la aplicación.

## 🌱 seed-database.ts

Script para poblar la base de datos con datos de prueba.

### Requisitos

1. Tener una instancia de Supabase configurada
2. Archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
```

**Nota**: El `SUPABASE_SERVICE_ROLE` es la clave con permisos de administrador. **Nunca** la expongas en el frontend.

### Uso

```bash
# Ejecutar el script de seed
pnpm db:seed
```

### ¿Qué crea el script?

- **8 Categorías** de servicios (Plomería, Electricidad, Carpintería, etc.)
- **20 Clientes** de prueba
- **30 Profesionales** de prueba
- **Perfiles profesionales** con información completa
- **Servicios** ofrecidos por cada profesional (2-5 por profesional)
- **Suscripciones** (distribución aleatoria entre Free, Starter y Premium)
- **~150 Reseñas** (5 por profesional)
- **30 Reservas** con diferentes estados (pending, confirmed, completed, cancelled)

### Credenciales de prueba

Todos los usuarios de prueba tienen la misma contraseña:

- **Email**: `nombre.apellido{N}@example.com` (ej: `juan.garcia0@example.com`)
- **Password**: `Password123!`

### Localizações

Os usuários estão distribuídos nas seguintes cidades da Grande Florianópolis:
- Florianópolis
- São José
- Palhoça
- Biguaçu
- Santo Amaro da Imperatriz
- Governador Celso Ramos

### Notas

- El script limpia la base de datos antes de crear nuevos datos
- Usa el Service Role Key para poder crear usuarios directamente
- Los datos son completamente ficticios y generados aleatoriamente
- Las ubicaciones tienen una variación de ±0.1 grados para simular diferentes direcciones

