-- ==========================================
-- SCRIPT DE INICIALIZACIÓN - ERP OTEC PRO
-- Ejecutar en el SQL Editor de Supabase
-- ==========================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(255) NOT NULL,
    giro VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    comuna VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    holding VARCHAR(255),
    fecha_registro DATE DEFAULT CURRENT_DATE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: CONTACTOS DE CLIENTES
CREATE TABLE IF NOT EXISTS contactos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    cargo VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    es_decisor BOOLEAN DEFAULT FALSE,
    es_coordinador BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: CURSOS
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_interno VARCHAR(50) NOT NULL UNIQUE,
    codigo_sence VARCHAR(50),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    horas_totales INTEGER NOT NULL,
    modalidad VARCHAR(100) NOT NULL,
    es_sag BOOLEAN DEFAULT FALSE,
    temario_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: ARCHIVOS ADJUNTOS (CURSOS)
CREATE TABLE IF NOT EXISTS archivos_adjuntos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    tamano INTEGER,
    fecha_subida DATE DEFAULT CURRENT_DATE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA: RELATORES
CREATE TABLE IF NOT EXISTS relatores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    profesion VARCHAR(150) NOT NULL,
    especialidad VARCHAR(255) NOT NULL,
    valor_hora NUMERIC NOT NULL,
    curriculum_url TEXT,
    titulos_url TEXT,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA: EJECUCIONES (CURSOS PROGRAMADOS)
CREATE TABLE IF NOT EXISTS ejecuciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID REFERENCES cursos(id) ON DELETE RESTRICT,
    cliente_id UUID REFERENCES clientes(id) ON DELETE RESTRICT,
    codigo_sence VARCHAR(50),
    estado VARCHAR(50) NOT NULL,
    modalidad VARCHAR(100) NOT NULL,
    total_horas INTEGER NOT NULL,
    lugar TEXT,
    url_plataforma TEXT,
    relator_id UUID REFERENCES relatores(id) ON DELETE RESTRICT,
    fecha_inicio DATE,
    fecha_termino DATE,
    horario VARCHAR(255),
    observaciones TEXT,
    cotizacion_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA: SESIONES (DE EJECUCIONES)
CREATE TABLE IF NOT EXISTS sesiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ejecucion_id UUID REFERENCES ejecuciones(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLA: PARTICIPANTES
CREATE TABLE IF NOT EXISTS participantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ejecucion_id UUID REFERENCES ejecuciones(id) ON DELETE CASCADE,
    rut VARCHAR(20) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    nivel_educacional VARCHAR(100),
    asistencia_progreso INTEGER DEFAULT 0,
    nota_final NUMERIC(3,1),
    estado_sag VARCHAR(50) DEFAULT 'No Aplica',
    -- SAG Colinesterasa
    doc_col_url TEXT,
    doc_col_fecha_examen DATE,
    doc_col_fecha_vencimiento DATE,
    doc_col_valido BOOLEAN DEFAULT FALSE,
    -- SAG Certificado Médico
    doc_med_url TEXT,
    doc_med_valido BOOLEAN DEFAULT FALSE,
    -- SAG Poder Simple
    doc_pod_url TEXT,
    doc_pod_valido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ejecucion_id, rut)
);

-- 9. TABLA: COTIZACIONES
CREATE TABLE IF NOT EXISTS cotizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) NOT NULL UNIQUE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE RESTRICT,
    contacto_id UUID REFERENCES contactos(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    vigencia_dias INTEGER NOT NULL,
    subtotal NUMERIC NOT NULL,
    iva NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    estado VARCHAR(50) NOT NULL,
    observaciones TEXT,
    fecha_aprobacion DATE,
    ejecucion_id UUID REFERENCES ejecuciones(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (Nota: Para mantener la consistencia, a cotizaciones de arriba le falta la relación, por ahora se enlaza en el campo ejecucion_id)
ALTER TABLE ejecuciones ADD CONSTRAINT fk_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE SET NULL;

-- 10. TABLA: ITEMS COTIZACIÓN
CREATE TABLE IF NOT EXISTS items_cotizacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES cursos(id) ON DELETE RESTRICT,
    valor_por_participante NUMERIC NOT NULL,
    cantidad_participantes INTEGER NOT NULL,
    descuento NUMERIC DEFAULT 0,
    subtotal NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABLA: TRANSACCIONES FINANCIERAS
CREATE TABLE IF NOT EXISTS transacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL, -- Ingreso, Egreso, NotaCredito
    categoria VARCHAR(100) NOT NULL,
    es_directo BOOLEAN NOT NULL,
    ejecucion_id UUID REFERENCES ejecuciones(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    monto_neto NUMERIC NOT NULL,
    monto_iva NUMERIC NOT NULL,
    monto_total NUMERIC NOT NULL,
    metadatos_nro_doc VARCHAR(100),
    metadatos_descripcion TEXT,
    tracking_fecha_emision DATE,
    tracking_fecha_vencimiento DATE,
    tracking_fecha_pago_real DATE,
    tracking_pagado BOOLEAN DEFAULT FALSE,
    saldo_pendiente NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABLA: ALERTAS
CREATE TABLE IF NOT EXISTS alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha DATE NOT NULL,
    prioridad VARCHAR(20) NOT NULL,
    entidad_id UUID,
    entidad_tipo VARCHAR(50),
    resuelta BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS (Row Level Security) básico para acceso desde API anónima
-- Atención: En producción, cambia esto para que solo usuarios autenticados (auth.role() = 'authenticated') puedan acceder.
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso total autenticados en clientes" ON clientes FOR ALL USING (auth.role() = 'authenticated');

-- Repetir para el resto (para pruebas, puedes dejarlas sin RLS momentáneamente si ejecutas un backend, 
-- pero Supabase exige RLS para las peticiones frontend).

