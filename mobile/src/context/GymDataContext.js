import React, { createContext, useState, useEffect, useContext } from 'react';
import { dataService } from '../services/dataService';
import { storage } from '../services/storage';

const GymDataContext = createContext(null);

export function GymDataProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [coachMessages, setCoachMessages] = useState([]);
  const [gymConfig, setGymConfig] = useState(null);
  const [dailyWater, setDailyWater] = useState(1750);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [stList, msgs, config, savedWater] = await Promise.all([
        dataService.getStudents(),
        dataService.getCoachMessages(),
        dataService.getGymConfig(),
        storage.get('daily_water_ml', 1750)
      ]);
      setStudents(stList);
      setCoachMessages(msgs);
      setGymConfig(config);
      setDailyWater(savedWater);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  async function refreshStudents() {
    const list = await dataService.getStudents();
    setStudents(list);
    return list;
  }

  async function refreshCoachMessages() {
    const msgs = await dataService.getCoachMessages();
    setCoachMessages(msgs);
    return msgs;
  }

  async function addFalta(studentId, motivo = 'Falta no treino') {
    await dataService.addFalta(studentId, null, motivo);
    await refreshStudents();
  }

  async function removeFalta(studentId) {
    await dataService.removeFalta(studentId);
    await refreshStudents();
  }

  async function markPaymentPaid(faturaId) {
    const success = await dataService.markPaymentPaid(faturaId);
    if (success) {
      await refreshStudents();
    }
    return success;
  }

  async function sendCoachMessage({ usuario_id, nomeAluno, telefone, assunto, prioridade, mensagem }) {
    const msg = await dataService.sendCoachMessage({
      usuario_id,
      nomeAluno,
      telefone,
      assunto,
      prioridade,
      mensagem
    });
    await refreshCoachMessages();
    return msg;
  }

  async function resolveCoachMessage(msgId) {
    const success = await dataService.resolveCoachMessage(msgId);
    if (success) {
      await refreshCoachMessages();
    }
    return success;
  }

  async function addWater(amountMl = 250) {
    const newTotal = Math.max(0, Math.min(5000, dailyWater + amountMl));
    setDailyWater(newTotal);
    await storage.set('daily_water_ml', newTotal);
    return newTotal;
  }

  return (
    <GymDataContext.Provider
      value={{
        students,
        coachMessages,
        gymConfig,
        dailyWater,
        loading,
        refreshStudents,
        refreshCoachMessages,
        addFalta,
        removeFalta,
        markPaymentPaid,
        sendCoachMessage,
        resolveCoachMessage,
        addWater,
        refreshAll: loadInitialData
      }}
    >
      {children}
    </GymDataContext.Provider>
  );
}

export function useGymData() {
  const context = useContext(GymDataContext);
  if (!context) {
    throw new Error('useGymData deve ser utilizado dentro de GymDataProvider');
  }
  return context;
}
