import React from "react";
import { useLoyalty } from "../context/LoyaltyContext.jsx";
import { Shield, Coffee, LogOut, UserCheck } from "lucide-react";

// Панель быстрого переключения ролей/аккаунтов для удобства тестирования и презентации проекта
export const RoleSelector = () => {
  const { activeRole, setActiveRole, currentUser, logout } = useLoyalty();

  const roleLabels = {
    guest: "Гость",
    barista: "Бариста",
    admin: "Админ",
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md bg-[#3D2B1F]/95 text-xs text-[#FDFBF7] backdrop-blur-md px-4 py-3 shadow-2xl border-t border-[#4D392E] flex items-center justify-between rounded-t-2xl">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-bold text-[#E8E4DE] uppercase tracking-wider text-[9px] font-display">Симуляция:</span>
      </div>

      <div className="flex bg-[#2c1d11] rounded-lg p-0.5 gap-1 border border-black/10">
        {["guest", "barista", "admin"].map((role) => {
          const isActive = activeRole === role;
          return (
            <button
              key={role}
              id={`role-btn-${role}`}
              onClick={() => handleRoleChange(role)}
              className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center gap-1 cursor-pointer font-display ${
                isActive
                  ? "bg-[#C68642] text-[#FDFBF7] shadow-md font-semibold"
                  : "text-[#E8E4DE]/60 hover:text-[#FDFBF7] hover:bg-[#3D2B1F]/50"
              }`}
            >
              {role === "guest" && <Coffee className="w-3.5 h-3.5" />}
              {role === "barista" && <UserCheck className="w-3.5 h-3.5" />}
              {role === "admin" && <Shield className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{roleLabels[role]}</span>
              <span className="sm:hidden">{roleLabels[role][0]}</span>
            </button>
          );
        })}
      </div>

      {currentUser && (
        <button
          onClick={logout}
          title="Выйти из текущего аккаунта"
          className="p-1.5 rounded-lg bg-[#4D392E] hover:bg-[#C68642] text-[#FDFBF7] transition-colors flex items-center border border-[#6B5344]"
        >
          <LogOut className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
