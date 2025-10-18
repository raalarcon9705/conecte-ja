import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Faker-like data generators - Brazilian names
const firstNames = [
  'João', 'Maria', 'José', 'Ana', 'Pedro', 'Juliana', 'Lucas', 'Fernanda',
  'Gabriel', 'Mariana', 'Rafael', 'Camila', 'Matheus', 'Beatriz',
  'Felipe', 'Larissa', 'Rodrigo', 'Carolina', 'Bruno', 'Amanda',
  'Thiago', 'Bianca', 'Guilherme', 'Letícia', 'Vinicius', 'Natália'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira',
  'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro',
  'Martins', 'Carvalho', 'Rocha', 'Almeida', 'Nascimento', 'Araújo'
];

const categories = [
  { name: 'Plomería', slug: 'plomeria', icon: '🔧', color: '#3b82f6' },
  { name: 'Electricidad', slug: 'electricidad', icon: '💡', color: '#f59e0b' },
  { name: 'Carpintería', slug: 'carpinteria', icon: '🪚', color: '#8b5cf6' },
  { name: 'Limpieza', slug: 'limpieza', icon: '🧹', color: '#10b981' },
  { name: 'Pintura', slug: 'pintura', icon: '🎨', color: '#ef4444' },
  { name: 'Jardinería', slug: 'jardineria', icon: '🌱', color: '#22c55e' },
  { name: 'Cerrajería', slug: 'cerrajeria', icon: '🔑', color: '#6366f1' },
  { name: 'Aire Acondicionado', slug: 'aire-acondicionado', icon: '❄️', color: '#06b6d4' },
];

const cities = [
  { name: 'Florianópolis', state: 'SC', lat: -27.5954, lng: -48.5480 },
  { name: 'São José', state: 'SC', lat: -27.6106, lng: -48.6347 },
  { name: 'Palhoça', state: 'SC', lat: -27.6445, lng: -48.6702 },
  { name: 'Biguaçu', state: 'SC', lat: -27.4939, lng: -48.6556 },
  { name: 'Santo Amaro da Imperatriz', state: 'SC', lat: -27.6864, lng: -48.7794 },
  { name: 'Governador Celso Ramos', state: 'SC', lat: -27.3151, lng: -48.5583 },
];

const services = [
  'Reparación básica',
  'Instalación completa',
  'Mantenimiento preventivo',
  'Consultoría',
  'Servicio de emergencia 24/7',
  'Diagnóstico gratuito',
];

const bioTemplates = [
  'Profissional com {years} anos de experiência no setor. Especializado em trabalhos residenciais e comerciais.',
  'Técnico certificado com ampla trajetória. Ofereço serviços de qualidade garantida.',
  '{years} anos de experiência oferecendo soluções eficientes. Trabalho com materiais de primeira qualidade.',
  'Profissional responsável e pontual. Me comprometo com a satisfação do cliente.',
];

const reviewComments = [
  'Excelente serviço, muito profissional e pontual. Recomendo 100%.',
  'Muito bom trabalho, resolveu o problema rapidamente. Contrataria novamente.',
  'Profissional sério e responsável. O trabalho ficou perfeito.',
  'Cumpriu com o acordado, bom preço e qualidade. Satisfeito com o serviço.',
  'Chegou no horário e trabalhou de forma muito caprichada. Muito recomendável.',
  'Excelente atendimento ao cliente. Explicou tudo detalhadamente.',
];

// Helper functions
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateEmail(firstName: string, lastName: string): string {
  const cleanFirst = firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanLast = lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `${cleanFirst}.${cleanLast}@example.com`;
}

