import React, { useState } from "react";
import { TransactionHistory } from "./TransactionHistory.jsx";
import { User as UserIcon, Check, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Панель гостя (личный кабинет покупателя в программе лояльности)
export const GuestDashboard = ({ user, transactions }) => {
  const [showQrFullscreen, setShowQrFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Фильтрация транзакций для конкретного залогиненного гостя
  const guestTransactions = transactions.filter((t) => t.userId === user.id);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(user.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Кодовая генерация уникального процедурного QR-кода по хэшу телефона
  const renderMockQR = (size = 140) => {
    const digitHash = Array.from(user.phone.replace(/\D/g, "")).map(Number);
    const rows = 12;
    const cols = 12;
    const squares = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isFinderLeftTop = r < 4 && c < 4;
        const isFinderRightTop = r < 4 && c >= cols - 4;
        const isFinderLeftBottom = r >= rows - 4 && c < 4;

        let filled = false;

        if (isFinderLeftTop) {
          filled = r === 0 || r === 3 || c === 0 || c === 3 || (r === 1.5 && c === 1.5) || (r >= 1 && r <= 2 && c >= 1 && c <= 2);
        } else if (isFinderRightTop) {
          filled = r === 0 || r === 3 || c === cols - 1 || c === cols - 4 || (r >= 1 && r <= 2 && c >= cols - 3 && c <= cols - 2);
        } else if (isFinderLeftBottom) {
          filled = r === rows - 1 || r === rows - 4 || c === 0 || c === 3 || (r >= rows - 3 && r <= rows - 2 && c >= 1 && c <= 2);
        } else {
          const seed = (r * cols + c + (digitHash[r % digitHash.length] || 3)) % 11;
          filled = seed === 0 || seed === 3 || seed === 5 || seed === 8;
        }

        if (filled) {
          squares.push(
            <rect
              key={`${r}-${c}`}
              x={c * 10}
              y={r * 10}
              width={10}
              height={10}
              className="fill-[#3D2B1F]"
            />
          );
        }
      }
    }

    return (
      <svg
        viewBox={`0 0 ${cols * 10} ${rows * 10}`}
        width={size}
        height={size}
        className="mx-auto"
      >
        <rect width={cols * 10} height={rows * 10} fill="#fdfbf7" rx={6} />
        {squares}
        <rect
          x={(cols / 2 - 1.2) * 10}
          y={(rows / 2 - 1.2) * 10}
          width={24}
          height={24}
          rx={12}
          fill="#fdfbf7"
        />
        <g transform={`translate(${(cols / 2 - 0.7) * 10}, ${(rows / 2 - 0.7) * 10}) scale(0.6)`}>
          <path
            d="M5 2C3 4 2 7 2 9c0 4.4 3.6 8 8 8s8-3.6 8-8c0-2-1-5-3-7"
            stroke="#3D2B1F"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M6 3c-1.5 2-2 4-2 6"
            stroke="#C68642"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Информация о текущем профиле гостя */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#F5F5F0] border border-[#E8E4DE] flex items-center justify-center text-[#3D2B1F] shadow-inner">
            <UserIcon className="w-5 h-5 text-[#8B7363]" />
          </div>
          <div>
            <span className="text-[10px] text-[#8B7363] font-semibold uppercase tracking-wider block font-display">Приветствуем вас!</span>
            <h1 className="text-base font-bold text-[#3D2B1F] line-clamp-1 font-display">{user.name}</h1>
          </div>
        </div>

        <button
          onClick={handleCopyPhone}
          id="copy-phone-profile"
          className="px-3 py-1.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E8E4DE] border border-[#E8E4DE] text-[11px] font-semibold text-[#3D2B1F] flex items-center gap-1.5 transition-all cursor-pointer font-mono font-bold"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-display">Скопирован</span>
            </>
          ) : (
            <>
              <span>{user.phone}</span>
            </>
          )}
        </button>
      </div>

      {/* Двухколоночная сетка для десктопов и планшетов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Левая колонка: Электронная карта лояльности */}
        <div className="relative overflow-hidden bg-[#3D2B1F] rounded-3xl p-5 shadow-lg text-[#FDFBF7] border border-[#3D2B1F]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#C68642]/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="absolute left-0 bottom-0 w-40 h-40 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] uppercase tracking-widest font-extrabold opacity-60 text-[#E8E4DE] font-display">
                Купоны и скидки 1 к 1
              </span>
              <div className="flex items-baseline gap-1 mt-1 font-display">
                <span className="text-3xl font-black font-mono tracking-tight text-[#C68642]">
                  {user.points}
                </span>
                <span className="text-xs font-semibold text-[#E8E4DE] ml-1">баллов</span>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#4D392E] border border-[#6B5344] text-[10px] text-[#E8E4DE] font-semibold flex items-center gap-1 font-display">
              <span>Кэшбек 6%</span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#4D392E] flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#FDFBF7] flex items-center gap-1 font-display">
                Карта Гостя
              </h3>
              <p className="text-[10px] text-[#E8E4DE]/70 leading-relaxed max-w-[190px] font-display">
                Покажите QR-код бариста для начисления или списания баллов.
              </p>
            </div>

            <button
              onClick={() => setShowQrFullscreen(true)}
              id="open-qr-card"
              className="flex flex-col items-center gap-1 p-2 bg-[#FDFBF7] hover:bg-[#F5F5F0] rounded-2xl border border-[#E8E4DE] transition-all cursor-pointer group shrink-0"
            >
              <div className="p-1 bg-[#3D2B1F] rounded-lg">
                {renderMockQR(38)}
              </div>
              <span className="text-[8px] font-bold text-[#3D2B1F] uppercase tracking-wider group-hover:text-[#C68642] flex items-center gap-0.5 font-display">
                Скан <Eye className="w-2.5 h-2.5" />
              </span>
            </button>
          </div>
        </div>

        {/* Правая колонка: История операций гостя */}
        <div className="space-y-3">
          <div className="flex justify-between items-center select-none pt-0 md:pt-1 font-display">
            <h2 className="text-xs font-bold text-[#3D2B1F] uppercase tracking-wider">
              История операций
            </h2>
            <span className="text-[10px] text-[#8B7363] font-semibold">
              {guestTransactions.length} всего
            </span>
          </div>

          <TransactionHistory transactions={guestTransactions} />
        </div>
      </div>

      {/* Большое модальное окно с QR-кодом */}
      <AnimatePresence>
        {showQrFullscreen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrFullscreen(false)}
              className="absolute inset-0 bg-[#3D2B1F] opacity-70 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#FDFBF7] border border-[#E8E4DE] rounded-3xl p-6 text-center shadow-xl z-10 space-y-5"
            >
              <div className="space-y-1 font-display">
                <h3 className="text-base font-bold text-[#3D2B1F]">Сканирование карты</h3>
                <p className="text-xs text-[#8B7363]">Покажите этот экран бариста для завершения заказа</p>
              </div>

              <div className="p-5 bg-white border border-[#E8E4DE] rounded-2.5xl inline-block shadow-sm mx-auto">
                {renderMockQR(190)}
              </div>

              <div className="space-y-1 select-none font-mono text-xs">
                <span className="font-bold text-[#3D2B1F] block">ID: {user.id}</span>
                <span className="font-semibold text-[#8B7363] whitespace-nowrap block">{user.phone}</span>
                <span className="font-bold text-[#C68642] block mt-1 font-display">Баланс: {user.points} б.</span>
              </div>

              <button
                onClick={() => setShowQrFullscreen(false)}
                id="close-qr-modal"
                className="w-full bg-[#3D2B1F] hover:bg-[#4D392E] text-[#FDFBF7] py-3 px-4 rounded-xl font-bold transition-all cursor-pointer text-xs uppercase tracking-wider font-display"
              >
                Закрыть
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
