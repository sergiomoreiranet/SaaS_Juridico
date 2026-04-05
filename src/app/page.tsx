import Link from 'next/link';
import EscritorioSearch from '@/components/EscritorioSearch';

// ============================================================
// SEÇÕES DA LANDING PAGE JURIADM
// ============================================================

const features = [
  {
    icon: '⚖️',
    title: 'Prazos Nunca Perdidos',
    description: 'Alertas automáticos D-5, D-2 e D-1. Nunca mais perca um prazo processual por falta de aviso.',
  },
  {
    icon: '📱',
    title: 'Mobile-First para Advogados',
    description: 'No trajeto para o fórum? Consulte o resumo do processo pelo celular em 3 segundos.',
  },
  {
    icon: '🏢',
    title: 'Subdomínio Próprio',
    description: 'Seu escritório ganha um endereço exclusivo: rochafagundes.juriadm.com.br',
  },
  {
    icon: '🔒',
    title: 'Isolamento Total de Dados',
    description: 'Cada escritório em seu próprio silo seguro. RLS ativo em nível de banco de dados.',
  },
  {
    icon: '📋',
    title: 'Gestão Completa de Casos',
    description: 'Clientes, processos, audiências, documentos e histórico completo em um único lugar.',
  },
  {
    icon: '📊',
    title: 'Dashboard Inteligente',
    description: 'Visão rápida dos casos críticos, prazos urgentes e atividade da equipe ao abrir o sistema.',
  },
];