function generatePhone(): string {
  // Brazilian phone format: +55 (48) 9xxxx-xxxx
  return `+55 (48) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
}

async function clearDatabase() {
  console.log('🗑️  Limpiando base de datos...');
  
  // Delete in reverse order of dependencies
  await supabase.from('job_applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('job_posting_reactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('job_postings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('professional_services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('professional_gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('professional_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('favorites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('contact_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Delete only test auth users (with @example.com email)
  console.log('🗑️  Eliminando usuarios de prueba (@example.com)...');
  const { data: users } = await supabase.auth.admin.listUsers();
  
  if (users && users.users) {
    const testUsers = users.users.filter(user => user.email?.endsWith('@example.com'));
    
    for (const user of testUsers) {
      await supabase.auth.admin.deleteUser(user.id);
    }
    console.log(`✅ ${testUsers.length} usuarios de prueba eliminados (de ${users.users.length} totales)`);
  }
  
  console.log('✅ Base de datos limpiada');
}

async function seedCategories() {
  console.log('\n📁 Creando categorías...');
  
  const { data, error } = await supabase
    .from('categories')
    .upsert(
      categories.map((cat, index) => ({
        name: cat.name,
        slug: cat.slug,
        description: `Encuentra profesionales de ${cat.name.toLowerCase()}`,
        icon_url: cat.icon,
        color: cat.color,
        display_order: index,
        is_active: true,
      })),
      { onConflict: 'slug' }
    )
    .select();

  if (error) {
    console.error('❌ Error creando categorías:', error);
    throw error;
  }

  console.log(`✅ ${data?.length} categorías creadas`);
  return data || [];
}

async function createTestUsers(count: number, defaultMode: 'client' | 'professional', categoryData: any[] = []) {
  console.log(`\n👤 Creando ${count} usuarios (modo por defecto: ${defaultMode})...`);
  
  const users = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < count; i++) {
    let firstName: string;
    let lastName: string;
    let email: string;
    
    // Keep trying until we get a unique email
    do {
      firstName = randomElement(firstNames);
      lastName = randomElement(lastNames);
      email = generateEmail(firstName, lastName);
    } while (usedEmails.has(email));
    
    usedEmails.add(email);
    const password = 'Password123!'; // Same password for all test users

    const city = randomElement(cities);
    const latOffset = randomFloat(-0.1, 0.1, 6);
    const lngOffset = randomFloat(-0.1, 0.1, 6);
    const yearsExp = randomInt(2, 20);

    // Prepare user metadata for the trigger
    // Note: user_type is no longer needed - trigger sets it to 'both' automatically
    const userMetadata: any = {
      full_name: `${firstName} ${lastName}`,
      default_mode: defaultMode, // Which mode they see first
    };

    // Add professional-specific metadata (all users get professional profile, but only some have details)
    if (defaultMode === 'professional' && categoryData.length > 0) {
      const category = randomElement(categoryData);
      userMetadata.category_id = category.id;
      userMetadata.business_name = `${firstName} ${lastName} - ${category.name}`;
      userMetadata.tagline = `${category.name} profesional con ${yearsExp} años de experiencia`;
      userMetadata.description = randomElement(bioTemplates).replace('{years}', String(yearsExp));
      userMetadata.years_experience = yearsExp;
    }

    // Create auth user - the trigger will create BOTH profile and professional_profile automatically
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    });

    if (authError) {
      console.error(`❌ Error creando usuario ${email}:`, authError.message);
      continue;
    }

    if (!authData.user) {
      console.error(`❌ No se pudo crear usuario ${email}`);
      continue;
    }

    // Wait a bit for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get the profile that was created by the trigger
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error(`❌ Error obteniendo perfil para ${email}:`, profileError.message);
      continue;
    }

    // Update the profile with additional location data
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        phone: generatePhone(),
        bio: defaultMode === 'professional' 
          ? randomElement(bioTemplates).replace('{years}', String(yearsExp))
          : null,
        latitude: city.lat + latOffset,
        longitude: city.lng + lngOffset,
        address: `Rua ${randomInt(100, 9999)}`,
        city: city.name,
        state: city.state,
        postal_code: `88${randomInt(100, 999)}-${randomInt(100, 999)}`,
        is_verified: defaultMode === 'professional' ? Math.random() > 0.3 : false,
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (updateError) {
      console.error(`❌ Error actualizando perfil para ${email}:`, updateError.message);
      continue;
    }

    users.push({
      auth: authData.user,
      profile: updatedProfile || profileData,
      credentials: { email, password },
      defaultMode,
    });
  }

  console.log(`✅ ${users.length} usuarios creados (modo: ${defaultMode})`);
  return users;
}

async function seedProfessionalProfiles(users: any[], categoryData: any[]) {
  console.log('\n👨‍🔧 Actualizando perfiles profesionales...');
  
  const professionalProfiles = [];

  for (const user of users) {
    // Get the professional profile that was created by the trigger (all users now have one)
    const { data: existingProfile, error: getError } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('profile_id', user.profile.id)
      .single();

    if (getError || !existingProfile) {
      console.error(`❌ No se encontró perfil profesional para ${user.profile.full_name}`);
      continue;
    }

    // Only update with rich professional data for users with defaultMode='professional'
    if (user.defaultMode === 'professional') {
      const { data, error } = await supabase
        .from('professional_profiles')
        .update({
          price_range: `R$ ${randomInt(50, 100)}-${randomInt(100, 200)}`,
          service_radius_km: randomInt(5, 30),
          is_verified: Math.random() > 0.3,
          verification_status: Math.random() > 0.3 ? 'approved' : 'pending',
          average_rating: randomFloat(4.0, 5.0, 2),
          total_reviews: randomInt(10, 200),
          total_bookings: randomInt(50, 500),
          completed_bookings: randomInt(40, 450),
          accepts_bookings: Math.random() > 0.2,
          instant_booking: Math.random() > 0.7,
        })
        .eq('id', existingProfile.id)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error actualizando perfil profesional:`, error.message);
        continue;
      }

      professionalProfiles.push(data);
    } else {
      // For client-mode users, keep the basic professional profile created by trigger
      professionalProfiles.push(existingProfile);
    }
  }

  console.log(`✅ ${professionalProfiles.length} perfiles profesionales actualizados`);
  return professionalProfiles;
}

