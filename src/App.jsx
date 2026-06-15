import React from "react";
import { LoyaltyProvider, useLoyalty } from "./context/LoyaltyContext.jsx";
import { Auth } from "./components/Auth.jsx";
import { GuestDashboard } from "./components/GuestDashboard.jsx";
import { BaristaDashboard } from "./components/BaristaDashboard.jsx";
import { AdminDashboard } from "./components/AdminDashboard.jsx";
import { RoleSelector } from "./components/RoleSelector.jsx";
import { Lock, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Основной контент приложения, управляющий отображением панелей в зависимости от роли
function AppContent() {
  const { currentUser, activeRole, users, transactions, quickLoginAs, isLoading } = useLoyalty();

  // Функция для быстрой симуляции входа под выбранной ролью (для удобства тестирования)
  const handleQuickLoginRole = async (targetRole) => {
    const matched = users.find((u) => u.role === targetRole);
    if (matched) {
      await quickLoginAs(matched.phone);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E4DE] py-0 sm:py-6 px-0 sm:px-4 flex items-center justify-center font-sans">
      {/* Декоративные фоновые эффекты размытия */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#3D2B1F]/3 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#C68642]/3 rounded-full blur-3xl pointer-events-none"></div>

      {/* Основной контейнер с адаптивной версткой под все устройства */}
      <div className="w-full max-w-5xl bg-[#FDFBF7] sm:rounded-3xl sm:shadow-2xl sm:border border-[#E8E4DE] text-[#3D2B1F] overflow-hidden relative flex flex-col justify-between min-h-screen sm:min-h-[780px]">

        {/* Динамическая шапка приложения */}
        <header className="bg-[#3D2B1F] text-[#FDFBF7] px-6 py-4 sm:py-5 shadow-md z-10 select-none shrink-0 border-b border-[#3D2B1F]/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C68642] flex items-center justify-center text-white">
                <span className="text-xs">☕</span>
              </div>
              <span className="font-bold tracking-tight text-[#FDFBF7] text-xs uppercase font-display">
                Beans & Brew
              </span>
            </div>

            {currentUser && (
              <div className="text-right flex items-center gap-1.5 font-display">
                <span className="text-[10px] text-[#E8E4DE] font-semibold">
                  {currentUser.name}
                </span>
                <span className="h-4 w-[1px] bg-[#E8E4DE]/30"></span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#4D392E] text-[#FDFBF7] font-bold uppercase tracking-wider border border-[#6B5344]">
                  {currentUser.role === "guest" ? "Гость" : currentUser.role === "barista" ? "Бариста" : "Админ"}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Основная прокручиваемая область контента */}
        <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 pb-28 scrollbar-none scroll-smooth">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full flex flex-col items-center justify-center py-24 text-center space-y-4"
              >
                <div className="w-10 h-10 border-4 border-[#3D2B1F]/10 border-t-[#C68642] rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-[#8B7363] uppercase tracking-widest animate-pulse">Загрузка...</p>
              </motion.div>
            ) : activeRole === "guest" ? (
              // 1. ИНТЕРФЕЙС ГОСТЯ
              currentUser ? (
                <motion.div
                  key="guest-dash"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <GuestDashboard user={currentUser} transactions={transactions} />
                </motion.div>
              ) : (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-md mx-auto w-full"
                >
                  <Auth />
                </motion.div>
              )
            ) : activeRole === "barista" ? (
              // 2. ИНТЕРФЕЙС БАРИСТА
              currentUser && currentUser.role === "barista" ? (
                <motion.div
                  key="barista-dash"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <BaristaDashboard
                    baristaUser={currentUser}
                    users={users}
                    transactions={transactions}
                  />
                </motion.div>
              ) : (
                // Экран ограничения доступа к разделу бариста
                <motion.div
                  key="barista-gate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5 text-center py-10 select-none font-display max-w-md mx-auto w-full"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F5F5F0] border border-[#E8E4DE] flex items-center justify-center text-[#3D2B1F] mx-auto shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[#3D2B1F] uppercase tracking-wide">Доступ ограничен</h3>
                    <p className="text-xs text-[#8B7363] px-6">
                      Панель обслуживания доступна только персоналу с ролью <b className="text-[#3D2B1F]">Бариста</b>.
                    </p>
                  </div>
                  <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-[#E8E4DE] text-xs text-[#8B7363] text-left space-y-2.5">
                    <p className="font-bold text-[#3D2B1F] flex items-center gap-1">
                      <Zap className="w-4 h-4 text-[#C68642] shrink-0" />
                      Тестирование: вход в один клик
                    </p>
                    <button
                      onClick={() => handleQuickLoginRole("barista")}
                      id="bypass-barista-login"
                      className="w-full py-2.5 px-3 bg-[#3D2B1F] hover:bg-[#4D392E] text-[#FDFBF7] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-[11px] uppercase tracking-wider cursor-pointer font-display"
                    >
                      <span>Войти как Бариста</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            ) : (
              // 3. ИНТЕРФЕЙС АДМИНИСТРАТОРА
              currentUser && currentUser.role === "admin" ? (
                <motion.div
                  key="admin-dash"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdminDashboard
                    adminUser={currentUser}
                    users={users}
                    transactions={transactions}
                  />
                </motion.div>
              ) : (
                // Экран ограничения доступа к разделу администратора
                <motion.div
                  key="admin-gate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5 text-center py-10 select-none font-display max-w-md mx-auto w-full"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F5F5F0] border border-[#E8E4DE] flex items-center justify-center text-[#3D2B1F] mx-auto shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[#3D2B1F] uppercase tracking-wide">Доступ ограничен</h3>
                    <p className="text-xs text-[#8B7363] px-6">
                      Панель управляющего доступна только пользователям с ролью <b className="text-[#3D2B1F]">Администратор</b>.
                    </p>
                  </div>
                  <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-[#E8E4DE] text-xs text-[#8B7363] text-left space-y-2.5">
                    <p className="font-bold text-[#3D2B1F] flex items-center gap-1">
                      <Zap className="w-4 h-4 text-[#C68642] shrink-0" />
                      Тестирование: вход в один клик
                    </p>
                    <button
                      onClick={() => handleQuickLoginRole("admin")}
                      id="bypass-admin-login"
                      className="w-full py-2.5 px-3 bg-[#3D2B1F] hover:bg-[#4D392E] text-[#FDFBF7] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-[11px] uppercase tracking-wider cursor-pointer font-display"
                    >
                      <span>Войти как Админ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </main>

        {/* Нижняя фиксированная панель выбора ролей для удобства тестирования */}
        <RoleSelector />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LoyaltyProvider>
      <AppContent />
    </LoyaltyProvider>
  );
}
