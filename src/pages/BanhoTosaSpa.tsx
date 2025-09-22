import { ArrowLeft, Sparkles, Heart, Shield, Droplets, Zap, Leaf, Waves, Bath, Scissors, Wind, Brush, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BanhoTosaSpa() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const services = [
    {
      id: 'banho-tradicional',
      title: 'BANHO',
      icon: Droplets,
      color: 'from-blue-500 to-blue-700',
      bgColor: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      description: 'Ambiente tranquilo, cromoterapia e aromaterapia garantem relaxamento de verdade. Nossa equipe é treinada para acolher, entender e respeitar a personalidade única do seu amigo – porque cada pet merece um cuidado só dele!',
      features: [
        {
          icon: Shield,
          title: 'Produtos Premium',
          description: 'Utilizamos apenas produtos Hydra e nossas duchas Pure Shower: água ultralimpinha e suave, livre de impurezas.',
          color: 'text-purple-600'
        },
        {
          icon: Heart,
          title: 'Benefícios',
          description: 'Mais conforto, brilho e saúde para pelo e pele, evitando irritações e realçando ainda mais a beleza natural após o banho!',
          color: 'text-green-600'
        }
      ],
      includes: [
        'Escovação dos dentinhos (traga a escova e creme dental)',
        'Corte de unhas profissional'
      ]
    },
    {
      id: 'banho-ozonio',
      title: 'BANHO DE OZÔNIO',
      icon: Zap,
      color: 'from-emerald-500 to-emerald-700',
      bgColor: 'from-emerald-50 to-emerald-100',
      iconColor: 'text-emerald-600',
      description: 'Mais saúde para a pele e o pelo do seu pet! O banho de ozônio ajuda a tratar alergias, dermatites, feridas e odores, promovendo uma limpeza profunda, alívio de coceiras e rápida cicatrização.',
      features: [
        {
          icon: Leaf,
          title: 'Tratamento Terapêutico',
          description: 'Ideal para pets com alergias, dermatites e problemas de pele, proporcionando alívio imediato.',
          color: 'text-emerald-600'
        },
        {
          icon: Shield,
          title: 'Ação Antimicrobiana',
          description: 'O ozônio elimina bactérias, fungos e vírus, promovendo uma limpeza profunda e cicatrização rápida.',
          color: 'text-blue-600'
        }
      ],
      includes: [
        'Limpeza profunda com ozônio',
        'Alívio de coceiras e irritações',
        'Tratamento de feridas e dermatites',
        'Eliminação de odores'
      ]
    },
    {
      id: 'hidratacao',
      title: 'HIDRATAÇÃO',
      icon: Waves,
      color: 'from-purple-500 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100',
      iconColor: 'text-purple-600',
      description: 'Seu pet com pelos macios, brilhantes e super hidratados! Aqui a hidratação é especial: usamos a linha Hydra, referência em qualidade e carinho para pets!',
      features: [
        {
          icon: Sparkles,
          title: 'Linha Hydra Premium',
          description: 'Temos várias opções de hidratação e podemos indicar a melhor para o seu pet, garantindo resultados excepcionais.',
          color: 'text-purple-600'
        },
        {
          icon: Heart,
          title: 'Cuidado Especial',
          description: 'Além de deixar os pelos macios, brilhantes e super hidratados, a hidratação ajuda a evitar nós e facilita o cuidado diário.',
          color: 'text-pink-600'
        }
      ],
      includes: [
        'Análise personalizada do tipo de pelo',
        'Hidratação com produtos linha Hydra',
        'Tratamento anti-nós',
        'Finalização com brilho natural'
      ]
    },
    {
      id: 'banho-ofuro',
      title: 'BANHO DE OFURÔ',
      icon: Bath,
      color: 'from-orange-500 to-orange-700',
      bgColor: 'from-orange-50 to-orange-100',
      iconColor: 'text-orange-600',
      description: 'No Romeu e Julieta Pet&Spa, o banho de ofurô é mais que limpeza: é um ritual de relaxamento e hidratação profunda. Utilizamos água morna e essências naturais para acalmar e revitalizar, respeitando sempre o bem-estar do seu melhor amigo.',
      features: [
        {
          icon: Heart,
          title: 'Ritual de Relaxamento',
          description: 'O ofurô reduz o estresse, melhora a circulação e promove saúde e conforto para seu pet.',
          color: 'text-orange-600'
        },
        {
          icon: Droplets,
          title: 'Essências Naturais',
          description: 'Água morna com essências naturais para acalmar e revitalizar, proporcionando uma experiência única e exclusiva.',
          color: 'text-blue-600'
        }
      ],
      includes: [
        'Banho em ofurô com água morna',
        'Essências naturais relaxantes',
        'Massagem terapêutica durante o banho',
        'Ambiente tranquilo e acolhedor'
      ]
    },
    {
      id: 'desembolo',
      title: 'DESEMBOLO',
      icon: Scissors,
      color: 'from-pink-500 to-pink-700',
      bgColor: 'from-pink-50 to-pink-100',
      iconColor: 'text-pink-600',
      description: 'Cuidar dos nozinhos do seu Pet de maneira cuidadosa e delicada. Além de valorizar o visual, o desembolo previne irritações na pele, facilita o cuidado diário e garante que seu pet fique com o pelo leve, bonito e muito mais saudável.',
      features: [
        {
          icon: Heart,
          title: 'Cuidado Delicado',
          description: 'Técnica especializada para remover nós sem causar desconforto ou dor ao seu pet.',
          color: 'text-pink-600'
        },
        {
          icon: Shield,
          title: 'Prevenção de Irritações',
          description: 'Além de valorizar o visual, previne irritações na pele e facilita o cuidado diário.',
          color: 'text-purple-600'
        }
      ],
      includes: [
        'Análise do estado dos pelos',
        'Remoção cuidadosa de nós e emaranhados',
        'Técnicas especializadas sem dor',
        'Finalização com escovação suave'
       ]
     },
     {
       id: 'remocao-subpelo',
       title: 'REMOÇÃO DE SUBPELO',
       icon: Wind,
       color: 'from-teal-500 to-teal-700',
       bgColor: 'from-teal-50 to-teal-100',
       iconColor: 'text-teal-600',
       description: 'A remoção de subpelo deixa a pelagem do pet mais saudável e bonita, reduzindo aqueles pelos soltos pela casa, prevenindo nós e facilitando a oxigenação da pele, evitando irritações, dermatites e desconfortos.',
       features: [
         {
           icon: Leaf,
           title: 'Oxigenação da Pele',
           description: 'Com técnicas específicas, eliminamos o excesso de subpelo sem danificar o pelo principal, ajudando a pele a respirar melhor.',
           color: 'text-teal-600'
         },
         {
           icon: Heart,
           title: 'Conforto e Bem-estar',
           description: 'Mantém o pet fresco, leve e pronto para aproveitar cada momento, evitando irritações e desconfortos.',
           color: 'text-green-600'
         }
       ],
       includes: [
         'Análise do tipo de pelagem',
         'Técnicas específicas de remoção',
         'Preservação do pelo principal',
          'Finalização com escovação especializada'
        ]
      },
      {
        id: 'tosa',
        title: 'TOSA',
        icon: Brush,
        color: 'from-indigo-500 to-indigo-700',
        bgColor: 'from-indigo-50 to-indigo-100',
        iconColor: 'text-indigo-600',
        description: 'A tosa vai muito além de aparência: é um cuidado essencial para a saúde, o conforto e o bem-estar do seu pet. Com técnicas delicadas e equipamentos apropriados, garantimos um corte bonito, harmônico e adaptado ao perfil de cada animal.',
        features: [
          {
            icon: Sparkles,
            title: 'Técnicas Delicadas',
            description: 'Equipamentos apropriados e técnicas especializadas respeitando padrão de raça ou preferências da família.',
            color: 'text-indigo-600'
          },
          {
            icon: Heart,
            title: 'Saúde e Bem-estar',
            description: 'Ajuda a evitar nós, reduz a queda de pelos, facilita a limpeza e deixa seu pet pronto para encantar.',
            color: 'text-purple-600'
          }
        ],
        includes: [
          'Análise do tipo de pelagem e padrão',
          'Corte harmônico e personalizado',
           'Técnicas respeitosas e delicadas',
           'Finalização com escovação e perfumação'
         ]
       },
       {
         id: 'reiki',
         title: 'REIKI',
         icon: Sun,
         color: 'from-amber-500 to-amber-700',
         bgColor: 'from-amber-50 to-amber-100',
         iconColor: 'text-amber-600',
         description: 'O Reiki é um momento de conexão profunda, cuidado e energia positiva para o seu pet. A técnica, suave e não invasiva, promove equilíbrio emocional, reduz ansiedade e auxilia na recuperação física, proporcionando mais calma, confiança e qualidade de vida.',
         features: [
           {
             icon: Heart,
             title: 'Equilíbrio Emocional',
             description: 'Técnica suave e não invasiva que promove equilíbrio emocional, reduz ansiedade e proporciona mais calma e confiança.',
             color: 'text-amber-600'
           },
           {
             icon: Sparkles,
             title: 'Energia Positiva',
             description: 'Momento de conexão profunda com energia positiva, realizado por profissionais especializados em ambiente acolhedor.',
             color: 'text-orange-600'
           }
         ],
         includes: [
           'Sessão com profissional especializado',
           'Ambiente acolhedor e seguro',
           'Técnica suave e não invasiva',
           'Cuidado personalizado para cada pet'
         ]
       }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Banho, Tosa & Spa
          </h1>
          <p className="text-gray-600 mt-2">Cuidado completo e relaxante para o seu pet</p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Grid de serviços */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header do card */}
              <div className={`h-32 bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                <div className="text-center text-white">
                  <service.icon className="w-12 h-12 mx-auto mb-2 opacity-90" />
                  <h2 className="text-xl font-bold">{service.title}</h2>
                </div>
              </div>

              {/* Conteúdo do card */}
              <div className="p-6">
                {/* Descrição principal */}
                <div className={`bg-gradient-to-r ${service.bgColor} rounded-xl p-4 mb-6`}>
                  <p className="text-gray-700 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-6">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <feature.icon className={`w-5 h-5 ${feature.color} mt-1 flex-shrink-0`} />
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Serviços inclusos */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm">
                    ✨ Incluso neste serviço:
                  </h4>
                  <ul className="space-y-2">
                    {service.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Pronto para agendar?
          </h3>
          <p className="text-gray-600 mb-6">
            Proporcione ao seu pet uma experiência única de relaxamento e cuidado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200">
              Agendar Agora
            </button>
            <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200">
              Falar no WhatsApp
            </button>
            <button 
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}