async function seedProfessionalServices(professionalProfiles: any[]) {
  console.log('\n🛠️  Creando servicios profesionales...');
  
  let count = 0;

  for (const profProfile of professionalProfiles) {
    const numServices = randomInt(2, 5);
    const selectedServices = [];
    
    for (let i = 0; i < numServices; i++) {
      selectedServices.push(randomElement(services));
    }

    const uniqueServices = [...new Set(selectedServices)];

    for (const serviceName of uniqueServices) {
      // Update the services JSONB field instead
      const currentServices = profProfile.services || [];
      const newService = {
        name: serviceName,
        description: `Serviço de ${serviceName.toLowerCase()} profissional e garantido`,
        price: randomFloat(40, 300, 0),
        duration_minutes: randomInt(60, 480),
      };
      
      const { error } = await supabase
        .from('professional_profiles')
        .update({
          services: [...currentServices, newService]
        })
        .eq('id', profProfile.id);

      if (!error) count++;
    }
  }

  console.log(`✅ ${count} servicios creados`);
}

async function seedSubscriptions(users: any[]) {
  console.log('\n⭐ Creando suscripciones...');
  
  let count = 0;

  // First, get the subscription plans
  const { data: plans, error: plansError } = await supabase
    .from('subscription_plans')
    .select('*');

  if (plansError || !plans) {
    console.error('❌ Error obteniendo planes:', plansError);
    return;
  }

  // Only create subscriptions for users with professional mode
  const professionalUsers = users.filter(u => u.defaultMode === 'professional');

  for (const user of professionalUsers) {
    // Randomly assign a plan (70% chance of having a paid plan)
    const hasPaidPlan = Math.random() > 0.3;
    
    if (!hasPaidPlan) continue; // Skip free users

    const plan = randomElement(plans.filter(p => p.slug !== 'free'));
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const { error } = await supabase
      .from('subscriptions')
      .insert({
        profile_id: user.profile.id,
        plan_id: plan.id,
        status: 'active',
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
        started_at: startDate.toISOString(),
        auto_renew: true,
        payment_method: randomElement(['credit_card', 'pix']),
      });

    if (!error) count++;
  }

  console.log(`✅ ${count} suscripciones creadas`);
}

