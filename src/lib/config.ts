// Configurações editáveis do site Parceiros Internet
// Altere os valores abaixo conforme necessário

export const siteConfig = {
  // Informações da empresa
  company: {
    name: "Parceiros Internet",
    shortName: "Parceiros",
    tagline: "Fibra óptica de verdade para você",
    description: "Internet fibra óptica de alta velocidade em Balneário Camboriú e Camboriú. Conexão estável, suporte local e instalação rápida.",
  },
  
  // Contato
  contact: {
    phone: "(47) 92003-7544",
whatsapp: "5547920037544",
whatsappDisplay: "(47) 92003-7544",
    email: "contato@parceirosinternet.com.br",
    emailPedidos: "pedidos@parceirosinternet.com.br",
  },
  
  // Endereço
  address: {
    street: "R. Jacarandá, 1320",
    neighborhood: "Tabuleiro",
    city: "Camboriú",
    state: "SC",
    zip: "88340-000",
    full: "R. Jacarandá, 1320 - Tabuleiro, Camboriú - SC",
  },
  
  // Horários de atendimento
  hours: {
    weekdays: "Segunda a Sexta: 8h às 18h",
    saturday: "",
    sunday: "",
    support: "Suporte técnico: 24 horas",
  },
  
  // Redes sociais
  social: {
    instagram: "https://instagram.com/parceirosinternet",
    facebook: "https://www.facebook.com/parceirosinternet/",
  },
  
  // Estatísticas (prova social)
  stats: {
    customers: "5.000+",
    customersText: "clientes conectados",
    installationTime: "24h",
    installationText: "instalação em até",
    satisfaction: "4.9",
    satisfactionText: "nota de satisfação",
    uptime: "99.9%",
    uptimeText: "de disponibilidade",
  },
  
  // Promoção ativa
  promo: {
    active: true,
    bannerText: "🔥 Promoção de Verão em BC e Camboriú!",
    bannerCta: "Contratar agora",
    title: "MEGA PROMOÇÃO",
    subtitle: "Fibra óptica com o melhor custo-benefício",
    discount: "3 meses",
    discountText: "com 50% de desconto",
    endDate: "2025-02-28",
  },
  
  // Áreas de cobertura
  coverage: {
    cities: ["Balneário Camboriú", "Camboriú"],
    neighborhoods: {
      "Balneário Camboriú": [
        "Centro",
        "Barra Sul",
        "Pioneiros",
        "Das Nações",
        "Vila Real",
        "Ariribá",
        "Praia dos Amores",
        "Interpraias",
        "Nova Esperança",
        "São Judas",
        "Municípios",
        "Tabuleiro",
        "Praia Brava",
      ],
      "Camboriú": [
        "Centro",
        "Taboleiro Verde",
        "Areias",
        "Cedros",
        "Monte Alegre",
        "Rio Pequeno",
        "Morretes",
        "Santa Regina",
        "Várzea do Ranchinho",
        "Limeira",
      ],
    },
  },
  
  // Integrações
  integrations: {
    gesprovWebhook: "", // URL do webhook GESPROV
    emailService: "resend", // resend ou smtp
  },
};

// Planos de internet
export const plans = [
  {
    id: "200mega",
    name: "Essencial",
    speed: 200,
    price: 79.90,
    originalPrice: 99.90,
    features: [
      "Wi-Fi 5 incluso",
      "Instalação em até 24h",
      "Suporte local",
      "Contrato de 12 meses",
    ],
    recommended: false,
    tag: null,
    idealFor: "Ideal para 1-2 pessoas, navegação e redes sociais | 12 meses de fidelidade",
  },
  {
    id: "400mega",
    name: "Família",
    speed: 400,
    price: 99.90,
    originalPrice: 129.90,
    features: [
      "Wi-Fi 5 incluso",
      "Instalação em até 24h",
      "Suporte prioritário",
      "Contrato de 12 meses",
      "2 pontos de TV grátis",
    ],
    recommended: true,
    tag: "Mais vendido",
    idealFor: "Ideal para famílias com streaming e smart home | 12 meses de fidelidade",
  },
  {
    id: "600mega",
    name: "Turbo",
    speed: 600,
    price: 129.90,
    originalPrice: 169.90,
    features: [
      "Wi-Fi 6 incluso",
      "Instalação expressa",
      "Suporte VIP 24h",
      "Contrato de 12 meses",
      "IP fixo opcional",
      "3 pontos de TV grátis",
    ],
    recommended: false,
    tag: "Gamers",
    idealFor: "Ideal para gamers, home office e streaming 4K | 12 meses de fidelidade",
  },
  {
    id: "1giga",
    name: "Ultra",
    speed: 1000,
    price: 179.90,
    originalPrice: 229.90,
    features: [
      "Wi-Fi 6 premium incluso",
      "Instalação expressa",
      "Suporte VIP 24h",
      "Contrato de 12 meses",
      "IP fixo incluso",
      "4 pontos de TV grátis",
      "Mesh adicional grátis",
    ],
    recommended: false,
    tag: "Premium",
    idealFor: "Ideal para empresas em casa, streamers e tech lovers | 12 meses de fidelidade",
  },
];


