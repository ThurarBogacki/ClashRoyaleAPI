"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import BattleLog from "../../components/BattleLog";
import {
  Trophy,
  Swords,
  Shield,
  Crown,
  Medal,
  Flame,
  Clock,
  Target,
  Layers,
  Sparkles,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

interface PlayerCard {
  level?: number;
  maxLevel?: number;
  evolutionLevel?: number;
}

interface Player {
  tag: string;
  name: string;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  wins: number;
  losses: number;
  battleCount: number;
  threeCrownWins: number;
  tournamentCardsWon?: number;
  tournamentBattleCount?: number;
  challengeCardsWon?: number;
  challengeMaxWins?: number;
  arena?: { id?: number; name?: string };
  clan?: { name: string; tag: string };
  cards?: PlayerCard[];
}

interface StatComparison {
  label: string;
  key: string;
  icon: LucideIcon;
  val1: number;
  val2: number;
  displayVal1: string;
  displayVal2: string;
  winner: 1 | 2 | 0;
  detailVal1?: string;
  detailVal2?: string;
  countsForScore?: boolean;
  lowerIsBetter?: boolean;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [tag1, setTag1] = useState("#VCYJJL80C");
  const [tag2, setTag2] = useState("#VJVRUVY02");
  const [p1, setP1] = useState<Player | null>(null);
  const [p2, setP2] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2027-01-01T00:00:00").getTime();
    const update = () => {
      const distance = Math.max(0, targetDate - Date.now());
      setTimeLeft({
        dias: Math.floor(distance / 86400000),
        horas: Math.floor((distance % 86400000) / 3600000),
        minutos: Math.floor((distance % 3600000) / 60000),
        segundos: Math.floor((distance % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlayers = async () => {
    if (!tag1.trim() || !tag2.trim()) {
      setErrorMsg("Informe as tags dos dois jogadores.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setP1(null);
    setP2(null);

    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/player?tag=${encodeURIComponent(tag1.trim())}`),
        fetch(`/api/player?tag=${encodeURIComponent(tag2.trim())}`),
      ]);
      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

      if (!res1.ok || data1.error) {
        throw new Error(`Jogador 1: ${data1.error || "Não foi possível carregar a conta."}`);
      }
      if (!res2.ok || data2.error) {
        throw new Error(`Jogador 2: ${data2.error || "Não foi possível carregar a conta."}`);
      }

      setP1(data1);
      setP2(data2);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Erro ao conectar com a API da Supercell.",
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateComparisons = (player1: Player, player2: Player): StatComparison[] => {
    const percentage = (count: number, total: number) =>
      total > 0 ? Number(((count / total) * 100).toFixed(1)) : null;
    const winRate = (player: Player) => percentage(player.wins, player.battleCount);
    const lossRate = (player: Player) => percentage(player.losses, player.battleCount);
    const threeCrownRate = (player: Player) => percentage(player.threeCrownWins, player.wins);
    const cardsCount = (player: Player) => player.cards?.length ?? 0;
    const maxLevelCards = (player: Player) =>
      player.cards?.filter(
        (card) => card.level !== undefined && card.maxLevel !== undefined && card.level >= card.maxLevel,
      ).length ?? 0;
    const evolvedCards = (player: Player) =>
      player.cards?.filter((card) => (card.evolutionLevel ?? 0) > 0).length ?? 0;
    const rateLabel = (rate: number | null) => (rate === null ? "—" : `${rate}%`);
    const numberLabel = (value: number | undefined) => (value ?? 0).toLocaleString("pt-BR");

    const stats: Omit<StatComparison, "key" | "winner">[] = [
      {
        label: "Nível do Rei",
        val1: player1.expLevel || 0,
        val2: player2.expLevel || 0,
        displayVal1: `Nv. ${player1.expLevel || 0}`,
        displayVal2: `Nv. ${player2.expLevel || 0}`,
        icon: Shield,
      },
      {
        label: "Troféus atuais",
        val1: player1.trophies || 0,
        val2: player2.trophies || 0,
        displayVal1: (player1.trophies || 0).toLocaleString("pt-BR"),
        displayVal2: (player2.trophies || 0).toLocaleString("pt-BR"),
        icon: Trophy,
      },
      {
        label: "Partidas Jogadas",
        val1: player1.battleCount || 0,
        val2: player2.battleCount || 0,
        displayVal1: numberLabel(player1.battleCount || 0),
        displayVal2: numberLabel(player2.battleCount || 0),
        detailVal1: `${numberLabel(player1.wins)} vitórias`,
        detailVal2: `${numberLabel(player2.wins)} vitórias`,
        icon: Flame,
      },
      {
        label: "Taxa de vitória",
        val1: winRate(player1) ?? 0,
        val2: winRate(player2) ?? 0,
        displayVal1: rateLabel(winRate(player1)),
        displayVal2: rateLabel(winRate(player2)),
        detailVal1: `${numberLabel(player1.wins)} vitórias`,
        detailVal2: `${numberLabel(player2.wins)} vitórias`,
        icon: Flame,
      },
      {
        label: "Taxa de derrotas",
        val1: lossRate(player1) ?? 0,
        val2: lossRate(player2) ?? 0,
        displayVal1: rateLabel(lossRate(player1)),
        displayVal2: rateLabel(lossRate(player2)),
        detailVal1: `${numberLabel(player1.losses)} derrotas`,
        detailVal2: `${numberLabel(player2.losses)} derrotas`,
        icon: Target,
        lowerIsBetter: true,
      },
      {
        label: "Vitórias por 3 coroas",
        val1: threeCrownRate(player1) ?? 0,
        val2: threeCrownRate(player2) ?? 0,
        displayVal1: rateLabel(threeCrownRate(player1)),
        displayVal2: rateLabel(threeCrownRate(player2)),
        detailVal1: `${numberLabel(player1.threeCrownWins)} de ${numberLabel(player1.wins)} vitórias`,
        detailVal2: `${numberLabel(player2.threeCrownWins)} de ${numberLabel(player2.wins)} vitórias`,
        icon: Crown,
      },
      {
        label: "Cartas desbloqueadas",
        val1: cardsCount(player1),
        val2: cardsCount(player2),
        displayVal1: cardsCount(player1).toLocaleString("pt-BR"),
        displayVal2: cardsCount(player2).toLocaleString("pt-BR"),
        icon: Layers,
      },
      {
        label: "Cartas no nível máximo",
        val1: maxLevelCards(player1),
        val2: maxLevelCards(player2),
        displayVal1: maxLevelCards(player1).toLocaleString("pt-BR"),
        displayVal2: maxLevelCards(player2).toLocaleString("pt-BR"),
        icon: Medal,
      },
      {
        label: "Cartas com evolução",
        val1: evolvedCards(player1),
        val2: evolvedCards(player2),
        displayVal1: evolvedCards(player1).toLocaleString("pt-BR"),
        displayVal2: evolvedCards(player2).toLocaleString("pt-BR"),
        icon: Sparkles,
      },
    ];

    return stats.map((stat) => {
      let winner: 1 | 2 | 0 = 0;
      if (stat.countsForScore === false) {
        winner = 0;
      } else if ("lowerIsBetter" in stat && stat.lowerIsBetter) {
        if (stat.val1 < stat.val2) winner = 1;
        else if (stat.val2 < stat.val1) winner = 2;
      } else {
        if (stat.val1 > stat.val2) winner = 1;
        else if (stat.val2 > stat.val1) winner = 2;
      }

      return {
        label: stat.label,
        key: stat.label,
        icon: stat.icon,
        val1: stat.val1,
        val2: stat.val2,
        displayVal1: stat.displayVal1,
        displayVal2: stat.displayVal2,
        winner,
        detailVal1: stat.detailVal1,
        detailVal2: stat.detailVal2,
        countsForScore: stat.countsForScore,
      };
    });
  };

  const comparisons = p1 && p2 ? calculateComparisons(p1, p2) : [];
  const scoreP1 = comparisons.filter((c) => c.winner === 1 && c.countsForScore !== false).length;
  const scoreP2 = comparisons.filter((c) => c.winner === 2 && c.countsForScore !== false).length;

  return (
    <main className="arena-bg relative min-h-screen overflow-hidden p-4 font-sans text-slate-200 antialiased selection:bg-amber-500/30 md:p-8">
      <div className="arena-grid" />
      <div className="arena-aurora" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-32 h-80 w-80 rounded-full bg-blue-600/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-32 top-[520px] h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-[700px] h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-6">
        <Reveal>
          <header className="royale-panel gold-glow flex flex-col items-center justify-between gap-4 rounded-2xl p-5 sm:flex-row">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, -4, 4, 0], y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 text-xl font-black text-slate-950 shadow-lg shadow-amber-500/20"
              >
                CR
              </motion.div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  CLASH ROYALE <span className="text-amber-400">X1</span>
                </h1>
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Arena de comparação
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-black/30 px-4 py-3">
              <Clock className="h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Fim da temporada do desafio
                </p>
                <p className="font-mono text-sm font-bold text-amber-300">
                  {timeLeft.dias}d {timeLeft.horas}h {timeLeft.minutos}m {timeLeft.segundos}s
                </p>
              </div>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="royale-panel rounded-2xl p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <p className="text-xs font-black tracking-[0.18em] text-slate-300 uppercase">
                Prepare seu confronto
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <div className="w-full flex-1">
                <label className="mb-2 block text-[10px] font-black tracking-widest text-sky-300 uppercase">
                  Jogador 1 · Azul
                </label>
                <input
                  type="text"
                  value={tag1}
                  onChange={(e) => setTag1(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchPlayers()}
                  placeholder="#VCYJJL80C"
                  className="w-full rounded-xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 font-mono text-sm font-bold text-sky-200 outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
                />
              </div>

              <motion.div
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 sm:mt-6"
              >
                <Swords className="h-5 w-5 text-amber-300" />
              </motion.div>

              <div className="w-full flex-1">
                <label className="mb-2 block text-[10px] font-black tracking-widest text-purple-300 uppercase">
                  Jogador 2 · Roxo
                </label>
                <input
                  type="text"
                  value={tag2}
                  onChange={(e) => setTag2(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchPlayers()}
                  placeholder="#VJVRUVY02"
                  className="w-full rounded-xl border border-purple-400/25 bg-slate-950/80 px-4 py-3 font-mono text-sm font-bold text-purple-200 outline-none transition placeholder:text-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/15"
                />
              </div>

              <button
                onClick={fetchPlayers}
                disabled={loading}
                className="royale-button cursor-pointer mt-1 flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6 sm:w-auto"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Swords className="h-4 w-4" />
                )}
                {loading ? "BUSCANDO..." : "DUELAR"}
              </button>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden rounded-xl border border-red-500/25 bg-red-950/40 p-3 text-sm text-red-200"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </Reveal>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="royale-panel flex flex-col items-center gap-4 rounded-2xl p-10 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="rounded-full border border-amber-300/20 bg-amber-400/10 p-4"
              >
                <Swords className="h-9 w-9 text-amber-300" />
              </motion.div>
              <div>
                <h2 className="text-lg font-black text-white">Preparando a arena...</h2>
                <p className="mt-1 text-sm text-slate-400">Buscando os dados dos dois jogadores.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {p1 && p2 && !loading && !errorMsg && (
            <motion.div
              key={`${p1.tag}-${p2.tag}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
              className="space-y-6"
            >
              <Reveal>
                <div className="royale-panel gold-glow relative overflow-hidden rounded-2xl border border-amber-400/25 p-5 sm:p-6">
                  <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
                  <div className="relative flex flex-col items-center justify-between gap-5 sm:flex-row">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: [0, -7, 7, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 3.5, repeat: Infinity }}
                        className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4"
                      >
                        <Crown className="h-9 w-9 text-amber-300" />
                      </motion.div>
                      <div>
                        <p className="text-[10px] font-black tracking-[0.22em] text-amber-400 uppercase">
                          Resultado do confronto
                        </p>
                        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                          {scoreP1 > scoreP2
                            ? p1.name
                            : scoreP2 > scoreP1
                              ? p2.name
                              : "Empate Geral"}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
                          {scoreP1 === scoreP2
                            ? "A arena continua equilibrada."
                            : "A vantagem é definida pelas categorias vencidas."}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 px-7 py-3 text-center">
                      <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Placar
                      </p>
                      <div className="flex items-center gap-4 font-mono text-3xl font-black">
                        <motion.span
                          key={scoreP1}
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-sky-300"
                        >
                          {scoreP1}
                        </motion.span>
                        <span className="text-slate-600">:</span>
                        <motion.span
                          key={scoreP2}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-purple-300"
                        >
                          {scoreP2}
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { player: p1, score: scoreP1, other: scoreP2, color: "blue" as const, delay: 0.08 },
                  { player: p2, score: scoreP2, other: scoreP1, color: "purple" as const, delay: 0.16 },
                ].map(({ player, score, other, color, delay }) => (
                  <Reveal key={player.tag} delay={delay}>
                    <motion.div
                      whileHover={{ y: -5, scale: 1.01 }}
                      className={`royale-panel rounded-2xl border p-5 ${
                        color === "blue"
                          ? `blue-glow ${score > other ? "border-sky-400/50" : "border-sky-400/20"}`
                          : `purple-glow ${score > other ? "border-purple-400/50" : "border-purple-400/20"}`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className={`text-[12px] font-black tracking-[0.2em] uppercase ${color === "blue" ? "text-sky-300" : "text-purple-300"}`}>
                            {color === "blue" ? "Jogador 1 · Azul" : "Jogador 2 · Roxo"}
                          </span>
                          <h3 className="mt-1 break-words text-xl font-black text-white">{player.name}</h3>
                          <p className="mt-1 font-mono text-xs text-slate-500">{player.tag}</p>
                        </div>
                        <div className={`rounded-xl border p-3 text-center ${color === "blue" ? "border-sky-400/25 bg-sky-400/10" : "border-purple-400/25 bg-purple-400/10"}`}>
                          <Shield className={`mx-auto mb-1 h-5 w-5 ${color === "blue" ? "text-sky-300" : "text-purple-300"}`} />
                          <p className="text-[11px] font-bold text-slate-400 uppercase">Nível</p>
                          <p className="text-lg font-black text-white">{player.expLevel}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Trophy className="h-4 w-4 text-amber-300" /> Troféus
                          </div>
                          <p className="mt-1 text-xl font-black text-amber-200">{(player.trophies || 0).toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Medal className="h-4 w-4 text-amber-300" /> Recorde
                          </div>
                          <p className="mt-1 text-xl font-black text-white">{(player.bestTrophies || 0).toLocaleString("pt-BR")}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4 text-xs">
                        <span className="truncate text-slate-400">
                          Clã: <strong className="text-slate-200">{player.clan?.name || "Sem clã"}</strong>
                        </span>
                        <span className={`shrink-0 font-bold ${color === "blue" ? "text-sky-300" : "text-purple-300"}`}>
                          {score} pontos
                        </span>
                      </div>
                    </motion.div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.12}>
                <section className="royale-panel rounded-2xl p-4 sm:p-6">
                  <div className="mb-5 flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex items-center gap-2">
                      <Swords className="h-5 w-5 text-amber-300" />
                      <h3 className="text-sm font-black tracking-[0.16em] text-white uppercase">
                        Confronto atributo por atributo
                      </h3>
                      <Swords className="h-5 w-5 scale-x-[-1] text-amber-300" />
                    </div>
                    <p className="text-xs text-slate-500">A coroa indica quem venceu cada categoria.</p>
                  </div>

                  <div className="space-y-2">
                    {comparisons.map((c, index) => {
                      const Icon = c.icon;
                      const isP1 = c.winner === 1;
                      const isP2 = c.winner === 2;

                      return (
                        <motion.div
                          key={c.key}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.5) }}
                          whileHover={{ scale: 1.008, backgroundColor: "rgba(30, 41, 59, 0.65)" }}
                          className="grid grid-cols-[minmax(0,1fr)_minmax(100px,1.2fr)_minmax(0,1fr)] items-center gap-2 rounded-xl border border-slate-700/40 bg-slate-950/55 px-2 py-3 sm:px-4"
                        >
                          <div className={`flex min-w-0 items-center gap-1.5 text-left ${isP1 ? "text-sky-200" : "text-slate-300"}`}>
                            {isP1 && <Crown className="h-3.5 w-3.5 shrink-0 text-sky-300" />}
                            <span className="flex min-w-0 flex-col">
                              <span className={`truncate text-sm sm:text-base ${isP1 ? "font-black" : "font-semibold"}`}>{c.displayVal1}</span>
                              {c.detailVal1 && <span className="truncate text-[9px] text-slate-500 sm:text-[10px]">{c.detailVal1}</span>}
                            </span>
                          </div>

                          <div className="flex min-w-0 items-center justify-center gap-1.5 text-center text-[10px] font-medium text-slate-400 sm:gap-2 sm:text-xs">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-amber-300/80" />
                            <span>{c.label}</span>
                          </div>

                          <div className={`flex min-w-0 items-center justify-end gap-1.5 text-right ${isP2 ? "text-purple-200" : "text-slate-300"}`}>
                            <span className="flex min-w-0 flex-col">
                              <span className={`truncate text-sm sm:text-base ${isP2 ? "font-black" : "font-semibold"}`}>{c.displayVal2}</span>
                              {c.detailVal2 && <span className="truncate text-[9px] text-slate-500 sm:text-[10px]">{c.detailVal2}</span>}
                            </span>
                            {isP2 && <Crown className="h-3.5 w-3.5 shrink-0 text-purple-300" />}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
                {/* Histórico das Últimas Partidas de Ambos os Jogadores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <BattleLog tag={p1.tag} playerName={p1.name} accentColor="amber" />
                <BattleLog tag={p2.tag} playerName={p2.name} accentColor="indigo" />
              </div>
              </Reveal>

              <div className="pb-2 text-center">
                <p className="text-[10px] font-bold tracking-[0.28em] text-slate-600 uppercase">
                  <span className="text-amber-400/70">✦</span> Mais que números, é a sua história no Clash <span className="text-amber-400/70">✦</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!p1 && !p2 && !loading && (
          <Reveal delay={0.15}>
            <div className="royale-panel relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:py-16">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-300/25 bg-gradient-to-br from-amber-400/20 to-orange-600/10"
              >
                <Swords className="h-10 w-10 text-amber-300" />
              </motion.div>
              <h2 className="relative text-xl font-black text-white sm:text-2xl">A arena está esperando por você</h2>
              <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Informe as tags dos dois jogadores e inicie o confronto para descobrir quem domina cada categoria.
              </p>
              <div className="relative mt-5 flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Escolha seus competidores
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
