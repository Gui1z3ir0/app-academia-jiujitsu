create schema if not exists private;

create table if not exists public.gym_config (
  id bigint generated always as identity primary key,
  name text not null default 'Academia & Jiu-Jítsu Pro',
  slogan text not null default 'Treinamento, Performance & Artes Marciais',
  logo_text text not null default 'FIT',
  logo_url text,
  primary_color text not null default '#00F59B',
  secondary_color text not null default '#00D2FF',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  support_email text not null default '',
  pix_key text not null default '',
  pix_merchant_name text not null default '',
  pix_merchant_city text not null default 'SAO PAULO',
  payment_gateway_provider text not null default 'asaas' check (payment_gateway_provider in ('asaas', 'mercadopago', 'pagarme', 'stripe', 'manual_pix')),
  asaas_environment text not null default 'sandbox' check (asaas_environment in ('sandbox', 'production')),
  address text not null default '',
  working_hours_weekdays text not null default '06:00 às 22:00',
  working_hours_saturdays text not null default '08:00 às 16:00',
  working_hours_sundays text not null default '09:00 às 13:00',
  announcements text not null default '',
  privacy_policy_url text,
  terms_of_use_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.planos (
  id text primary key,
  nome text not null,
  modalidade text not null check (modalidade in ('musculacao', 'jiujitsu', 'completo')),
  valor numeric(10,2) not null check (valor >= 0),
  duracao_meses integer not null default 1 check (duracao_meses > 0),
  descricao text not null default '',
  beneficios jsonb not null default '[]'::jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.planos (id, nome, modalidade, valor, duracao_meses, descricao, beneficios)
values
  (
    'plan_academia',
    'Plano Musculação',
    'musculacao',
    120.00,
    1,
    'Acesso completo à sala de musculação com ficha de treino individualizada e acompanhamento do personal.',
    '["Acesso livre à musculação", "Ficha de treino personalizada por dias da semana", "Avaliação física e bioimpedância", "Chat direto com o personal no app"]'::jsonb
  ),
  (
    'plan_jiujitsu',
    'Plano Jiu-Jítsu',
    'jiujitsu',
    130.00,
    1,
    'Acesso às turmas de Jiu-Jítsu (Gi e No-Gi), controle de graduação por faixa/graus e presença nas aulas.',
    '["Aulas de Jiu-Jítsu Gi e No-Gi", "Acompanhamento de faixa, graus e presenças", "Grade completa de horários de turmas", "Chat direto com o professor/personal"]'::jsonb
  ),
  (
    'plan_academia_jiujitsu',
    'Plano Completo (Musculação + Jiu-Jítsu)',
    'completo',
    150.00,
    1,
    'Pacote completo: musculação livre + todas as turmas de Jiu-Jítsu + preparação física integrada.',
    '["Musculação livre todos os dias", "Todas as turmas de Jiu-Jítsu (Gi e No-Gi)", "Controle de faixa/graus e bioimpedância", "Suporte prioritário no chat do app"]'::jsonb
  )
on conflict (id) do update set
  nome = excluded.nome,
  modalidade = excluded.modalidade,
  valor = excluded.valor,
  descricao = excluded.descricao,
  beneficios = excluded.beneficios;

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  cpf_cnpj text,
  telefone text not null default '',
  sexo text not null default 'M' check (sexo in ('M', 'F', 'Outro')),
  role text not null default 'aluno' check (role in ('personal', 'aluno')),
  cref text,
  especialidade text,
  plano_id text references public.planos(id) on delete set null,
  asaas_customer_id text,
  peso_kg numeric(5,2),
  altura_cm numeric(5,1),
  objetivo text not null default 'Saúde & Performance',
  dias_treino_semana text[] not null default array['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
  faixa_jiujitsu text not null default 'Branca' check (faixa_jiujitsu in ('Branca', 'Azul', 'Roxa', 'Marrom', 'Preta')),
  graus_jiujitsu integer not null default 0 check (graus_jiujitsu between 0 and 4),
  aulas_jiujitsu_acumuladas integer not null default 0 check (aulas_jiujitsu_acumuladas >= 0),
  meta_aulas_graduacao integer not null default 40 check (meta_aulas_graduacao > 0),
  push_token text,
  lgpd_accepted boolean not null default false,
  lgpd_accepted_at timestamptz,
  status text not null default 'ativo' check (status in ('ativo', 'inativo', 'suspenso')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists usuarios_plano_id_idx on public.usuarios (plano_id);
create index if not exists usuarios_role_idx on public.usuarios (role);

create or replace function private.is_personal()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.usuarios
    where id = (select auth.uid()) and role = 'personal'
  );
$$;

revoke execute on function private.is_personal() from public, anon, authenticated, service_role;

create table if not exists public.matriculas (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  plano_id text not null references public.planos(id) on delete restrict,
  asaas_subscription_id text,
  status text not null default 'ativa' check (status in ('ativa', 'vencida', 'trancada', 'cancelada')),
  data_inicio date not null default current_date,
  data_fim date not null default (current_date + interval '1 year')::date,
  created_at timestamptz not null default now()
);

create index if not exists matriculas_usuario_id_idx on public.matriculas (usuario_id);
create index if not exists matriculas_plano_id_idx on public.matriculas (plano_id);

create table if not exists public.faturas (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  plano_id text references public.planos(id) on delete set null,
  descricao text not null,
  valor numeric(10,2) not null check (valor >= 0),
  data_vencimento date not null,
  data_pagamento timestamptz,
  status text not null default 'pendente' check (status in ('pendente', 'aguardando_confirmacao', 'pago', 'atrasado', 'cancelado')),
  metodo_pagamento text check (metodo_pagamento in ('pix', 'cartao_credito', 'boleto', 'balcao')),
  gateway_provider text default 'asaas',
  gateway_payment_id text unique,
  pix_copia_cola text,
  pix_qr_code_base64 text,
  boleto_url text,
  checkout_url text,
  webhook_confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists faturas_usuario_id_idx on public.faturas (usuario_id);
create index if not exists faturas_plano_id_idx on public.faturas (plano_id);
create index if not exists faturas_status_vencimento_idx on public.faturas (status, data_vencimento);

create table if not exists public.treinos (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  personal_id uuid references public.usuarios(id) on delete set null,
  dia_semana text not null check (dia_semana in ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
  titulo text not null,
  observacoes text,
  updated_at timestamptz not null default now(),
  unique (usuario_id, dia_semana)
);

create index if not exists treinos_usuario_id_idx on public.treinos (usuario_id);
create index if not exists treinos_personal_id_idx on public.treinos (personal_id);

create table if not exists public.treino_exercicios (
  id bigint generated always as identity primary key,
  treino_id bigint not null references public.treinos(id) on delete cascade,
  ordem integer not null default 1,
  nome text not null,
  grupo_muscular text not null default 'Musculação',
  series integer not null default 4 check (series > 0),
  repeticoes text not null default '10-12',
  carga_kg numeric(6,2) not null default 0 check (carga_kg >= 0),
  descanso_segundos integer not null default 60 check (descanso_segundos >= 0),
  observacoes text,
  concluido boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists treino_exercicios_treino_id_idx on public.treino_exercicios (treino_id);

create table if not exists public.turmas_jiujitsu (
  id bigint generated always as identity primary key,
  nome text not null,
  modalidade text not null default 'Gi (Com Kimono)' check (modalidade in ('Gi (Com Kimono)', 'No-Gi (Sem Kimono)', 'Fundamentos', 'Competição', 'Todos os Níveis')),
  dias_semana text[] not null,
  horario text not null,
  professor text not null,
  capacidade_maxima integer not null default 30 check (capacidade_maxima > 0),
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.presencas (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  turma_id bigint references public.turmas_jiujitsu(id) on delete set null,
  tipo text not null default 'musculacao' check (tipo in ('musculacao', 'jiujitsu')),
  status text not null default 'presente' check (status in ('presente', 'falta', 'justificada')),
  data_aula date not null default current_date,
  observacao text,
  registrado_por uuid references public.usuarios(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists presencas_usuario_id_idx on public.presencas (usuario_id);
create index if not exists presencas_turma_id_idx on public.presencas (turma_id);
create index if not exists presencas_registrado_por_idx on public.presencas (registrado_por);

create table if not exists public.avaliacoes_fisicas (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  personal_id uuid references public.usuarios(id) on delete set null,
  data_avaliacao date not null default current_date,
  peso_kg numeric(5,2) not null,
  altura_cm numeric(5,1) not null,
  imc numeric(4,1) not null,
  gordura_corporal numeric(4,1),
  massa_muscular_kg numeric(5,2),
  torax_cm numeric(5,1),
  braco_cm numeric(5,1),
  cintura_cm numeric(5,1),
  coxa_cm numeric(5,1),
  supino_kg numeric(5,1),
  agachamento_kg numeric(5,1),
  terra_kg numeric(5,1),
  observacoes text,
  created_at timestamptz not null default now()
);

create index if not exists avaliacoes_fisicas_usuario_id_idx on public.avaliacoes_fisicas (usuario_id);
create index if not exists avaliacoes_fisicas_personal_id_idx on public.avaliacoes_fisicas (personal_id);

create table if not exists public.mensagens_chat (
  id bigint generated always as identity primary key,
  aluno_id uuid not null references public.usuarios(id) on delete cascade,
  remetente_id uuid not null references public.usuarios(id) on delete cascade,
  remetente_role text not null check (remetente_role in ('personal', 'aluno')),
  assunto text,
  prioridade text not null default 'media' check (prioridade in ('baixa', 'media', 'alta')),
  conteudo text not null,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists mensagens_chat_aluno_id_idx on public.mensagens_chat (aluno_id, created_at desc);
create index if not exists mensagens_chat_remetente_id_idx on public.mensagens_chat (remetente_id);

create table if not exists public.notificacoes (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  tipo text not null check (tipo in ('chat', 'cobranca', 'treino', 'jiujitsu', 'sistema')),
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notificacoes_usuario_id_idx on public.notificacoes (usuario_id, lida, created_at desc);

create or replace function public.listar_inadimplentes_mes()
returns table (
  usuario_id uuid,
  nome text,
  email text,
  telefone text,
  push_token text,
  plano_nome text,
  fatura_id bigint,
  valor numeric(10,2),
  data_vencimento date,
  dias_atraso integer
)
language sql
security definer
set search_path = ''
as $$
  select
    u.id as usuario_id,
    u.nome,
    u.email,
    u.telefone,
    u.push_token,
    coalesce(p.nome, 'Plano Musculação') as plano_nome,
    f.id as fatura_id,
    f.valor,
    f.data_vencimento,
    greatest(0, (current_date - f.data_vencimento))::integer as dias_atraso
  from public.usuarios u
  join public.faturas f on f.usuario_id = u.id
  left join public.planos p on p.id = coalesce(f.plano_id, u.plano_id)
  where u.role = 'aluno'
    and f.status in ('pendente', 'atrasado')
    and f.data_vencimento <= current_date
    and exists (
      select 1 from public.usuarios caller
      where caller.id = (select auth.uid()) and caller.role = 'personal'
    )
  order by f.data_vencimento asc;
$$;

create or replace function public.copiar_treino_aluno(
  p_origem_usuario_id uuid,
  p_destino_usuario_id uuid,
  p_dia_semana text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_treino record;
  v_novo_treino_id bigint;
begin
  if not exists (
    select 1 from public.usuarios
    where id = (select auth.uid()) and role = 'personal'
  ) then
    raise exception 'Apenas o personal pode copiar fichas de treino entre alunos.';
  end if;

  for v_treino in
    select * from public.treinos
    where usuario_id = p_origem_usuario_id
      and (p_dia_semana is null or dia_semana = p_dia_semana)
  loop
    insert into public.treinos (usuario_id, personal_id, dia_semana, titulo, observacoes, updated_at)
    values (p_destino_usuario_id, (select auth.uid()), v_treino.dia_semana, v_treino.titulo, v_treino.observacoes, now())
    on conflict (usuario_id, dia_semana) do update set
      titulo = excluded.titulo,
      observacoes = excluded.observacoes,
      personal_id = excluded.personal_id,
      updated_at = now()
    returning id into v_novo_treino_id;

    delete from public.treino_exercicios where treino_id = v_novo_treino_id;

    insert into public.treino_exercicios (
      treino_id, ordem, nome, grupo_muscular, series, repeticoes, carga_kg, descanso_segundos, observacoes, concluido
    )
    select
      v_novo_treino_id, ordem, nome, grupo_muscular, series, repeticoes, carga_kg, descanso_segundos, observacoes, false
    from public.treino_exercicios
    where treino_id = v_treino.id;
  end loop;
end;
$$;

alter table public.gym_config enable row level security;
alter table public.planos enable row level security;
alter table public.usuarios enable row level security;
alter table public.matriculas enable row level security;
alter table public.faturas enable row level security;
alter table public.treinos enable row level security;
alter table public.treino_exercicios enable row level security;
alter table public.turmas_jiujitsu enable row level security;
alter table public.presencas enable row level security;
alter table public.avaliacoes_fisicas enable row level security;
alter table public.mensagens_chat enable row level security;
alter table public.notificacoes enable row level security;

create policy gym_config_read_policy on public.gym_config
  for select to authenticated, anon using (true);

create policy gym_config_write_policy on public.gym_config
  for all to authenticated using ((select private.is_personal()));

create policy planos_read_policy on public.planos
  for select to authenticated, anon using (true);

create policy planos_write_policy on public.planos
  for all to authenticated using ((select private.is_personal()));

create policy usuarios_select_policy on public.usuarios
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_personal()));

create policy usuarios_update_policy on public.usuarios
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_personal()));

create policy usuarios_delete_policy on public.usuarios
  for delete to authenticated
  using (id = (select auth.uid()) or (select private.is_personal()));

create policy matriculas_access_policy on public.matriculas
  for all to authenticated
  using (usuario_id = (select auth.uid()) or (select private.is_personal()));

create policy faturas_select_policy on public.faturas
  for select to authenticated
  using (usuario_id = (select auth.uid()) or (select private.is_personal()));

create policy faturas_personal_write_policy on public.faturas
  for all to authenticated
  using ((select private.is_personal()));

create policy treinos_access_policy on public.treinos
  for all to authenticated
  using (usuario_id = (select auth.uid()) or (select private.is_personal()));

create policy treino_exercicios_access_policy on public.treino_exercicios
  for all to authenticated
  using (
    exists (
      select 1 from public.treinos t
      where t.id = treino_id
        and (t.usuario_id = (select auth.uid()) or (select private.is_personal()))
    )
  );

create policy turmas_jiujitsu_read_policy on public.turmas_jiujitsu
  for select to authenticated using (true);

create policy turmas_jiujitsu_write_policy on public.turmas_jiujitsu
  for all to authenticated using ((select private.is_personal()));

create policy presencas_select_policy on public.presencas
  for select to authenticated
  using (usuario_id = (select auth.uid()) or (select private.is_personal()));

create policy presencas_write_policy on public.presencas
  for all to authenticated
  using ((select private.is_personal()));

create policy avaliacoes_select_policy on public.avaliacoes_fisicas
  for select to authenticated
  using (usuario_id = (select auth.uid()) or (select private.is_personal()));

create policy avaliacoes_write_policy on public.avaliacoes_fisicas
  for all to authenticated
  using ((select private.is_personal()));

create policy mensagens_chat_access_policy on public.mensagens_chat
  for all to authenticated
  using (aluno_id = (select auth.uid()) or (select private.is_personal()));

create policy notificacoes_access_policy on public.notificacoes
  for all to authenticated
  using (usuario_id = (select auth.uid()) or (select private.is_personal()));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.mensagens_chat;
    alter publication supabase_realtime add table public.faturas;
    alter publication supabase_realtime add table public.notificacoes;
  end if;
exception when others then
  null;
end $$;
