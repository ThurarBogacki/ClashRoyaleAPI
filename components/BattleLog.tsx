"use client";

import { useEffect, useState } from "react";
import { Crown, Swords, ShieldAlert, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface Card {
  name: string;
  level: number;
  maxLevel: number;
  iconUrls?: { medium?: string };
}

interface BattlePlayer {
  tag: string;
  name: string;
  crowns: number;
  cards?: Card[];
}

interface Battle {
  type: string;
  battleTime: string;
  gameMode?: { name: string };
  arena?: { name: string };
  team: BattlePlayer[];
  opponent: BattlePlayer[];
}

interface BattleLogProps {
  tag: string;
  playerName: string;
  accentColor?: "amber" | "indigo";
}

export default function BattleLog({ tag, playerName, accentColor = "amber" }: BattleLogProps) {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBattleLog() {
      if (!tag) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/battlelog?tag=${encodeURIComponent(tag)}`);
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "Não foi possível carregar o histórico.");
        }

        // Pega as últimas 10 partidas
        setBattles(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar partidas.");
      } finally {
        setLoading(false);
      }
    }

    loadBattleLog();
  }, [tag]);

  const isAmber = accentColor === "amber";

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Swords className={`w-4 h-4 ${isAmber ? "text-amber-400" : "text-indigo-400"}`} />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
            Últimas 10 Partidas - <span className={isAmber ? "text-amber-400" : "text-indigo-400"}>{playerName}</span>
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {battles.length} partidas
        </span>
      </div>

      {loading && (
        <div className="text-center py-6 text-xs text-slate-500 animate-pulse">
          Carregando registro de batalhas...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && battles.length === 0 && (
        <div className="text-center py-6 text-xs text-slate-500">
          Nenhuma batalha recente encontrada para este jogador.
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
          {battles.map((battle, index) => {
            const myTeam = battle.team?.[0];
            const enemy = battle.opponent?.[0];

            const myCrowns = myTeam?.crowns ?? 0;
            const enemyCrowns = enemy?.crowns ?? 0;

            let result: "WIN" | "LOSS" | "DRAW" = "DRAW";
            if (myCrowns > enemyCrowns) result = "WIN";
            else if (myCrowns < enemyCrowns) result = "LOSS";

            return (
              <div
                key={index}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                  result === "WIN"
                    ? "bg-emerald-950/20 border-emerald-800/40"
                    : result === "LOSS"
                    ? "bg-rose-950/20 border-rose-800/40"
                    : "bg-slate-950/60 border-slate-800"
                }`}
              >
                {/* Status e Modo de Jogo */}
                <div className="flex items-center gap-2.5">
                  {result === "WIN" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {result === "LOSS" && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  {result === "DRAW" && <MinusCircle className="w-4 h-4 text-slate-400 shrink-0" />}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          result === "WIN"
                            ? "text-emerald-400"
                            : result === "LOSS"
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        {result === "WIN" ? "Vitória" : result === "LOSS" ? "Derrota" : "Empate"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({battle.type || "Batalha"})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      vs <strong className="text-slate-200">{enemy?.name || "Oponente"}</strong>
                    </p>
                  </div>
                </div>

                {/* Placares e Coroas */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-white font-mono">
                      {myCrowns} - {enemyCrowns}
                    </span>
                  </div>

                  {/* Cartas/Deck Utilizado */}
                  {myTeam?.cards && myTeam.cards.length > 0 && (
                    <div className="flex -space-x-1 overflow-hidden">
                      {myTeam.cards.slice(0, 8).map((card, cIdx) => (
                        <div
                          key={cIdx}
                          title={`${card.name} (Nv. ${card.level})`}
                          className="w-5 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-300 uppercase shrink-0 overflow-hidden"
                        >
                          {card.iconUrls?.medium ? (
                            <img src={card.iconUrls.medium} alt={card.name} className="w-full h-full object-cover" />
                          ) : (
                            card.name.charAt(0)
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}