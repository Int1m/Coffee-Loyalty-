import React, { useState, useEffect } from "react";
import { useLoyalty } from "../context/LoyaltyContext.jsx";
import { Coffee, MessageCircle, ArrowRight, Smartphone, KeyRound, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Компонент аутентификации гостей по номеру телефона с эмуляцией отправки СМС-кода
export const Auth = () => {
  const { login, quickLoginAs, users, isLoading } = useLoyalty();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Форматирование ввода номера телефона под российскую маску
  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Оставляем только цифры
    
    if (input.length === 0) {
      setPhone("");
      return;
    }

    // Принудительно начинаем с 7 для корректного формата
    if (input.startsWith("8")) {
      input = "7" + input.substring(1);
    } else if (!input.startsWith("7")) {
      input = "7" + input;
    }

    // Максимальная длина номера - 11 цифр (+7 (999) 999-99-99)
    input = input.substring(0, 11);

    // Применение маски: +7 (999) 999-99-99
    let formatted = "+7";
    if (input.length > 1) {
      formatted += " (" + input.substring(1, 4);
    }
    if (input.length > 4) {
      formatted += ") " + input.substring(4, 7);
    }
    if (input.length > 7) {
      formatted += "-" + input.substring(7, 9);
    }
    if (input.length > 9) {
      formatted += "-" + input.substring(9, 11);
    }

    setPhone(formatted);
    setError("");
  };

  // Таймер обратного отсчета для повторной отправки кода СМС
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Запрос кода подтверждения (проверка, нужен ли ввод имени для нового гостя)
  const handleRequestOtp = (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    
    if (digits.length < 11) {
      setError("Пожалуйста, введите корректный номер телефона (11 цифр)");
      return;
    }

    const extUser = users.find((u) => u.phone.replace(/\D/g, "") === digits);
    if (!extUser) {
      setIsRegistering(true);
      if (!name.trim()) {
        setError("Пожалуйста, введите ваше имя для регистрации");
        return;
      }
    }

    setError("");
    setOtpSent(true);
    setTimer(59);
  };

  // Подтверждение входа СМС-кодом
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 4) {
      setError("Код подтверждения должен состоять из 4 цифр");
      return;
    }

    try {
      setError("");
      await login(phone, isRegistering ? name : undefined);
    } catch (err) {
      setError(err?.message || "Ошибка при входе. Попробуйте еще раз.");
    }
  };

  // Быстрый демонстрационный вход через имитацию Telegram
  const handleTelegramLogin = async () => {
    const defaultGuest = users.find((u) => u.id === "g1");
    if (defaultGuest) {
      try {
        setError("");
        await quickLoginAs(defaultGuest.phone);
      } catch (err) {
        setError("Не удалось войти через Telegram");
      }
    }
  };

  const handleQuickLogin = async (phoneStr) => {
    try {
      setError("");
      await quickLoginAs(phoneStr);
    } catch (err) {
      setError(err?.message || "Ошибка быстрого входа");
    }
  };

  return (
    <div className="w-full flex flex-col justify-between py-4 select-none">
      <div className="text-center my-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#F5F5F0] text-[#3D2B1F] mb-3 border border-[#E8E4DE]">
          <Coffee className="w-7 h-7 text-[#C68642]" />
        </div>
        <h2 className="text-xl font-bold text-[#3D2B1F] tracking-tight font-display uppercase">Beans & Brew</h2>
        <p className="text-xs text-[#8B7363] mt-1.5 px-4 leading-relaxed">Накапливайте баллы и обменивайте их на любимый бодрящий напиток и вкусные десерты</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8E4DE] mb-6">
        <AnimatePresence mode="wait">
          {!otpSent ? (
            // Форма отправки номера телефона
            <motion.form
              key="phone-step"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleRequestOtp}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8B7363] mb-2 tracking-wider flex items-center gap-1 font-display">
                  <Smartphone className="w-3.5 h-3.5" /> Номер телефона
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone-input"
                    placeholder="+7 (999) 000-00-00"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68642] focus:bg-white text-[#3D2B1F] transition-all font-semibold text-base placeholder-[#8B7363]/40 font-mono"
                  />
                </div>
              </div>

              {/* Поле имени для новых гостей */}
              {phone.replace(/\D/g, "").length === 11 &&
                !users.some((u) => u.phone.replace(/\D/g, "") === phone.replace(/\D/g, "")) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1.5 pt-1"
                  >
                    <label className="block text-[10px] font-bold uppercase text-[#8B7363] tracking-wider font-display">
                      Ваше Имя (Регистрация нового гостя)
                    </label>
                    <input
                      type="text"
                      id="name-input"
                      placeholder="Например, Александр"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68642] focus:bg-white text-[#3D2B1F] transition-all text-sm font-semibold"
                    />
                  </motion.div>
                )}

              {error && (
                <div id="auth-err" className="text-rose-700 bg-rose-50 text-xs p-3 rounded-xl border border-rose-200 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                id="get-otp-btn"
                disabled={isLoading}
                className="w-full bg-[#3D2B1F] hover:bg-[#4D392E] text-[#FDFBF7] py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-1 font-display"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Получить SMS-код</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#E8E4DE]"></div>
                <span className="flex-shrink mx-4 text-[9px] uppercase font-bold text-[#8B7363]/60 tracking-widest font-display">Или войти через</span>
                <div className="flex-grow border-t border-[#E8E4DE]"></div>
              </div>

              <button
                type="button"
                id="tg-auth-btn"
                onClick={handleTelegramLogin}
                className="w-full border border-[#229ED9]/30 bg-[#229ED9]/5 hover:bg-[#229ED9]/10 text-[#229ED9] py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Telegram вход</span>
              </button>
            </motion.form>
          ) : (
            // Форма ввода СМС-кода
            <motion.form
              key="otp-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase text-[#8B7363] tracking-wider flex items-center gap-1 font-display">
                    <KeyRound className="w-3.5 h-3.5" /> Код подтверждения из SMS
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                      setError("");
                    }}
                    className="text-[11px] text-[#C68642] font-semibold hover:underline cursor-pointer font-display"
                  >
                    Изменить телефон
                  </button>
                </div>
                <p className="text-xs text-[#8B7363] mb-3 font-mono font-semibold">Код выслан на {phone}</p>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Введите 4 цифры"
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g).substring(0, 4);
                    setOtpCode(val);
                    setError("");
                  }}
                  disabled={isLoading}
                  className="w-full text-center tracking-[1em] indent-[0.5em] font-mono py-3.5 text-xl bg-[#FDFBF7] border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68642] focus:bg-white text-[#3D2B1F]"
                />
              </div>

              {error && (
                <div id="auth-err" className="text-[#C68642] bg-amber-50 text-xs p-3 rounded-xl border border-[#E8E4DE] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#E8E4DE] text-[11px] text-[#8B7363] flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#C68642]" />
                <span>
                  Для тестирования введите любой 4-значный код (например, <b>7777</b>).
                </span>
              </div>

              <button
                type="submit"
                id="verify-otp-btn"
                disabled={isLoading || otpCode.length !== 4}
                className="w-full bg-[#3D2B1F] hover:bg-[#4D392E] text-[#FDFBF7] py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-display"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Подтвердить вход</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                {timer > 0 ? (
                  <span className="text-xs text-[#8B7363]/60 font-semibold font-mono">
                    Отправить код повторно через {timer} сек.
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTimer(59);
                      setError("");
                    }}
                    className="text-xs text-[#C68642] font-bold hover:underline cursor-pointer font-display uppercase tracking-wider"
                  >
                    Запросить код повторно
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Быстрое демо-подключение к аккаунтам */}
      <div className="bg-[#F5F5F0] rounded-2xl p-4 border border-[#E8E4DE]">
        <h3 className="text-[10px] font-bold text-[#3D2B1F] uppercase tracking-wider text-center mb-3 font-display">
          Быстрый выбор учебного аккаунта:
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {users.map((u) => {
            let roleBadge = "";
            let roleColor = "";
            switch (u.role) {
              case "guest":
                roleBadge = "Гость";
                roleColor = "bg-[#FDFBF7] text-[#3D2B1F] border-[#E8E4DE]";
                break;
              case "barista":
                roleBadge = "Бариста";
                roleColor = "bg-[#4D392E] text-[#FDFBF7] border-[#3D2B1F]";
                break;
              case "admin":
                roleBadge = "Админ";
                roleColor = "bg-[#3D2B1F] text-[#FDFBF7] border-black";
                break;
            }
            return (
              <button
                key={u.id}
                id={`quick-login-${u.id}`}
                onClick={() => handleQuickLogin(u.phone)}
                className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E8E4DE] hover:border-[#C68642] hover:shadow-sm text-left transition-all text-xs cursor-pointer group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-[#3D2B1F] group-hover:text-[#C68642] font-display text-[11px]">
                    {u.name}
                  </span>
                  <span className="text-[10px] text-[#8B7363] font-mono">{u.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 select-none font-medium text-[10px]">
                  {u.role === "guest" && (
                    <span className="text-[10px] text-[#C68642] mr-1 font-bold font-mono">
                      {u.points} б.
                    </span>
                  )}
                  <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${roleColor} font-display`}>
                    {roleBadge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
