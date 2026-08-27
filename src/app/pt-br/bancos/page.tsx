import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import VideoDemo from "@/components/landing/VideoDemo";
import Footer from "@/components/landing/Footer";
import FaqSection from "@/components/landing/FaqSection";
import Link from "next/link";
import { CloudUpload, Download, PencilLine, Grid3X3, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Conversor de Extrato Bancário para Excel e CSV | Grátis Online",
  description:
    "Converta extratos bancários em PDF para Excel ou CSV. Revise e edite transações antes de exportar uma planilha organizada.",
  alternates: {
    canonical: "https://www.bankstatementtoexcelconverter.com/pt-br/bancos",
    languages: {
      "pt-BR": "https://www.bankstatementtoexcelconverter.com/pt-br/bancos",
      "x-default": "https://www.bankstatementtoexcelconverter.com/",
    },
  },
  openGraph: {
    title: "Conversor de Extrato Bancário para Excel",
    description:
      "Extraia transações de extratos PDF para Excel ou CSV e revise os dados antes de baixar.",
    url: "https://www.bankstatementtoexcelconverter.com/pt-br/bancos",
    siteName: "StatementToExcel",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://bankstatementtoexcelconverter.com/icon-512.png",
        width: 512,
        height: 512,
        alt: "Conversor de Extrato Bancário para Excel",
      },
    ],
  },
};

const portugueseSteps = [
  {
    icon: CloudUpload,
    title: "1. Baixe o extrato em PDF",
    description:
      "Entre no aplicativo ou internet banking do seu banco, escolha a conta e o período desejado e faça o download do extrato em PDF. Sempre que possível, use o arquivo original baixado do banco em vez de uma captura de tela.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: Grid3X3,
    title: "2. Envie o PDF do extrato",
    description:
      "Clique em “Converter extrato bancário” e envie o documento. Um PDF digital, com texto selecionável e tabelas legíveis, normalmente oferece um resultado mais fácil de revisar.",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
  },
  {
    icon: PencilLine,
    title: "3. Confira as transações na tabela",
    description:
      "Revise datas, descrições, débitos, créditos e saldos. Se alguma descrição estiver incompleta ou se uma data precisar de ajuste, faça a correção na visualização antes de baixar o arquivo.",
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
  },
  {
    icon: Download,
    title: "4. Exporte para Excel ou CSV",
    description:
      "Escolha Excel (.xlsx) para trabalhar com filtros, fórmulas e relatórios. Escolha CSV para obter uma estrutura simples de dados, útil para importações e outros fluxos de trabalho.",
    color: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
  },
];

const ptBanks = [
  "Banco do Brasil",
  "Caixa Econômica Federal",
  "Itaú",
  "Bradesco",
  "Santander Brasil",
  "Nubank",
  "Banco Inter",
  "C6 Bank",
  "BTG Pactual",
  "Banco Safra",
  "Sicredi",
  "Sicoob",
  "Banrisul",
  "Banco Original",
  "Neon",
  "PagBank",
  "Mercado Pago",
  "Next",
  "PicPay",
  "Banco Pan",
  "Banco BV",
  "Daycoval",
];

const ptFaqs = [
  {
    question: "Como converter extrato bancário PDF para Excel?",
    answer:
      "Baixe o extrato em PDF pelo aplicativo ou internet banking, envie o arquivo para o conversor, confira as transações na prévia editável e escolha a exportação em Excel ou CSV.",
  },
  {
    question: "Posso converter extrato bancário para Excel grátis?",
    answer:
      "Consulte as condições mostradas na ferramenta no momento do envio. O fluxo é simples: envie o PDF, revise os dados e exporte no formato disponível.",
  },
  {
    question: "O conversor funciona com extrato de Nubank, Itaú, Bradesco, Caixa e Banco do Brasil?",
    answer:
      "Você pode enviar o PDF do seu banco e conferir a prévia. Como o layout pode mudar conforme a instituição, a conta e o período, revise as transações antes de exportar.",
  },
  {
    question: "Posso converter um extrato bancário digitalizado?",
    answer:
      "Sim, arquivos digitalizados podem ser processados quando o texto e os números estão legíveis. Para melhores resultados, use uma digitalização nítida, com páginas retas e boa resolução, e revise todos os dados antes de usar a planilha.",
  },
  {
    question: "Qual é a diferença entre Excel e CSV?",
    answer:
      "Excel é melhor para análise, fórmulas, filtros e relatórios. CSV é um arquivo simples, normalmente usado para processamento ou importação. Os dois podem organizar os mesmos dados de transação, mas a formatação é diferente.",
  },
  {
    question: "Posso importar o CSV em qualquer sistema contábil?",
    answer:
      "Não necessariamente. Cada sistema pode exigir colunas, formatos de data, separadores e categorias diferentes. Confira a documentação do sistema e faça uma importação de teste com poucos dados antes de importar o extrato completo.",
  },
  {
    question: "O arquivo Excel substitui o extrato original do banco?",
    answer:
      "Não. A planilha serve para organização e análise. Para empréstimos, vistos, auditorias, imposto de renda ou comprovação oficial, mantenha o PDF original e verifique quais documentos são exigidos pela instituição responsável.",
  },
  {
    question: "O que fazer se uma transação estiver errada ou incompleta?",
    answer:
      "Corrija a linha na prévia, compare-a com o PDF original e revise os saldos. Se o problema estiver em várias linhas, tente baixar novamente o extrato diretamente do banco e enviar uma versão mais nítida.",
  },
  {
    question: "Como conferir se os dados extraídos estão corretos?",
    answer:
      "Compare o saldo inicial e final com o PDF e revise uma amostra de movimentações, especialmente valores altos, tarifas, transferências Pix e operações próximas à troca de página.",
  },
  {
    question: "Posso usar a planilha para conciliação bancária?",
    answer:
      "Sim. Organize as transações por data, descrição e valor, depois compare-as com os lançamentos internos. Faça a revisão final usando o extrato original como referência.",
  },
];

