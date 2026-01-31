import { useState } from "react";
import { quizQuestions, plans, siteConfig } from "@/lib/config";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";

export function PlanQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, points: number) => {
    const newAnswers = { ...answers, [questionId]: points };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const getRecommendedPlan = () => {
    const totalPoints = Object.values(answers).reduce((sum, points) => sum + points, 0);
    
    if (totalPoints <= 3) return plans[0]; // 200 Mega
    if (totalPoints <= 5) return plans[1]; // 400 Mega
    if (totalPoints <= 7) return plans[2]; // 600 Mega
    return plans[3]; // 1 Giga
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const scrollToPlans = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWhatsApp = (plan: typeof plans[0]) => {
    const message = encodeURIComponent(
      `Olá! Fiz o quiz e o plano recomendado foi o ${plan.name} de ${plan.speed} Mega. Gostaria de contratar!`
    );
    window.open(
      `https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  if (showResult) {
    const recommendedPlan = getRecommendedPlan();

    return (
      <section className="py-16 lg:py-24 bg-accent">
        <div className="container max-w-3xl">
          <div className="card-premium p-8 lg:p-12 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Plano ideal para você:
            </h3>
            
            <div className="inline-block bg-gradient-to-r from-primary to-primary-light text-white px-6 py-3 rounded-full mb-6">
              <span className="text-2xl font-bold">{recommendedPlan.name}</span>
              <span className="mx-2">•</span>
              <span className="text-2xl font-bold">{recommendedPlan.speed} Mega</span>
            </div>
            
            <p className="text-muted-foreground mb-8">
              {recommendedPlan.idealFor}
            </p>
            
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="text-lg text-muted-foreground">R$</span>
              <span className="text-5xl font-display font-bold text-foreground">
                {Math.floor(recommendedPlan.price)}
              </span>
              <span className="text-xl text-foreground">
                ,{(recommendedPlan.price % 1).toFixed(2).slice(2)}
              </span>
              <span className="text-lg text-muted-foreground">/mês</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleWhatsApp(recommendedPlan)}
                className="btn-primary text-lg px-8 py-4"
              >
                Contratar agora
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={scrollToPlans}
                className="btn-outline-primary text-lg px-8 py-4"
              >
                Ver todos os planos
              </button>
            </div>
            
            <button
              onClick={resetQuiz}
              className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Refazer o quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <section className="py-16 lg:py-24 bg-accent">
      <div className="container max-w-3xl">
        <div className="text-center mb-8">
          <span className="badge-primary mb-4">Descubra seu plano</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Qual plano é ideal pra você?
          </h2>
          <p className="text-muted-foreground">
            Responda algumas perguntas rápidas e descubra o plano perfeito
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Pergunta {currentQuestion + 1} de {quizQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="card-premium p-8 lg:p-12 animate-fade-in" key={currentQuestion}>
          <h3 className="font-display text-xl lg:text-2xl font-bold text-foreground text-center mb-8">
            {question.question}
          </h3>

          <div className="grid gap-4">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(question.id, option.points)}
                className={`p-4 lg:p-6 rounded-xl border-2 border-border text-left transition-all duration-300 hover:border-primary hover:bg-primary/5 ${
                  answers[question.id] === option.points
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
              >
                <span className="text-lg font-medium text-foreground">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