async function seedReviews(clients: any[], professionalProfiles: any[]) {
  console.log('\n⭐ Creando reseñas...');
  
  let count = 0;
  const reviewsPerProfessional = 5;

  for (const profProfile of professionalProfiles) {
    for (let i = 0; i < reviewsPerProfessional; i++) {
      const client = randomElement(clients);
      
      const { error } = await supabase
        .from('reviews')
        .insert({
          professional_profile_id: profProfile.id,
          client_profile_id: client.profile.id,
          rating: randomInt(4, 5),
          comment: randomElement(reviewComments),
          is_approved: true,
        });

      if (!error) count++;
    }
  }

  console.log(`✅ ${count} reseñas creadas`);
}

async function seedBookings(clients: any[], professionalProfiles: any[]) {
  console.log('\n📅 Creando reservas...');
  
  let count = 0;
  const statuses = ['pending', 'confirmed', 'completed', 'canceled'];

  for (let i = 0; i < 30; i++) {
    const client = randomElement(clients);
    const profProfile = randomElement(professionalProfiles);
    const status = randomElement(statuses);

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + randomInt(-30, 30));
    
    // Set start time between 8 AM and 6 PM
    const startHour = randomInt(8, 18);
    const startMinute = randomElement([0, 30]);
    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`;
    
    const durationMinutes = randomInt(60, 240);
    const endHour = startHour + Math.floor(durationMinutes / 60);
    const endMinute = startMinute + (durationMinutes % 60);
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;

    const { error } = await supabase
      .from('bookings')
      .insert({
        client_profile_id: client.profile.id,
        professional_profile_id: profProfile.id,
        booking_date: scheduledDate.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        service_name: randomElement(services),
        service_description: `Serviço de ${randomElement(services).toLowerCase()}`,
        price: randomFloat(50, 300, 2),
        status,
        client_notes: 'Reserva de teste gerada automaticamente',
      });

    if (!error) count++;
  }

  console.log(`✅ ${count} reservas creadas`);
}

const jobTitles = [
  'Necesito plomero para reparar fuga',
  'Instalación de aire acondicionado',
  'Pintura de casa completa',
  'Reparación de techo con goteras',
  'Mantenimiento de jardín mensual',
  'Cerrajero para cambio de cerradura',
  'Electricista para instalar ventiladores',
  'Limpieza profunda de departamento',
  'Carpintero para armario a medida',
  'Reparación de puerta principal',
];

const jobDescriptions = [
  'Necesito un profesional confiable para realizar este trabajo. Preferiblemente con experiencia y referencias.',
  'Trabajo urgente que necesita ser realizado lo antes posible. Busco alguien responsable y puntual.',
  'Proyecto para realizar en mi casa. Puedo proporcionar algunos materiales si es necesario.',
  'Busco profesional con experiencia comprobada. El trabajo debe quedar bien hecho.',
  'Necesito cotización y disponibilidad para empezar pronto. Tengo flexibilidad de horarios.',
];

async function seedJobPostings(clients: any[], categoryData: any[]) {
  console.log('\n💼 Creando publicaciones de trabajos...');
  
  let count = 0;
  const budgetTypes = ['hourly', 'daily', 'fixed', 'negotiable'];
  const statuses = ['open', 'open', 'open', 'in_progress']; // More 'open' jobs

  for (let i = 0; i < 20; i++) {
    const client = randomElement(clients);
    const category = Math.random() > 0.3 ? randomElement(categoryData) : null; // 30% without category
    const budgetType = randomElement(budgetTypes);
    const city = randomElement(cities);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + randomInt(1, 30));

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const jobData: any = {
      client_profile_id: client.profile.id,
      title: randomElement(jobTitles),
      description: randomElement(jobDescriptions),
      category_id: category?.id || null,
      budget_type: budgetType,
      status: randomElement(statuses),
      location_city: city.name,
      location_state: city.state,
      location_latitude: city.lat + randomFloat(-0.05, 0.05, 6),
      location_longitude: city.lng + randomFloat(-0.05, 0.05, 6),
      is_recurring: Math.random() > 0.7,
      expires_at: expiresAt.toISOString(),
    };

    // Add budget if not negotiable
    if (budgetType !== 'negotiable') {
      const budgetMin = randomInt(50, 200);
      const budgetMax = budgetMin + randomInt(50, 200);
      jobData.budget_min = budgetMin;
      jobData.budget_max = budgetMax;
    }

    // Add start date for some jobs
    if (Math.random() > 0.5) {
      jobData.start_date = startDate.toISOString().split('T')[0];
    }

    const { error } = await supabase
      .from('job_postings')
      .insert(jobData);

    if (!error) count++;
  }

  console.log(`✅ ${count} publicaciones de trabajos creadas`);
}

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');
  console.log('='.repeat(50));

  try {
    // Clear existing data
    await clearDatabase();

    // Seed categories
    const categoryData = await seedCategories();

    // Create test users - ALL users now get BOTH profiles automatically via trigger
    // We just set different default_mode to indicate their primary use case
    const clientModeUsers = await createTestUsers(20, 'client', categoryData);
    const professionalModeUsers = await createTestUsers(30, 'professional', categoryData);
    
    // Combine all users
    const allUsers = [...clientModeUsers, ...professionalModeUsers];

    // Update professional profiles for all users (all have one now)
    const professionalProfiles = await seedProfessionalProfiles(allUsers, categoryData);
    
    // Only add services to professional-mode users
    const activeProfessionalProfiles = professionalProfiles.filter((_, idx) => 
      allUsers[idx]?.defaultMode === 'professional'
    );
    await seedProfessionalServices(activeProfessionalProfiles);
    
    // Create subscriptions for professional-mode users
    await seedSubscriptions(allUsers);

    // Seed interactions (use client-mode users as clients, professional profiles as professionals)
    if (clientModeUsers.length > 0 && activeProfessionalProfiles.length > 0) {
      await seedReviews(clientModeUsers, activeProfessionalProfiles);
      await seedBookings(clientModeUsers, activeProfessionalProfiles);
    }

    // Seed job postings
    if (clientModeUsers.length > 0) {
      await seedJobPostings(clientModeUsers, categoryData);
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ ¡Seed completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Categorías: ${categoryData.length}`);
    console.log(`   - Total de usuarios: ${allUsers.length} (todos tienen perfil de cliente Y profesional)`);
    console.log(`   - Usuarios en modo cliente: ${clientModeUsers.length}`);
    console.log(`   - Usuarios en modo profesional: ${professionalModeUsers.length}`);
    console.log(`   - Perfiles profesionales activos: ${activeProfessionalProfiles.length}`);
    console.log('\n💡 Nueva regla de negocio:');
    console.log('   - TODOS los usuarios tienen ambos perfiles (cliente + profesional)');
    console.log('   - default_mode determina qué vista ven primero');
    console.log('   - Los usuarios pueden cambiar entre modos en cualquier momento');
    console.log('\n🔐 Credenciales de prueba:');
    console.log('   Email: [nombre].[apellido][timestamp]@example.com');
    console.log('   Password: Password123!');
    console.log('\n💡 Ejemplo: Use cualquier email generado durante el seed');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Run the script
main();

