import React, { useState, useEffect } from "react";
import { useLoyalty } from "../context/LoyaltyContext.jsx";
import { Plus, Minus, UserCheck, Smartphone, Check, UserX, Receipt, Ban, Sparkles, ClipboardList, QrCode, ArrowLeft, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Рабочее место бариста (начисление и списание баллов с физической карты гостя)
export const BaristaDashboard = ({ baristaUser, users, transactions }) => {
  const { earnPoints, spendPoints } = useLoyalty();

  const [searchPhone, setSearchPhone] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  
  const [activeTab, setActiveTab] = useState(null);
  const [receiptSum, setReceiptSum] = useState("");
  const [pointsToSpend, setPointsToSpend] = useState("");
  
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Сброс полей ввода при смене выбранного гостя
  useEffect(() => {
    setActiveTab(null);
    setReceiptSum("");
    setPointsToSpend("");
    setActionError("");
    setSuccessMsg("");
  }, [selectedGuest]);

  // Срабатывание автоматического быстрого поиска гостя при вводе полного номера
  useEffect(() => {
    const cleanSearch = searchPhone.replace(/\D/g, "");
    if (cleanSearch.length >= 11) {
      const match = users.find(
        (u) => u.role === "guest" && u.phone.replace(/\D/g, "") === cleanSearch
      );
      if (match) {
        setSelectedGuest(match);
        setActionError("");
      } else {
        setSelectedGuest(null);
      }
    } else {
      setSelectedGuest(null);
    }
  }, [searchPhone, users]);

  // Форматирование телефонного номера бариста при вводе символов
  const handlePhoneSearchChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length === 0) {
      setSearchPhone("");
      setSelectedGuest(null);
      return;
    }
    if (input.startsWith("8")) {
      input = "7" + input.substring(1);
    } else if (!input.startsWith("7")) {
      input = "7" + input;
    }
    input = input.substring(0, 11);

    let formatted = "+7";
    if (input.length > 1) formatted += " (" + input.substring(1, 4);
    if (input.length > 4) formatted += ") " + input.substring(4, 7);
    if (input.length > 7) formatted += "-" + input.substring(7, 9);
    if (input.length > 9) formatted += "-" + input.substring(9, 11);

    setSearchPhone(formatted);
    setActionError("");
    setSuccessMsg("");
  };

  // Метод быстрого клика по гостю из таблицы для эмуляции работы
  const handleQuickSelectGuest = (guest) => {
    setSearchPhone(guest.phone);
    setSelectedGuest(guest);
    setActionError("");
    setSuccessMsg("");
  };

  // Расчет начисляемых баллов (6% с покупки)
  const calculatedPointsToEarn = receiptSum ? Math.round(parseFloat(receiptSum) * 0.06) : 0;

  // Отправка операции начисления баллов
  const handleEarnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuest) {
      setActionError("Пожалуйста, сначала выберите гостя");
      return;
    }

    const val = parseFloat(receiptSum);
    if (isNaN(val) || val <= 0) {
      setActionError("Введите корректную сумму чека в рублях");
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError("");
      setSuccessMsg("");

      const tx = await earnPoints(selectedGuest.phone, val, baristaUser.id);
      
      setSuccessMsg(`Успешно начислено ${tx.points} б. гостю ${selectedGuest.name}!`);
      setReceiptSum("");
      
      const freshGuest = users.find((u) => u.id === selectedGuest.id);
      if (freshGuest) {
        setSelectedGuest(freshGuest);
      }
    } catch (err) {
      setActionError(err?.message || "Не удалось начислить баллы");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Отправка операции списания баллов
  const handleSpendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuest) {
      setActionError("Пожалуйста, сначала выберите гостя");
      return;
    }

    const val = parseInt(pointsToSpend);
    if (isNaN(val) || val <= 0) {
      setActionError("Введите целое положительное количество баллов к списанию");
      return;
    }

    if (val > selectedGuest.points) {
      setActionError(`Превышен лимит списания. Максимально доступно: ${selectedGuest.points} б.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError("");
      setSuccessMsg("");

      const tx = await spendPoints(selectedGuest.phone, val, baristaUser.id);

      setSuccessMsg(`Успешно списано ${tx.points} б. со счета гостя ${selectedGuest.name}! (Скидка ${tx.points} рублей)`);
      setPointsToSpend("");

      const freshGuest = users.find((u) => u.id === selectedGuest.id);
      if (freshGuest) {
        setSelectedGuest(freshGuest);
      }
    } catch (err) {
      setActionError(err?.message || "Не удалось списать баллы");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Список всех операций текущего бариста
  const baristaTransactions = transactions.filter(
    (t) => t.processedBy && t.processedBy.name === baristaUser.name
  );

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Адаптивная двухколоночная сетка для рабочих инструментов бариста */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Левая колонка: Пульт операций с гостем */}
        <div className="bg-white border border-[#E8E4DE] rounded-2.5xl p-5 shadow-sm space-y-4">
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#8B7363] mb-2 tracking-wider flex items-center gap-1.5 font-display">
                <Smartphone className="w-4 h-4 text-[#C68642]" /> Поиск гостя по номеру
              </label>
              <div className="relative font-mono font-bold">
                <input
                  type="text"
                  id="barista-search-phone"
                  placeholder="+7 (999) 000-00-00"
                  value={searchPhone}
                  onChange={handlePhoneSearchChange}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E4DE] focus:border-[#C68642] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C68642] rounded-xl text-base text-[#3D2B1F] placeholder-[#8B7363]/30"
                />
                {selectedGuest && (
                  <div className="absolute right-3.5 top-3.5 bg-[#F5F5F0] text-emerald-600 p-1 rounded-full border border-[#E8E4DE] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>

            <div className="relative flex items-center py-0.5">
              <div className="flex-grow border-t border-[#E8E4DE]"></div>
              <span className="flex-shrink mx-3 text-[9px] uppercase font-bold text-[#8B7363]/60 tracking-wider font-display">ИЛИ</span>
              <div className="flex-grow border-t border-[#E8E4DE]"></div>
            </div>

            <button
              type="button"
              id="barista-scan-qr-btn"
              onClick={() => setIsScanning(true)}
              className="w-full bg-[#3D2B1F] hover:bg-[#4D392E] text-[#FDFBF7] py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-[#3D2B1F] transition-all font-display active:scale-[0.99]"
            >
              <QrCode className="w-4 h-4 text-[#C68642]" />
              <span>Сканировать QR-код карты</span>
            </button>
          </div>

          {/* Быстрый выбор зарегистрированных гостей для презентации */}
          {!selectedGuest && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-[#8B7363] uppercase tracking-wider block font-display">Быстрый выбор из списка:</span>
              <div className="flex flex-wrap gap-2">
                {users
                  .filter((u) => u.role === "guest")
                  .map((g) => (
                    <button
                      key={g.id}
                      id={`quick-select-guest-${g.id}`}
                      onClick={() => handleQuickSelectGuest(g)}
                      className="text-[11px] px-3 py-1.5 bg-[#F5F5F0] hover:bg-[#E8E4DE] border border-[#E8E4DE] text-[#3D2B1F] rounded-xl transition-all cursor-pointer font-bold font-display"
                    >
                      {g.name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Профиль выбранного покупателя */}
          <AnimatePresence mode="wait">
            {selectedGuest ? (
              <motion.div
                key="guest-found-card"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#F5F5F0] border border-[#E8E4DE] rounded-2.5xl p-4 space-y-3.5 overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#8B7363] tracking-widest block font-display">Карточка Гостя</span>
                    <h3 className="text-sm font-black text-[#3D2B1F] mt-0.5 font-display">{selectedGuest.name}</h3>
                    <span className="text-xs font-semibold text-[#8B7363] font-mono">{selectedGuest.phone}</span>
                  </div>
                  <div className="bg-[#3D2B1F] text-[#FDFBF7] px-3 py-2 rounded-2xl border border-[#3D2B1F] text-center font-mono shrink-0 shadow-sm">
                    <span className="text-[9px] block font-bold text-[#E8E4DE] uppercase tracking-wider font-display">Баланс</span>
                    <span className="text-lg font-black text-[#C68642] leading-none block my-0.5">{selectedGuest.points}</span>
                    <span className="text-[9px] font-bold block opacity-75">баллов</span>
                  </div>
                </div>

                {/* Выбор начисления или списания */}
                {activeTab === null ? (
                  <div className="grid grid-cols-2 gap-3.5 pt-1.5 pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("earn");
                        setActionError("");
                        setSuccessMsg("");
                      }}
                      className="py-4 px-3 bg-[#C68642] text-white hover:bg-[#B37536] rounded-2xl font-bold uppercase tracking-wider text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group font-display"
                    >
                      <Plus className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                      <span>Пополнить</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("spend");
                        setActionError("");
                        setSuccessMsg("");
                      }}
                      className="py-4 px-3 bg-[#3D2B1F] text-[#FDFBF7] hover:bg-[#4D392E] rounded-2xl font-bold uppercase tracking-wider text-xs flex flex-col items-center justify-center gap-2 shadow-sm border border-[#3D2B1F] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group font-display"
                    >
                      <Minus className="w-5 h-5 text-[#C68642] group-hover:scale-110 transition-transform" />
                      <span>Списать</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Заголовки вкладок переключения форм */}
                    <div className="flex bg-[#F5F5F0] rounded-xl p-1 gap-1 border border-[#E8E4DE] items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(null);
                          setActionError("");
                          setSuccessMsg("");
                        }}
                        className="p-2 bg-white/80 hover:bg-white text-[#3D2B1F] rounded-lg border border-[#E8E4DE] transition-all flex items-center justify-center cursor-pointer"
                        title="Назад к выбору операции"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      
                      <button
                        type="button"
                        id="tab-earn"
                        onClick={() => {
                          setActiveTab("earn");
                          setActionError("");
                          setSuccessMsg("");
                        }}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors font-display ${
                          activeTab === "earn"
                            ? "bg-[#3D2B1F] text-[#FDFBF7] shadow-sm"
                            : "text-[#8B7363] hover:text-[#3D2B1F]"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 text-[#C68642]" /> Начисление
                      </button>
                      
                      <button
                        type="button"
                        id="tab-spend"
                        onClick={() => {
                          setActiveTab("spend");
                          setActionError("");
                          setSuccessMsg("");
                        }}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors font-display ${
                          activeTab === "spend"
                            ? "bg-[#3D2B1F] text-[#FDFBF7] shadow-sm"
                            : "text-[#8B7363] hover:text-[#3D2B1F]"
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5 text-[#C68642]" /> Списание
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeTab === "earn" && (
                        // ФОРМА НАЧИСЛЕНИЯ
                        <motion.form
                          key="earn-form"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          onSubmit={handleEarnSubmit}
                          className="space-y-3 pt-0.5"
                        >
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#8B7363] mb-1.5 tracking-wide flex items-center gap-1.5 font-display">
                              <Receipt className="w-3.5 h-3.5" /> Сумма чека покупки (₽)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                id="earn-receipt-input"
                                min="1"
                                step="1"
                                placeholder="Например, 450"
                                value={receiptSum}
                                onChange={(e) => {
                                        setReceiptSum(e.target.value);
                                        setActionError("");
                                        setSuccessMsg("");
                                }}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C68642] font-mono font-bold text-[#3D2B1F]"
                              />
                              <span className="absolute right-4 top-2.5 text-xs font-semibold text-[#8B7363]">руб.</span>
                            </div>
                          </div>

                          {calculatedPointsToEarn > 0 && (
                            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 flex items-center justify-between text-xs text-emerald-800 select-none">
                              <div className="flex items-center gap-1.5 font-display text-[11px] font-bold">
                                <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
                                <span>Будет автоматически начислено:</span>
                              </div>
                              <span className="font-mono font-black text-[#3D2B1F] text-sm animate-pulse-fast">
                                {calculatedPointsToEarn} б.
                              </span>
                            </div>
                          )}

                          <button
                            type="submit"
                            id="submit-earn-points"
                            disabled={isSubmitting || !receiptSum}
                            className="w-full bg-[#3D2B1F] hover:bg-[#4D392E] text-[#FDFBF7] py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-display"
                          >
                            {isSubmitting ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 text-[#C68642]" />
                                <span>Начислить {calculatedPointsToEarn > 0 ? `${calculatedPointsToEarn} баллов` : "баллы"}</span>
                              </>
                            )}
                          </button>
                        </motion.form>
                      )}

                      {activeTab === "spend" && (
                        // ФОРМА СПИСАНИЯ
                        <motion.form
                          key="spend-form"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          onSubmit={handleSpendSubmit}
                          className="space-y-3 pt-0.5"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-[10px] font-bold uppercase text-[#8B7363] tracking-wide font-display">
                                Количество баллов к списанию
                              </label>
                              <button
                                type="button"
                                onClick={() => setPointsToSpend(selectedGuest.points.toString())}
                                className="text-[10px] text-[#C68642] hover:underline font-bold font-display uppercase tracking-wider cursor-pointer font-bold"
                              >
                                Списать все ({selectedGuest.points} б.)
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type="number"
                                id="spend-points-input"
                                min="1"
                                max={selectedGuest.points}
                                step="1"
                                placeholder={`Доступно: ${selectedGuest.points}`}
                                value={pointsToSpend}
                                onChange={(e) => {
                                  setPointsToSpend(e.target.value);
                                  setActionError("");
                                  setSuccessMsg("");
                                }}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C68642] font-mono font-bold text-[#3D2B1F]"
                              />
                              <span className="absolute right-4 top-2.5 text-xs font-semibold text-[#8B7363]">баллов</span>
                            </div>
                          </div>

                          {pointsToSpend && (
                            <div className="bg-[#F5F5F0] p-3 rounded-xl border border-[#E8E4DE] flex items-center justify-between text-xs text-[#8B7363] select-none">
                              <span className="font-display font-medium">Гость получит скидку в размере:</span>
                              <span className="font-mono font-black text-[#3D2B1F] text-sm">
                                {parseInt(pointsToSpend) || 0} ₽
                              </span>
                            </div>
                          )}

                          <button
                            type="submit"
                            id="submit-spend-points"
                            disabled={isSubmitting || !pointsToSpend || parseInt(pointsToSpend) > selectedGuest.points}
                            className="w-full bg-[#3D2B1F] text-[#FDFBF7] py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md hover:bg-[#4D392E] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-display"
                          >
                            {isSubmitting ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Minus className="w-3.5 h-3.5 text-[#C68642]" />
                                <span>Списать {pointsToSpend ? `${pointsToSpend} баллов` : "баллы"}</span>
                              </>
                            )}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* Вывод статусных сообщений */}
                {actionError && (
                  <div id="barista-form-err" className="text-rose-700 bg-rose-50 text-xs p-3 rounded-xl border border-rose-200 flex items-start gap-1.5 leading-normal">
                    <Ban className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{actionError}</span>
                  </div>
                )}

                {successMsg && (
                  <div id="barista-form-success" className="text-emerald-800 bg-emerald-50 text-xs p-3 rounded-xl border border-emerald-200 flex items-start gap-1.5 leading-normal">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="guest-missing-alert"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-[#8B7363]/60 text-xs flex flex-col items-center gap-2 font-display"
              >
                <UserX className="w-9 h-9 stroke-1 text-[#8B7363]/40" />
                <span>Пожалуйста, укажите или выберите гостя, чтобы начать операцию начисления или списания</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Правая колонка: Журнал транзакций бариста */}
        <div className="space-y-3">
          <div className="flex justify-between items-center pt-0 md:pt-1 font-display">
            <h3 className="text-xs font-bold uppercase text-[#3D2B1F]/80 flex items-center gap-1">
              <ClipboardList className="w-4 h-4 text-[#C68642]" /> Ваши последние действия
            </h3>
            <span className="text-[10px] text-[#8B7363]">
              {baristaTransactions.length} операций
            </span>
          </div>

          {baristaTransactions.length === 0 ? (
            <div className="text-center py-7 bg-white border border-dashed border-[#E8E4DE] rounded-2.5xl text-[#8B7363]/60 text-xs select-none">
              Сегодня вы еще не проводили начислений или списаний
            </div>
          ) : (
            <div className="space-y-2">
              {baristaTransactions.slice(0, 5).map((t) => {
                const isPlus = t.type === "earn";
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-white border border-[#E8E4DE] rounded-xl text-xs"
                  >
                    <div className="flex flex-col gap-0.5 font-display">
                      <span className="font-semibold text-[#3D2B1F]">
                        {isPlus ? "Начисление гостю" : "Списание гостю"}
                      </span>
                      <span className="text-[10px] text-[#8B7363] font-mono font-semibold">
                        {t.userName} ({t.userPhone})
                      </span>
                      {isPlus && t.amountRub && (
                        <span className="text-[9px] text-[#8B7363]/60">Чек: {t.amountRub} ₽ (6%)</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-extrabold ${
                          isPlus ? "text-emerald-700" : "text-[#C68642]"
                        }`}
                      >
                        {isPlus ? "+" : "-"}
                        {t.points} б.
                      </span>
                      <span className="block text-[8px] text-[#8B7363]/60 mt-0.5 font-mono font-bold">
                        {new Date(t.timestamp).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Мок-сканер QR-кода */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1A110A]/85 backdrop-blur-md flex items-center justify-center p-4 text-center select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-[#FDFBF7] border border-[#E8E4DE] rounded-3xl p-6 shadow-2xl space-y-5 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C68642]/60 blur-[3px] animate-pulse z-10"></div>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C68642] z-10 animate-pulse"></div>

              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-[#F5F5F0] border border-[#E8E4DE] flex items-center justify-center mx-auto text-[#C68642] animate-bounce">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black font-display text-[#3D2B1F] uppercase tracking-wider">
                  Сканирование QR-кода гостя
                </h3>
                <p className="text-[11px] text-[#8B7363] leading-relaxed font-display">
                  Направьте камеру или выберите гостя ниже для симуляции считывания QR-кода его виртуальной карты гостя.
                </p>
              </div>

              {/* Визуальная рамка сканера */}
              <div className="relative w-44 h-44 mx-auto border border-[#E8E4DE] bg-stone-100 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#C68642]"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#C68642]"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#C68642]"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#C68642]"></div>

                <span className="absolute w-full h-[1px] bg-[#C68642] shadow-[0_0_8px_rgba(198,134,66,0.8)] animate-bounce" style={{ animationDuration: "2.4s" }}></span>

                <div className="w-16 h-16 rounded-full bg-[#C68642]/10 flex items-center justify-center">
                  <QrCode className="w-7 h-7 text-[#C68642]" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-[#8B7363]/80 uppercase tracking-widest block font-display">
                  Карты гостей для выбора:
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {users
                    .filter((u) => u.role === "guest")
                    .map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setSelectedGuest(g);
                          setSearchPhone(g.phone);
                          setIsScanning(false);
                        }}
                        className="p-2.5 bg-white hover:bg-[#F5F5F0] border border-[#E8E4DE] text-[#3D2B1F] text-[11px] font-bold rounded-xl transition-all hover:scale-[1.02] cursor-pointer truncate font-display"
                      >
                        {g.name}
                      </button>
                    ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScanning(false)}
                className="w-full bg-[#3D2B1F] hover:bg-[#4D392E] text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-transform cursor-pointer font-display active:scale-[0.99]"
              >
                Закрыть сканер
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
