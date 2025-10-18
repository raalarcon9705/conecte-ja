# Database Seed Instructions

Este documento explica cómo resetear la base de datos y poblarla con datos de prueba.

## Métodos Disponibles

Hay dos formas de poblar la base de datos:

### Opción 1: SQL Seed (Recomendado para desarrollo rápido)

Datos fijos y predecibles, ideal para testing.

```bash
# 1. Reset de la base de datos y aplicar todas las migraciones
npx supabase db reset

# 2. Ejecutar el seed SQL
npx supabase db execute -f supabase/seed.sql
```

**Usuarios creados:**
- `maria.silva@example.com` - Professional (Plomera) ⭐
- `joao.santos@example.com` - Professional (Electricista) ⭐
- `julia.ferreira@example.com` - Professional (Limpieza) ⭐
- `ana.oliveira@example.com` - Cliente
- `pedro.costa@example.com` - Cliente

**Password para todos:** `Password123!`

**Datos incluidos:**
- 8 Categorías
- 5 Usuarios (todos con perfil dual cliente+profesional)
- 5 Job Postings

### Opción 2: TypeScript Seed (Recomendado para datos masivos)

Genera datos aleatorios pero consistentes, ideal para testing con volumen.

```bash
# 1. Reset de la base de datos (esto ejecuta todas las migraciones automáticamente)
npx supabase db reset

# 2. Ejecutar el seed de TypeScript
npx run mobile:seed-database
# O directamente:
npx tsx tools/scripts/seed-database.ts
```

**Datos generados:**
- 8 Categorías
- 50 Usuarios (20 clientes + 30 profesionales)
- Todos con perfil dual (cliente + profesional)
- Emails formato: `nombre.apellido@example.com`
- Password para todos: `Password123!`
- ~20 Job Postings
- ~250 Reviews
- ~30 Bookings
- Subscripciones
- Servicios profesionales

## Proceso Completo de Reset

### Paso a Paso

```bash
# 1. Reset completo de la BD (borra todo y aplica migraciones)
npx supabase db reset

# 2a. Opción SQL: Seed con datos fijos
npx supabase db execute -f supabase/seed.sql

# 2b. Opción TS: Seed con datos masivos
npx run mobile:seed-database
```

### Solo Aplicar Migraciones Nuevas

Si solo quieres aplicar migraciones nuevas sin borrar datos:

```bash
npx supabase db push
```

## Verificar Estado de la BD

```bash
# Ver el estado de las migraciones
npx supabase migration list

# Ver diff con la BD remota
npx supabase db diff

# Abrir el Studio para ver los datos
npx supabase start
# Luego ir a: http://localhost:54323
```

## Comandos de Utilidad

### Crear nueva migración

```bash
npx supabase db diff nombre_de_la_migracion
```

### Generar tipos de TypeScript

```bash
npx supabase gen types typescript --local > libs/shared/types/src/lib/database.types.ts
```

### Conectar a la base de datos local

```bash
npx supabase db psql
```

## Datos de Prueba (seed.sql)

### Categorías
1. Plomería
2. Electricidad  
3. Carpintería
4. Limpieza
5. Pintura
6. Jardinería
7. Cerrajería
8. Aire Acondicionado

### Usuarios

| Email | Tipo | Categoría | Descripción |
|-------|------|-----------|-------------|
| maria.silva@example.com | Professional | Plomería | 10 años exp, 4.8⭐, 45 reviews |
| joao.santos@example.com | Professional | Electricidad | 8 años exp, 4.7⭐, 38 reviews |
| julia.ferreira@example.com | Professional | Limpieza | 5 años exp, 4.9⭐, 67 reviews |
| ana.oliveira@example.com | Cliente | - | Usuario cliente |
| pedro.costa@example.com | Cliente | - | Usuario cliente |

### Job Postings

1. **Reparación de fuga** (Ana → Plomería)
   - Budget: R$ 100-200
   - Inicio: +3 días

2. **Instalación de ventiladores** (Pedro → Electricidad)
   - Budget: R$ 150-250
   - Inicio: +5 días

3. **Limpieza profunda** (Ana → Limpieza)
   - Budget: Negotiable

4. **Pintura de habitaciones** (Pedro → Pintura)
   - Budget: R$ 300-500
   - Inicio: +7 días

5. **Armario a medida** (Ana → Carpintería)
   - Budget: R$ 800-1200
   - Inicio: +10 días

## Troubleshooting

### Error: "relation already exists"

```bash
# Reset completo
npx supabase db reset
```

### Error: "permission denied"

```bash
# Asegúrate de tener los permisos correctos
# Verifica las variables de entorno
cat .env | grep SUPABASE
```

### La migración no se aplica

```bash
# Ver estado de migraciones
npx supabase migration list

# Forzar reset
npx supabase db reset --linked
```

### Seed SQL falla

```bash
# Verifica que todas las migraciones se aplicaron
npx supabase migration list

# Re-ejecuta el reset y seed
npx supabase db reset
npx supabase db execute -f supabase/seed.sql
```

## Notas Importantes

1. **Dual Account System**: TODOS los usuarios tienen perfil de cliente Y profesional
2. **Default Mode**: El campo `default_mode` determina qué vista ven primero
3. **Cambio de Modo**: Los usuarios pueden cambiar entre cliente/profesional en cualquier momento
4. **Passwords**: Todos los usuarios de prueba usan `Password123!`
5. **Emails**: Los emails siempre terminan en `@example.com`

## Scripts Relacionados

- `seed-database.ts` - Seed masivo con datos aleatorios
- `seed.sql` - Seed con datos fijos y predecibles
- Migraciones en `supabase/migrations/`

