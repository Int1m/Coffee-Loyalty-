import React, { useState } from "react";
import { ArrowDownLeft, RotateCcw, Calendar, ShoppingBag, ShieldCheck, Filter } from "lucide-react";

// Компонент истории операций накопления и списания бонусов гостя
export const TransactionHistory = ({ transactions, compact = false }) => {
  const [filterType, setFilterType] = useState("all");

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "all") return true;
    if (filterType === "earn") return t.type === "earn";
    if (filterType === "spend") return t.type === "spend";
    if (filterType === "admin") return t.type === "admin_add" || t.type === "admin_remove";
    return true;
  });

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-amber-900/40 select-none font-display">
        <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50 stroke-1" />
        <p className="text-xs font-medium">История операций пуста</p>
      </div>
    );
  }

  const filterButtons = [
    { type: "all", label: "Все" },
    { type: "earn", label: "Начисления" },
    { type: "spend", label: "Списания" },
    { type: "admin", label: "Сервисные" },
  ];

  return (
    <div className="space-y-3 select-none">
      {!compact && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-display">
          <Filter className="w-3.5 h-3.5 text-amber-900/40 shrink-0" />
          <div className="flex gap-1.5 shrink-0">
            {filterButtons.map((btn) => (
              <button
                key={btn.type}
                id={`filter-tx-${btn.type}`}
                onClick={() => setFilterType(btn.type)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-bold uppercase tracking-wider ${
                  filterType === btn.type
                    ? "bg-[#5c3e21] border-[#5c3e21] text-white"
                    : "bg-amber-500/5 hover:bg-amber-500/10 text-[#5c3e21]/70 border-amber-900/10"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-6 text-amber-800/40 text-xs font-display">
            Транзакции отсутствуют
          </div>
        ) : (
          filteredTransactions.slice(0, compact ? 4 : undefined).map((t) => {
            const isPlus = t.type === "earn" || t.type === "admin_add";
            const isAdmin = t.type === "admin_add" || t.type === "admin_remove";

            return (
              <div
                key={t.id}
                id={`tx-card-${t.id}`}
                className="flex items-center justify-between p-3 bg-stone-50 border border-amber-900/5 hover:border-amber-900/15 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isPlus
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}
                  >
                    {isAdmin ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : t.type === "earn" ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4.5 h-4.5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-amber-950 font-display">
                        {t.type === "earn" && "Начисление баллов"}
                        {t.type === "spend" && "Списание баллов"}
                        {t.type === "admin_add" && "Корректировка (+)"}
                        {t.type === "admin_remove" && "Корректировка (-)"}
                      </span>
                      
                      <span className="text-[10px] text-amber-800/60 leading-tight">
                        {t.type === "earn" && t.amountRub && (
                          <>Покупка на {t.amountRub.toLocaleString("ru-RU")} ₽</>
                        )}
                        {t.type === "spend" && <>Списано в счет скидки 1 к 1</>}
                        {isAdmin && (
                          <span className="italic text-amber-900/70">
                            Изменено админом {t.processedBy?.name}
                          </span>
                        )}
                      </span>

                      {!compact && t.processedBy && !isAdmin && (
                        <span className="text-[10px] text-amber-800/40 font-semibold mt-0.5">
                          Бариста: {t.processedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-0.5 select-none shrink-0">
                  <span
                    className={`text-sm font-extrabold font-mono ${
                      isPlus ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {isPlus ? "+" : "-"}
                    {t.points} б.
                  </span>
                  <span className="text-[9px] text-[#5c3e21]/40 flex items-center gap-1 font-medium font-mono font-semibold">
                    <Calendar className="w-2.5 h-2.5 text-amber-900/30" />
                    {formatDate(t.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
