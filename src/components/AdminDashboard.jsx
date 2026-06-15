import React, { useState } from "react";
import { useLoyalty } from "../context/LoyaltyContext.jsx";
import { TransactionHistory } from "./TransactionHistory.jsx";
import { Shield, Users, UserPlus, Trash2, Check, Plus, Minus, Search, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Рабочий стол Администратора / Управляющего кафе Beans & Brew
export const AdminDashboard = ({ adminUser, users, transactions }) => {
  const { registerUser, deleteUser, adminAdjustPoints, updateUserRole } = useLoyalty();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAdjustPointsModal, setShowAdjustPointsModal] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("guest");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const [selectedGuest, setSelectedGuest] = useState(null);
  const [adjustValue, setAdjustValue] = useState("");
  const [adjustError, setAdjustError] = useState("");
  const [adjustSuccess, setAdjustSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Маска автоматического форматирования ввода мобильного телефона в форму создания
  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length === 0) {
      setNewPhone("");
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

    setNewPhone(formatted);
    setRegisterError("");
  };

  // Регистрация нового аккаунта гостя или персонала
  const handleRegisterUserSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setRegisterError("Пожалуйста, введите имя пользователя");
      return;
    }
    const digits = newPhone.replace(/\D/g, "");
    if (digits.length < 11) {
      setRegisterError("Введите корректный номер телефона (11 цифр)");
      return;
    }

    try {
      setRegisterError("");
      setRegisterSuccess("");
      const created = await registerUser(newName.trim(), newPhone, newRole);
      setRegisterSuccess(`Пользователь ${created.name} успешно зарегистрирован!`);
      setNewName("");
      setNewPhone("");
      setNewRole("guest");
      setTimeout(() => setRegisterSuccess(""), 3000);
    } catch (err) {
      setRegisterError(err?.message || "Ошибка при регистрации");
    }
  };

  // Метод открытия модального окна корректировки баллов
  const openAdjustModal = (guest) => {
    setSelectedGuest(guest);
    setAdjustValue("");
    setAdjustError("");
    setAdjustSuccess("");
    setShowAdjustPointsModal(true);
  };

  // Выполнение корректировки баллов
  const handleAdjustPointsSubmit = async (isAdd) => {
    if (!selectedGuest) return;
    const val = parseInt(adjustValue);
    if (isNaN(val) || val <= 0) {
      setAdjustError("Пожалуйста, введите целое положительное число баллов");
      return;
    }

    if (!isAdd && selectedGuest.points < val) {
      setAdjustError(`Нельзя списать больше баллов, чем есть у гостя (${selectedGuest.points} б.)`);
      return;
    }

    try {
      setIsSubmitting(true);
      setAdjustError("");
      setAdjustSuccess("");

      const tx = await adminAdjustPoints(selectedGuest.id, val, isAdd, adminUser.id);
      
      setAdjustSuccess(`Успешно ${isAdd ? "начислено" : "списано"} ${tx.points} баллов!`);
      
      const modifiedUser = users.find((u) => u.id === selectedGuest.id);
      if (modifiedUser) {
        setSelectedGuest(modifiedUser);
      }
      setAdjustValue("");
    } catch (err) {
      setAdjustError(err?.message || "Ошибка при корректировке баллов");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Фильтрация пользователей по поисковому запросу и по роли
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""));
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Шапка Администратора */}
      <div className="bg-[#4a1506]/5 border border-[#4a1506]/10 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-950/10 border border-amber-950/10 flex items-center justify-center text-amber-950">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-amber-900/60 font-semibold uppercase tracking-wider block font-display">Режим Управляющего</span>
            <h2 className="text-sm font-black text-amber-950 font-display">{adminUser.name}</h2>
          </div>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          id="admin-add-user-trigger"
          className="px-3 py-1.5 bg-gradient-to-r from-[#8b5a2b] to-[#5c3e21] text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:opacity-95 cursor-pointer shadow-sm transition-all font-display uppercase tracking-wider"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Добавить</span>
        </button>
      </div>

      {/* Адаптивная двухколоночная сетка для рабочих инструментов управляющего */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Левая колонка: Ведомость пользователей системы */}
        <div className="bg-white border border-amber-900/10 rounded-2.5xl p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-1">
            <h3 className="text-xs font-bold uppercase text-amber-950 tracking-wider flex items-center gap-1.5 font-display">
              <Users className="w-4 h-4 text-amber-900" /> Ведомость пользователей ({users.length})
            </h3>
          </div>

          {/* Панель поиска */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="relative">
              <input
                type="text"
                id="admin-user-search"
                placeholder="Поиск по имени или телефону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8.5 pr-3 py-2 bg-stone-50 border border-amber-200/50 rounded-xl focus:outline-none focus:bg-white text-amber-950"
              />
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-amber-900/35" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-amber-900/40 hover:text-amber-950 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex bg-amber-900/5 rounded-xl p-0.5 border border-amber-900/5">
              {["all", "guest", "barista", "admin"].map((rl) => (
                <button
                  key={rl}
                  id={`admin-filter-role-${rl}`}
                  onClick={() => setRoleFilter(rl)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer font-display ${
                    roleFilter === rl
                      ? "bg-[#5c3e21] text-white shadow-sm"
                      : "text-amber-900/60 hover:text-amber-950"
                  }`}
                >
                  {rl === "all" ? "Все" : rl === "guest" ? "Гости" : rl === "barista" ? "Бариста" : "Админ"}
                </button>
              ))}
            </div>
          </div>

          {/* Прокручиваемый список людей */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-6 text-amber-900/40 text-xs font-display">
                Нет соответствующих пользователей в системе
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isGuest = u.role === "guest";
                let badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                let badgeLabel = "Гость";

                if (u.role === "barista") {
                  badgeColor = "bg-blue-50 text-blue-800 border-blue-100";
                  badgeLabel = "Бариста";
                } else if (u.role === "admin") {
                  badgeColor = "bg-purple-50 text-purple-800 border-purple-100";
                  badgeLabel = "Админ";
                }

                return (
                  <div
                    key={u.id}
                    id={`user-row-${u.id}`}
                    className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100/50 border border-amber-900/5 rounded-xl transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-display">
                        <span className="font-bold text-amber-950 text-xs leading-none">
                          {u.name}
                        </span>
                        {u.id === adminUser.id || u.id === "a1" ? (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${badgeColor} font-semibold leading-none`}>
                            {badgeLabel}
                          </span>
                        ) : (
                          <div className="relative inline-block">
                            <select
                              value={u.role}
                              id={`user-role-select-${u.id}`}
                              onChange={(e) => {
                                updateUserRole(u.id, e.target.value);
                              }}
                              className={`text-[9.5px] pl-1.5 pr-4 py-0.5 rounded-full border ${badgeColor} font-bold leading-none cursor-pointer focus:outline-none appearance-none bg-no-repeat transition-all hover:opacity-90 active:scale-95`}
                              style={{
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233D2B1F' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundSize: "8px",
                                backgroundPosition: "right 4.5px center",
                              }}
                            >
                              <option value="guest" className="text-amber-800 bg-white font-bold text-xs">Гость</option>
                              <option value="barista" className="text-blue-800 bg-white font-bold text-xs">Бариста</option>
                              <option value="admin" className="text-purple-800 bg-white font-bold text-xs">Админ</option>
                            </select>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-800/60 font-mono font-semibold">{u.phone}</p>
                      {isGuest && (
                        <span className="text-[10px] font-bold text-amber-900/80 font-display">
                          {u.points} балл{u.points % 10 === 1 && u.points % 100 !== 11 ? "л" : [2,3,4].includes(u.points % 10) && ![12,13,14].includes(u.points % 100) ? "а" : "ов"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 font-display">
                      {/* Кнопка корректировки (только гости) */}
                      {isGuest && (
                        <button
                          onClick={() => openAdjustModal(u)}
                          id={`btn-adjust-${u.id}`}
                          title="Корректировать баланс"
                          className="p-1 px-1.5 text-[10px] font-bold text-amber-900 hover:text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-900/15 rounded-lg flex items-center gap-0.5 transition-all cursor-pointer font-display"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>+/- Б.</span>
                        </button>
                      )}

                      {/* Кнопка удаления пользователя */}
                      {u.id !== "a1" && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          id={`btn-delete-${u.id}`}
                          title="Удалить пользователя"
                          className="p-1.5 text-rose-800 hover:text-rose-100 bg-rose-50 hover:bg-rose-950/20 border border-rose-950/5 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Правая колонка: Системный журнал логов */}
        <div className="space-y-3">
          <div className="flex justify-between items-center select-none pt-0 md:pt-1 font-display">
            <h3 className="text-xs font-bold uppercase text-amber-950 tracking-wider">
              Системный Журнал Операций (Audit LOG)
            </h3>
            <span className="text-[10px] text-amber-980/50 font-semibold font-mono font-bold">
              {transactions.length} записей
            </span>
          </div>

          <TransactionHistory transactions={transactions} />
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО 1: СОЗДАНИЕ ПЕРСОНАЛА ИЛИ ГОСТЯ */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddUserModal(false)}
              className="absolute inset-0 bg-[#1a110a] opacity-80 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#faf6f0] border border-amber-900/20 rounded-3xl p-6 text-left shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center font-display">
                <h3 className="text-base font-extrabold text-[#2c1d11]">Регистрация в системе</h3>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="p-1 rounded-full text-amber-950/40 hover:text-amber-950"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterUserSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-amber-900/60 mb-1 font-display">
                    ФИО / Псевдоним
                  </label>
                  <input
                    type="text"
                    placeholder="Например, Екатерина Смирнова"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setRegisterError("");
                    }}
                    className="w-full px-3.5 py-2.5 border border-amber-200/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8b5a2b] bg-white text-xs text-amber-950"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-amber-900/60 mb-1 font-display">
                    Номер телефона
                  </label>
                  <input
                    type="tel"
                    placeholder="+7 (999) 000-00-00"
                    value={newPhone}
                    onChange={handlePhoneChange}
                    className="w-full px-3.5 py-2.5 border border-amber-200/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8b5a2b] bg-white text-xs font-mono font-bold text-amber-950"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-amber-900/60 mb-1 font-display">
                    Системная Роль
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2.5 border border-amber-200/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8b5a2b] bg-white text-xs font-bold text-amber-950"
                  >
                    <option value="guest">Гость (Покупатель)</option>
                    <option value="barista">Бариста (Оператор)</option>
                    <option value="admin">Администратор (Управляющий)</option>
                  </select>
                </div>

                {registerError && (
                  <div className="text-rose-700 bg-rose-50 text-xs p-2.5 rounded-xl border border-rose-200 leading-snug font-display">
                    {registerError}
                  </div>
                )}

                {registerSuccess && (
                  <div className="text-emerald-800 bg-emerald-50 text-xs p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-display">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{registerSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="admin-submit-register"
                  className="w-full bg-[#5c3e21] hover:bg-[#4a3018] text-white py-3.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md font-display uppercase tracking-wider"
                >
                  Создать аккаунт
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* МОДАЛЬНОЕ ОКНО 2: СЕРВИСНАЯ КОРРЕКТИРОВКА БАЛЛОВ */}
      <AnimatePresence>
        {showAdjustPointsModal && selectedGuest && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdjustPointsModal(false)}
              className="absolute inset-0 bg-[#1a110a] opacity-85 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#faf6f0] border border-amber-900/20 rounded-3xl p-6 text-left shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-[#8b5a2b] tracking-widest font-display">
                    Корректировка баллами
                  </span>
                  <h3 className="text-base font-extrabold text-[#2c1d11] font-display">
                    {selectedGuest.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdjustPointsModal(false)}
                  className="p-1 rounded-full text-amber-950/40 hover:text-amber-950"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Текущий статус */}
              <div className="bg-white p-3 rounded-xl border border-amber-900/10 flex justify-between items-center text-xs text-amber-950 font-display">
                <span className="font-semibold">Текущий баланс на счете:</span>
                <span className="font-mono font-black text-sm">{selectedGuest.points} б.</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-amber-900/60 mb-1.5 font-display">
                    Количество баллов
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Например, 100"
                    value={adjustValue}
                    onChange={(e) => {
                      setAdjustValue(e.target.value);
                      setAdjustError("");
                      setAdjustSuccess("");
                    }}
                    className="w-full px-3.5 py-2.5 border border-amber-200/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8b5a2b] bg-white font-mono font-bold text-amber-950 text-sm"
                  />
                </div>

                {adjustError && (
                  <div id="admin-adjust-err" className="text-rose-700 bg-rose-50 text-xs p-2.5 rounded-xl border border-rose-200 leading-snug font-display">
                    {adjustError}
                  </div>
                )}

                {adjustSuccess && (
                  <div id="admin-adjust-success" className="text-emerald-800 bg-emerald-50 text-xs p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-display">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{adjustSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 selection-adjust-triggers">
                  <button
                    type="button"
                    disabled={isSubmitting || !adjustValue}
                    onClick={() => handleAdjustPointsSubmit(true)}
                    id="admin-adj-add"
                    className="py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40 font-display uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Начислить</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || !adjustValue}
                    onClick={() => handleAdjustPointsSubmit(false)}
                    id="admin-adj-sub"
                    className="py-3 bg-rose-700 hover:bg-rose-850 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40 font-display uppercase tracking-wider"
                  >
                    <Minus className="w-4 h-4" />
                    <span>Списать</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
