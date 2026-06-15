import React, { createContext, useContext, useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/v1";

// Создание контекста программы лояльности
const LoyaltyContext = createContext(null);

// Вспомогательная функция для генерации уникальных ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Начальные демонстрационные данные пользователей системы
const DEFAULT_USERS = [
  {
    id: "g1",
    name: "Иван Иванов",
    phone: "+7 (999) 111-22-33",
    role: "guest",
    points: 320,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "g2",
    name: "Мария Петрова",
    phone: "+7 (999) 444-55-66",
    role: "guest",
    points: 750,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "g3",
    name: "Дмитрий Сидоров",
    phone: "+7 (999) 777-88-99",
    role: "guest",
    points: 45,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "b1",
    name: "Алексей (Шеф-бариста)",
    phone: "+7 (900) 123-45-67",
    role: "barista",
    points: 0,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a1",
    name: "Екатерина (Управляющая)",
    phone: "+7 (900) 999-99-99",
    role: "admin",
    points: 0,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Первоначальный список транзакций программы лояльности Beans & Brew
const DEFAULT_TRANSACTIONS = [
  {
    id: "t1",
    userId: "g1",
    userName: "Иван Иванов",
    userPhone: "+7 (999) 111-22-33",
    type: "earn",
    amountRub: 1500,
    points: 90, // 6% кэшбек
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    processedBy: { name: "Алексей (Шеф-бариста)", role: "barista" },
  },
  {
    id: "t2",
    userId: "g2",
    userName: "Мария Петрова",
    userPhone: "+7 (999) 444-55-66",
    type: "earn",
    amountRub: 5000,
    points: 300,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    processedBy: { name: "Алексей (Шеф-бариста)", role: "barista" },
  },
  {
    id: "t3",
    userId: "g1",
    userName: "Иван Иванов",
    userPhone: "+7 (999) 111-22-33",
    type: "spend",
    points: 50,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    processedBy: { name: "Алексей (Шеф-бариста)", role: "barista" },
  },
  {
    id: "t4",
    userId: "g2",
    userName: "Мария Петрова",
    userPhone: "+7 (999) 444-55-66",
    type: "earn",
    amountRub: 2500,
    points: 150,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    processedBy: { name: "Алексей (Шеф-бариста)", role: "barista" },
  },
  {
    id: "t5",
    userId: "g3",
    userName: "Дмитрий Сидоров",
    userPhone: "+7 (999) 777-88-99",
    type: "admin_add",
    points: 45,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    processedBy: { name: "Екатерина (Управляющая)", role: "admin" },
  },
];

// Компонент провайдера управления балансом и учетными записями
export const LoyaltyProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("loyalty_users");
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("loyalty_transactions");
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("loyalty_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeRole, setActiveRole] = useState(() => {
    const saved = localStorage.getItem("loyalty_active_role");
    return saved || "guest";
  });

  const [isLoading, setIsLoading] = useState(false);

  // Синхронизация данных с локальным хранилищем LocalStorage
  useEffect(() => {
    localStorage.setItem("loyalty_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("loyalty_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("loyalty_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("loyalty_current_user");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("loyalty_active_role", activeRole);
  }, [activeRole]);

  // Небольшая задержка для визуализации асинхронных операций
  const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

  // Авторизация по номеру телефона гостя
  const login = async (phone, name) => {
    setIsLoading(true);
    await delay(600);

    const checkPhone = phone.replace(/\D/g, "");
    let foundUser = users.find((u) => u.phone.replace(/\D/g, "") === checkPhone);

    if (!foundUser) {
      // Регистрируем нового покупателя при первом визите
      const newUser = {
        id: generateId(),
        phone: phone,
        name: name || `Гость #${phone.slice(-4)}`,
        role: "guest",
        points: 0,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      foundUser = newUser;
    }

    setCurrentUser(foundUser);
    setActiveRole(foundUser.role);
    setIsLoading(false);
    return foundUser;
  };

  // Метод быстрого демо-входа для переключения между ролями
  const quickLoginAs = async (phone) => {
    setIsLoading(true);
    await delay(300);
    const foundUser = users.find((u) => u.phone === phone);
    if (foundUser) {
      setCurrentUser(foundUser);
      setActiveRole(foundUser.role);
    }
    setIsLoading(false);
    if (!foundUser) throw new Error("Пользователь не найден");
    return foundUser;
  };

  // Выход из системы
  const logout = async () => {
    setIsLoading(true);
    await delay(300);
    setCurrentUser(null);
    setActiveRole("guest");
    setIsLoading(false);
  };

  // НАЧИСЛЕНИЕ баллов гостю за покупку на кассе
  const earnPoints = async (guestPhone, amountRub, processedById) => {
    setIsLoading(true); // Включаем индикатор загрузки на фронтенде

    try {
      // Отправляем запрос на бэкенд-ручку начисления
      const response = await fetch(`${API_URL}/barista/transactions/earn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest_phone: guestPhone,
          receipt_sum: amountRub,
          processed_by_id: processedById
        })
      });

      // Если бэкенд вернул ошибку (например, статус 400 или 500)
      if (!response.ok) {
        const errorData = await response.json();
        // Сервер должен вернуть JSON вида { "message": "Текст ошибки" }
        throw new Error(errorData.message || "Ошибка сервера при начислении");
      }

      // Получаем от сервера готовую транзакцию
      const newTx = await response.json();

      // Сервер должен обновить базу данных, но нам нужно обновить стейты на фронтенде,
      // чтобы интерактивная вёрстка мгновенно перерисовалась:
      
      // Обновляем баланс гостя в локальном списке пользователей
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          // Ищем гостя по ID, который прислал сервер
          if (u.id === newTx.userId) {
            return { ...u, points: u.points + newTx.points };
          }
          return u;
        })
      );

      // Обновляем текущую сессию, если бариста начислил баллы самому себе (для тестов)
      if (currentUser && currentUser.id === newTx.userId) {
        setCurrentUser((prev) => prev ? { ...prev, points: prev.points + newTx.points } : null);
      }

      // Добавляем новую транзакцию в начало списка истории действий бариста
      setTransactions((prev) => [newTx, ...prev]);

      setIsLoading(false);
      return newTx; // Возвращаем транзакцию в компонент BaristaDashboard для вывода successMsg

    } catch (error) {
      setIsLoading(false);
      // Пробрасываем ошибку дальше, чтобы её поймал catch(err) в BaristaDashboard и вывел в UI
      throw error; 
    }
  };

  // СПИСАНИЕ баллов гостя в счет оплаты покупки
  const spendPoints = async (guestPhone, pointsToSpend, processedById) => {
    setIsLoading(true);

    try {
      // Отправляем запрос на бэкенд-ручку списания
      const response = await fetch(`${API_URL}/barista/transactions/spend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest_phone: guestPhone,
          points_to_spend: pointsToSpend,
          processed_by_id: processedById
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка сервера при списании");
      }

      const newTx = await response.json();

      // Уменьшаем баллы у гостя локально в стейте вёрстки
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === newTx.userId) {
            return { ...u, points: u.points - newTx.points };
          }
          return u;
        })
      );

      if (currentUser && currentUser.id === newTx.userId) {
        setCurrentUser((prev) => prev ? { ...prev, points: prev.points - newTx.points } : null);
      }

      setTransactions((prev) => [newTx, ...prev]);
      setIsLoading(false);
      return newTx;

    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Ручная корректировка баллов администратором
  const adminAdjustPoints = async (guestId, points, isAdd, adminId) => {
    setIsLoading(true);
    await delay(500);

    const guestIdx = users.findIndex((u) => u.id === guestId);
    if (guestIdx === -1) {
      setIsLoading(false);
      throw new Error("Пользователь не найден");
    }

    const admin = users.find((u) => u.id === adminId);
    if (!admin) {
      setIsLoading(false);
      throw new Error("Администратор не авторизован");
    }

    const guest = users[guestIdx];

    if (!isAdd && guest.points < points) {
      setIsLoading(false);
      throw new Error(`Невозможно списать больше баллов, чем накоплено (${guest.points} б.)`);
    }

    const updatedUsers = [...users];
    const newPoints = isAdd ? guest.points + points : guest.points - points;

    updatedUsers[guestIdx] = {
      ...guest,
      points: newPoints,
    };
    setUsers(updatedUsers);

    if (currentUser && currentUser.id === guest.id) {
      setCurrentUser(updatedUsers[guestIdx]);
    }

    const newTx = {
      id: generateId(),
      userId: guest.id,
      userName: guest.name,
      userPhone: guest.phone,
      type: isAdd ? "admin_add" : "admin_remove",
      points: points,
      timestamp: new Date().toISOString(),
      processedBy: {
        name: admin.name,
        role: admin.role,
      },
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsLoading(false);
    return newTx;
  };

  // Создание нового пользователя администратором
  const registerUser = async (name, phone, role) => {
    setIsLoading(true);
    await delay(400);

    const checkPhone = phone.replace(/\D/g, "");
    const duplicate = users.find((u) => u.phone.replace(/\D/g, "") === checkPhone);

    if (duplicate) {
      setIsLoading(false);
      throw new Error(`Пользователь с номером телефона ${phone} уже зарегистрирован (${duplicate.name})`);
    }

    const newUser = {
      id: generateId(),
      name,
      phone,
      role,
      points: 0,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setIsLoading(false);
    return newUser;
  };

  // Удаление пользователя сотрудником администрации
  const deleteUser = async (userId) => {
    setIsLoading(true);
    await delay(300);

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
      setActiveRole("guest");
    }

    setIsLoading(false);
  };

  // Изменение системной роли человека (Администратор может назначить Бариста, Гостя или Админа)
  const updateUserRole = async (userId, role) => {
    setIsLoading(true);
    await delay(300);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const points = role === "guest" ? u.points : 0;
          return { ...u, role, points };
        }
        return u;
      })
    );

    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => {
        if (!prev) return null;
        const points = role === "guest" ? prev.points : 0;
        return { ...prev, role, points };
      });
      setActiveRole(role);
    }

    setIsLoading(false);
  };

  return (
    <LoyaltyContext.Provider
      value={{
        users,
        transactions,
        currentUser,
        activeRole,
        isLoading,
        setActiveRole,
        login,
        quickLoginAs,
        logout,
        earnPoints,
        spendPoints,
        adminAdjustPoints,
        registerUser,
        deleteUser,
        updateUserRole,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
};

// Хук использования сессий и привилегий программы лояльности в компонентах
export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (context === undefined) {
    throw new Error("useLoyalty must be used within a LoyaltyProvider");
  }
  return context;
};