export default function PtBrBanksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: ptFaqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        }}
      />
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.bankstatementtoexcelconverter.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Brasil",
                item: "https://www.bankstatementtoexcelconverter.com/pt-br/bancos",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Conversor de Extrato Bancário",
              },
            ],
          }),
        }}
      />

      <Navbar />

      <main className="flex-grow">
        {/* ── Hero ── */}
        <Hero
          badgeText="Conversor confiável para contabilidade e controle financeiro"
          headline={
            <>
              Conversor de Extrato Bancário para{" "}
              <span className="gradient-text">Excel e CSV</span>
            </>
          }
          subheadline="Converta seu extrato bancário em PDF para uma planilha Excel ou CSV organizada. Envie o arquivo, revise as transações em uma tabela editável e exporte no formato que funciona melhor para você."
          ctaText="Converter extrato bancário"
          ctaSecondaryText="Ver método"
          trustBadges={[
            "Revise e edite os dados antes de exportar",
            "Baixe em Excel (.xlsx) ou CSV",
            "Organize transações sem copiar e colar manualmente",
            "Use seu extrato PDF original para melhores resultados",
          ]}
          ctaLink="/app"
        />

        {/* ── Video Demo ── */}
        <VideoDemo />

        {/* ── Section 1 ── */}
        <section className="py-20 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Converta extratos bancários PDF para Excel ou CSV
            </h2>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              Um extrato bancário em PDF é útil para consultar movimentações, mas nem sempre é prático para analisar gastos, separar receitas, conciliar lançamentos ou preparar informações para contabilidade. Copiar cada linha do PDF para uma planilha consome tempo e pode causar problemas: datas podem mudar de formato, descrições longas podem quebrar linhas e valores podem cair na coluna errada.
            </p>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              Este conversor de extrato bancário para Excel ajuda a transformar o conteúdo de um PDF em uma tabela mais fácil de revisar. Depois de enviar o arquivo, você pode conferir as transações, ajustar dados quando necessário e baixar o resultado em Excel ou CSV.
            </p>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              O formato Excel é uma boa escolha para filtrar despesas, criar fórmulas, montar relatórios e organizar informações por mês. O CSV é útil quando você precisa de um arquivo simples para importar, processar ou abrir em diferentes programas. Em ambos os casos, mantenha o PDF original guardado e valide os dados antes de usá-los para fins contábeis, financeiros ou oficiais.
            </p>
            <p className="text-lg text-slate-600 leading-8">
              No mercado financeiro brasileiro, a conciliação de transações Pix, transferências TED ou DOC e pagamentos de boletos exige máxima precisão. Fazer isso manualmente digitando valor por valor em uma planilha aumenta as chances de erros de digitação, como trocar vírgulas por pontos ou omitir centavos. Ao automatizar a leitura do PDF e permitir que você revise as informações na hora, o fluxo de trabalho fica mais dinâmico e seguro.
            </p>
          </div>
        </section>

        {/* ── Section 2 ── */}
        <section id="how-it-works" className="py-24 px-4 bg-slate-50/70">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <p className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
                Processo rápido e simples
              </p>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                Como converter um extrato bancário para Excel
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Quatro passos simples para transformar o PDF do seu extrato bancário em dados organizados
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {portugueseSteps.map((step, i) => (
                <div
                  key={i}
                  className="relative rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bgLight}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color}`}>
                        <step.icon size={22} className="text-white" />
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3 ── */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              O que você pode organizar na planilha
</h2>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              Cada banco apresenta o extrato de uma forma diferente. Algumas instituições usam uma coluna única para valores; outras separam entradas e saídas. Algumas mostram o saldo após cada movimentação, enquanto outras exibem apenas o saldo inicial e final. A revisão antes da exportação é importante justamente por isso.
            </p>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              Uma planilha bem organizada pode reunir campos como:
            </p>
            <ul className="grid sm:grid-cols-2 gap-4 text-slate-600 mb-8 list-none pl-0">
              {[
                "Data da transação",
                "Data de lançamento ou data de compensação",
                "Descrição da operação",
                "Valor de entrada ou crédito",
                "Valor de saída ou débito",
                "Saldo disponível ou saldo após a transação",
                "Identificadores e referências exibidos no extrato",
                "Transferências Pix",
                "TED, DOC e transferências entre contas",
                "Pagamentos de boleto",
                "Compras no débito ou cartão, quando constarem no documento",
                "Tarifas, impostos, juros e estornos",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-lg text-slate-600 leading-8">
              O objetivo não é substituir o documento bancário oficial. O objetivo é fornecer uma versão organizada para análise, conciliação e revisão. Antes de enviar uma planilha a um contador, banco, empresa ou órgão público, confirme se a instituição exige o extrato original em PDF ou outro documento emitido pelo banco.
            </p>
          </div>
        </section>

        {/* ── Section 4 ── */}
        <section className="py-24 px-4 bg-slate-50/50">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="mb-10 text-center">
              <p className="mb-3 inline-flex rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                Extratos Brasileiros
              </p>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                Funciona com extratos de bancos brasileiros?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Você pode experimentar o conversor com extratos PDF de bancos e contas digitais brasileiras. O resultado depende da qualidade do arquivo, do tipo de conta e do layout usado naquele período. Por isso, confira a prévia antes de exportar.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {ptBanks.map((bank) => (
                <div
                  key={bank}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  {bank}
                </div>
              ))}
            </div>
            <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-6 text-sm text-slate-600 max-w-3xl mx-auto">
              <p className="font-semibold text-slate-800 mb-2">Nota informativa:</p>
              <p>
                A lista é apenas informativa e não garante compatibilidade com todos os tipos de conta, PDFs, versões de aplicativo ou modelos de extrato. Verifique cuidadosamente o resultado antes de utilizar os dados.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 5 ── */}
        <section className="py-20 px-4 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Excel, CSV ou OFX: qual formato escolher?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Tanto Excel quanto CSV mantêm a precisão das transações extraídas. A escolha depende da sua necessidade prática e do sistema que você planeja utilizar.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm mb-8">
              <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left p-4 font-semibold rounded-tl-2xl">Formato</th>
                    <th className="text-left p-4 font-semibold">Melhor para</th>
                    <th className="text-left p-4 font-semibold rounded-tr-2xl">O que considerar</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Excel (.xlsx)",
                      "Análise, relatórios, filtros e fórmulas",
                      "Preserva estrutura de planilha e permite edição visual",
                    ],
                    [
                      "CSV",
                      "Importação, processamento e arquivos simples",
                      "Não preserva formatação, fórmulas ou múltiplas abas",
                    ],
                    [
                      "OFX",
                      "Integração financeira quando o sistema exige OFX",
                      "Use apenas quando seu banco ou sistema disponibilizar e aceitar OFX",
                    ],
                  ].map(([format, bestFor, consider], i) => (
                    <tr key={format} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="p-4 font-medium text-slate-700 border-b border-slate-100">{format}</td>
                      <td className="p-4 text-slate-600 border-b border-slate-100">{bestFor}</td>
                      <td className="p-4 text-slate-600 border-b border-slate-100">{consider}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-lg text-slate-600 leading-8 mb-4">
              Excel e CSV atendem a necessidades diferentes. Se você quer analisar gastos, criar um controle mensal, usar tabelas dinâmicas ou preparar um relatório, escolha Excel. Se precisa apenas de colunas simples de data, descrição e valor, CSV pode ser mais conveniente.
            </p>
            <p className="text-lg text-slate-600 leading-8">
              OFX é diferente: trata-se de um formato financeiro usado por alguns bancos e softwares. Um arquivo CSV ou Excel não deve ser renomeado para OFX, porque os formatos têm estruturas diferentes. Sempre confirme qual tipo de arquivo o seu sistema aceita antes de importar dados.
            </p>
          </div>
        </section>

        {/* ── Section 6 ── */}
        <section className="py-24 px-4 bg-slate-50/50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
                Casos de Uso
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Para que usar um extrato convertido em planilha?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Facilite seu fluxo de trabalho financeiro organizando transações de maneira clara
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Conciliação bancária",
                  copy: "Compare as movimentações do extrato com vendas, notas fiscais, recibos e lançamentos internos para encontrar divergências.",
                },
                {
                  title: "Controle de gastos",
                  copy: "Filtre despesas por período, identifique cobranças recorrentes e crie categorias como alimentação, fornecedores, aluguel ou transporte.",
                },
                {
                  title: "Organização para contabilidade",
                  copy: "Prepare uma lista revisada de movimentações para compartilhar com seu contador, mantendo também os PDFs originais.",
                },
                {
                  title: "Fluxo de caixa empresarial",
                  copy: "Separe entradas, pagamentos, tarifas e transferências para entender a movimentação financeira do negócio.",
                },
                {
                  title: "Imposto de Renda e registros",
                  copy: "Use a planilha como apoio para localizar receitas, despesas, rendimentos e pagamentos. Ela não substitui comprovantes ou documentos exigidos pela Receita Federal.",
                },
                {
                  title: "Revisão de transações Pix",
                  copy: "Pesquise transferências Pix, identifique pagamentos recorrentes e confira descrições ou identificadores que aparecem no extrato.",
                },
              ].map((card, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{card.title}</h3>
                  <p className="text-sm text-slate-600 leading-7">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 7 ── */}
        <section className="py-24 px-4 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Dicas para obter uma conversão mais confiável
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Entenda como melhorar a qualidade de leitura dos seus documentos bancários
              </p>
            </div>
            <p className="text-lg text-slate-600 leading-8 mb-6">
              A qualidade do PDF influencia diretamente a facilidade de leitura das tabelas. Arquivos digitais, criados diretamente pelo banco, costumam ser melhores do que digitalizações antigas ou fotos. PDFs protegidos por senha, documentos corrompidos e layouts muito complexos também podem exigir atenção extra.
            </p>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {[
                "Use o PDF original baixado do internet banking ou aplicativo.",
                "Verifique se todas as páginas do período foram incluídas.",
                "Evite screenshots, fotos de tela e arquivos desfocados.",
                "Se o extrato foi digitalizado, prefira uma imagem clara, reta e bem iluminada.",
                "Confira o saldo inicial e o saldo final com o PDF original.",
                "Revise uma amostra de operações Pix, TED, boletos e valores altos.",
                "Confirme se as datas permanecem no formato que você precisa.",
                "Guarde o PDF original como fonte de consulta e documento de comprovação.",
              ].map((tip, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-start gap-3"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed pt-1">{tip}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-slate-600 leading-8">
              Mesmo quando a tabela parece correta, faça uma verificação rápida antes de depender dela. Compare algumas linhas com o PDF e confirme se não houve perda de página, repetição de cabeçalho ou quebra de descrição entre linhas. Essa revisão é especialmente importante para extratos digitalizados ou com muitas páginas.
            </p>
          </div>
        </section>

        {/* ── Section 8 FAQ ── */}
        <FaqSection
          title="Perguntas frequentes"
          subtitle="Tudo o que você precisa saber sobre a conversão de extratos bancários PDF em Excel ou CSV."
          items={ptFaqs}
          variant="cards"
        />

        {/* ── Section 9 (Final CTA) ── */}
        <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Converta seu extrato bancário agora
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Envie seu extrato bancário em PDF, confira as transações em uma tabela editável e baixe uma planilha em Excel ou CSV.
            </p>
            <Link
              href="/app"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
            >
              Converter PDF para Excel
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                ↑
              </span>
            </Link>
            <p className="text-sm text-slate-500 mt-4">
              Revise seus dados antes de exportar.
            </p>
          </div>
        </section>

        {/* ── Related Tools ── */}
        <section className="py-16 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Ferramentas relacionadas</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { href: "/", label: "Conversor de extrato bancário para Excel" },
                { href: "/banks/in", label: "Conversor de extratos bancários da Índia" },
                { href: "/banks/in/canara-bank", label: "Exemplo de conversão de extrato bancário" },
                { href: "/ar-kw/banks", label: "Conversor de extrato bancário do Kuwait" },
                { href: "/ar-bh/banks", label: "Conversor de extrato bancário do Bahrein" },
                { href: "/ar-jo/banks", label: "Conversor de extrato bancário da Jordânia" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-slate-50 hover:border-primary-300 hover:text-primary-700 transition-colors shadow-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