// Planos empresariais
export const businessPlans = [
  {
    id: "emp-100-ded",
    name: "100 MB Dedicado",
    speed: 100,
    price: 299.90,
    features: [
      "Link dedicado 100% garantido",
      "SLA empresarial",
      "Suporte prioritário",
      "Contrato de 12 meses",
    ],
  },
  {
    id: "emp-200-ded-ip",
    name: "200 MB Dedicado + IP Fixo",
    speed: 200,
    price: 399.90,
    features: [
      "Link dedicado 100% garantido",
      "IP Fixo incluso",
      "SLA empresarial",
      "Suporte prioritário",
      "Contrato de 12 meses",
    ],
  },
  {
    id: "emp-300-ded-ip",
    name: "300 MB Dedicado + IP Fixo",
    speed: 300,
    price: 499.90,
    features: [
      "Link dedicado 100% garantido",
      "IP Fixo incluso",
      "SLA empresarial",
      "Suporte prioritário",
      "Contrato de 12 meses",
    ],
  },
  {
    id: "emp-500-ded-ip",
    name: "500 MB Dedicado + IP Fixo",
    speed: 500,
    price: 799.90,
    features: [
      "Link dedicado 100% garantido",
      "IP Fixo incluso",
      "SLA empresarial 24h",
      "Gerente de conta",
      "Contrato de 12 meses",
    ],
  },
];

// Perguntas do quiz de recomendação
export const quizQuestions = [
  {
    id: "people",
    question: "Quantas pessoas usam a internet na sua casa?",
    options: [
      { value: 1, label: "1-2 pessoas", points: 1 },
      { value: 2, label: "3-4 pessoas", points: 2 },
      { value: 3, label: "5+ pessoas", points: 3 },
    ],
  },
  {
    id: "streaming",
    question: "Vocês assistem streaming (Netflix, YouTube, etc)?",
    options: [
      { value: 1, label: "Raramente", points: 0 },
      { value: 2, label: "Às vezes", points: 1 },
      { value: 3, label: "Sempre, em várias telas", points: 2 },
    ],
  },
  {
    id: "gaming",
    question: "Alguém joga online na casa?",
    options: [
      { value: 1, label: "Não", points: 0 },
      { value: 2, label: "Casual", points: 1 },
      { value: 3, label: "Competitivo/Streaming", points: 3 },
    ],
  },
  {
    id: "homeoffice",
    question: "Tem home office ou reuniões online?",
    options: [
      { value: 1, label: "Não", points: 0 },
      { value: 2, label: "Às vezes", points: 1 },
      { value: 3, label: "Diariamente", points: 2 },
    ],
  },
];

// Depoimentos de clientes
export const testimonials = [
  {
    id: 1,
    name: "Marcos Silva",
    location: "Centro, Balneário Camboriú",
    rating: 5,
    text: "Melhor internet que já tive! Instalação foi super rápida e o técnico muito educado. Recomendo demais!",
    avatar: null,
  },
  {
    id: 2,
    name: "Ana Paula Costa",
    location: "Pioneiros, BC",
    rating: 5,
    text: "Trabalho com design e preciso de conexão estável. A Parceiros nunca me deixou na mão. Suporte excelente!",
    avatar: null,
  },
  {
    id: 3,
    name: "Roberto Mendes",
    location: "Camboriú",
    rating: 5,
    text: "Vim de outra operadora que vivia caindo. Aqui é diferente, estabilidade total e preço justo.",
    avatar: null,
  },
  {
    id: 4,
    name: "Juliana Ferreira",
    location: "Barra Sul, BC",
    rating: 5,
    text: "Meus filhos jogam online e nunca reclamaram de lag. Instalação foi no mesmo dia que liguei!",
    avatar: null,
  },
];

// FAQs
export const faqs = [
  {
    question: "Qual o prazo de instalação?",
    answer: "A instalação é realizada em até 24 horas após a aprovação do cadastro, dependendo da disponibilidade técnica na sua região.",
  },
  {
    question: "Tem taxa de instalação?",
    answer: "Não cobramos taxa de instalação para planos residenciais. A instalação é 100% gratuita!",
  },
  {
    question: "Preciso de fidelidade?",
    answer: "Sim. Todos os planos têm fidelidade de 12 meses, com multa de 10% sobre o valor dos meses restantes em caso de cancelamento antecipado.",
  },
  {
    question: "O Wi-Fi está incluso?",
    answer: "Sim! Todos os planos incluem roteador Wi-Fi em comodato, sem custo adicional.",
  },
  {
    question: "Como funciona o suporte?",
    answer: "Oferecemos suporte via WhatsApp, telefone e chat. Para planos Turbo e Ultra, o suporte é 24 horas.",
  },
  {
    question: "Vocês atendem empresas?",
    answer: "Sim! Temos planos específicos para empresas com IP fixo, SLA garantido e suporte prioritário.",
  },
];