const plans = [
  {
    name: 'Básico',
    price: 'R$ 97',
    period: '/mês',
    description: 'Ideal para advogados autônomos',
    highlight: false,
    features: [
      '1 usuário (advogado)',
      'Até 50 processos ativos',
      'Alertas de prazos básicos',
      'Dashboard resumido',
      'Subdomínio próprio',
    ],
    cta: 'Testar 15 dias grátis',
  },
  {
    name: 'Pro',
    price: 'R$ 247',
    period: '/mês',
    description: 'Para escritórios em crescimento',
    highlight: true,
    features: [
      'Até 5 usuários',
      'Processos ilimitados',
      'Portal do cliente',
      'Upload de documentos',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    cta: 'Testar 15 dias grátis',
  },
  {
    name: 'Elite',
    price: 'R$ 497',
    period: '/mês',
    description: 'Para grandes escritórios',
    highlight: false,
    features: [
      'Usuários ilimitados',
      'Monitoramento CNJ automático',
      'Assinatura digital integrada',
      'White-label completo',
      'IA para análise de documentos',
      'SLA garantido',
    ],
    cta: 'Falar com consultor',
  },
];

const testimonials = [
  {
    name: 'Dr. Roberto Figueiredo',
    role: 'Advogado Criminalista · São Paulo',
    initial: 'R',
    text: 'Antes eu vivia com medo de perder prazo. Hoje o JuriADM me avisa antes mesmo de eu lembrar. Mudou minha rotina completamente.',
  },
  {
    name: 'Dra. Carla Mendes',
    role: 'Sócia · Mendes & Associados',
    initial: 'C',
    text: 'O portal do cliente foi o nosso diferencial de vendas. Os clientes adoram poder acompanhar o processo pelo celular.',
  },
  {
    name: 'Dr. Paulo Saraiva',
    role: 'Advogado Trabalhista · BH',
    initial: 'P',
    text: 'Testei 3 sistemas diferentes. O JuriADM é o único que funciona de verdade no celular. Consulto processos no metrô.',
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: '#d4af37' }}>⚖</span>
            <span className="text-xl font-bold text-white">JuriADM</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Funcionalidades</a>
            <a href="#plans" className="text-sm text-white/60 hover:text-white transition-colors">Planos</a>
            <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
              Admin
            </Link>
            <Link href="/cadastro" className="text-sm px-4 py-2 rounded-lg font-medium transition-all" style={{ background: '#8b0000', color: 'white' }}>
              Teste Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-32 px-4 sm:px-6 text-center overflow-hidden">
        {/* Background Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8b0000, transparent 70%)' }}></div>
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #d4af37, transparent 70%)' }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 border" style={{ background: 'rgba(139,0,0,0.1)', borderColor: 'rgba(139,0,0,0.3)', color: '#d4af37' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#8b0000' }}></span>
            Campo aberto para escritórios pioneiros — Fase Inicial
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Gestão Jurídica{' '}
            <span style={{ color: '#d4af37' }}>Premium</span>
            <br />
            <span className="text-white/70 text-4xl sm:text-5xl md:text-6xl">para Escritórios Modernos.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-12">
            Controle prazos, casos e clientes com um sistema feito por advogados, para advogados.
            Acesse do escritório ou do celular a caminho do fórum.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/cadastro" className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:opacity-90 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #8b0000, #a31111)', color: 'white', boxShadow: '0 0 30px rgba(139,0,0,0.3)' }}>
              Solicitar Teste de 15 Dias →
            </Link>
          </div>

          {/* ── ACESSO AO ESCRITÓRIO ── */}
          <div
            className="w-full max-w-lg mx-auto p-6 rounded-2xl border"
            style={{
              background: 'rgba(14,14,14,0.7)',
              borderColor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <p className="text-sm font-semibold text-white/80 mb-1 text-center">
              Já é cliente? Acesse seu escritório
            </p>
            <p className="text-xs text-white/35 mb-4 text-center">
              Encontre seu escritório pelo nome e acesse diretamente o sistema
            </p>
            <EscritorioSearch />
          </div>

          {/* Social proof micro */}
          <p className="mt-6 text-sm text-white/30">
            Sem cartão de crédito • Cancele quando quiser • Dados 100% seguros
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tudo que seu escritório precisa,<br />
              <span style={{ color: '#d4af37' }}>em um só lugar</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Desenvolvido para funcionar do desktop ao celular, sem abrir mão de nenhuma funcionalidade crítica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border transition-all hover:-translate-y-1 group" style={{ background: 'rgba(20,20,20,0.8)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOBILE HIGHLIGHT ── */}
      <section className="py-24 px-4 sm:px-6 border-y border-white/5" style={{ background: 'rgba(139,0,0,0.04)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Mockup de tela mobile */}
          <div className="relative flex-shrink-0">
            <div className="w-56 h-96 rounded-3xl border-4 border-white/10 flex flex-col overflow-hidden shadow-2xl" style={{ background: '#111' }}>
              <div className="h-8 flex items-center justify-center border-b border-white/5">
                <div className="w-20 h-1.5 rounded-full bg-white/20"></div>
              </div>
              <div className="flex-1 p-3 space-y-3">
                <div className="h-5 w-24 rounded bg-white/10"></div>
                <div className="p-3 rounded-xl border border-white/10" style={{ background: 'rgba(139,0,0,0.15)' }}>
                  <div className="h-3 w-20 rounded mb-2" style={{ background: '#d4af37', opacity: 0.6 }}></div>
                  <div className="h-2 w-32 rounded bg-white/20"></div>
                  <div className="h-2 w-28 rounded bg-white/20 mt-1"></div>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-white/5">
                  <div className="h-3 w-16 rounded bg-white/30 mb-2"></div>
                  <div className="h-2 w-28 rounded bg-white/15"></div>
                  <div className="h-2 w-20 rounded bg-white/15 mt-1"></div>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-white/5">
                  <div className="h-3 w-20 rounded bg-white/30 mb-2"></div>
                  <div className="h-2 w-24 rounded bg-white/15"></div>
                </div>
              </div>
              <div className="h-14 border-t border-white/5 flex items-center justify-around px-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs">🏠</div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style={{ background: 'rgba(139,0,0,0.4)' }}>📋</div>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs">👤</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/10" style={{ background: '#141414' }}>⏰</div>
          </div>

          {/* Texto */}
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium border" style={{ background: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.2)', color: '#d4af37' }}>
              Mobile-First
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              No trajeto para o fórum,
              <br />
              <span style={{ color: '#d4af37' }}>tudo na palma da mão.</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed">
              Desenvolvemos cada tela pensando em quem está no metrô, no carro ou na sala de espera do tribunal. Cards objetivos, botões grandes, carregamento rápido.
            </p>
            <ul className="space-y-3">
              {['Resumo do processo em 1 clique','Alertas de prazo com notificação push','Consulta de documentos offline','Interface de toque otimizada'].map(item => (
                <li key={item} className="flex items-center gap-3 text-white/70">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(139,0,0,0.3)' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Planos para cada tamanho
              <br />
              <span style={{ color: '#d4af37' }}>de escritório</span>
            </h2>
            <p className="text-white/50 text-lg">15 dias grátis em qualquer plano. Sem cartão de crédito.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="relative p-8 rounded-2xl border flex flex-col transition-all hover:-translate-y-1"
                style={{
                  background: plan.highlight ? 'linear-gradient(145deg, rgba(139,0,0,0.2), rgba(20,20,20,0.9))' : 'rgba(14,14,14,0.8)',
                  borderColor: plan.highlight ? 'rgba(139,0,0,0.5)' : 'rgba(255,255,255,0.07)',
                  boxShadow: plan.highlight ? '0 0 40px rgba(139,0,0,0.15)' : 'none',
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: '#8b0000', color: '#d4af37' }}>
                    MAIS ESCOLHIDO
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white/80 mb-1">{plan.name}</h3>
                  <p className="text-sm text-white/40 mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/40">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(feat => (
                      <li key={feat} className="flex items-center gap-3 text-sm text-white/60">
                        <span style={{ color: '#d4af37' }}>✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <Link
                    href={plan.name === 'Elite' ? '/login' : '/cadastro'}
                    className="block w-full py-3 text-center rounded-xl font-medium transition-all hover:opacity-90 text-sm"
                    style={{
                      background: plan.highlight ? 'linear-gradient(135deg, #8b0000, #a31111)' : 'rgba(255,255,255,0.07)',
                      color: plan.highlight ? 'white' : 'white',
                      border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 border-t border-white/5" style={{ background: 'rgba(10,10,10,0.6)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Advogados que já{' '}
              <span style={{ color: '#d4af37' }}>confiam no JuriADM</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border" style={{ background: 'rgba(20,20,20,0.8)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-white/60 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: 'rgba(139,0,0,0.3)', color: '#d4af37' }}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl border" style={{ background: 'linear-gradient(145deg, rgba(139,0,0,0.15), rgba(14,14,14,0.95))', borderColor: 'rgba(139,0,0,0.25)' }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pronto para transformar
              <br />
              <span style={{ color: '#d4af37' }}>seu escritório?</span>
            </h2>
            <p className="text-white/50 mb-8">
              Solicite acesso agora e tenha 15 dias completos para explorar tudo sem pagar nada.
            </p>
            <Link href="/cadastro" className="inline-block px-10 py-4 rounded-xl font-semibold text-lg transition-all hover:opacity-90 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #8b0000, #a31111)', color: 'white', boxShadow: '0 0 40px rgba(139,0,0,0.3)' }}>
              Solicitar Teste Gratis →
            </Link>
            <p className="mt-4 text-sm text-white/30">Aprovação em até 24 horas úteis</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ color: '#d4af37' }}>⚖</span>
            <span className="font-bold text-white">JuriADM</span>
            <span className="text-white/30 text-sm ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white/60 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white/60 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
