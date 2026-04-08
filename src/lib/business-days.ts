export function addBusinessDays(startDate: Date, businessDays: number): Date {
  // Feriados Nacionais Fixos Brasil (Mês e Dia - 0 indexado no JS, então +1 p/ facilidade mental usando MM-DD)
  const fixedHolidays = [
    "01-01", // Confraternização Universal
    "04-21", // Tiradentes
    "05-01", // Dia do Trabalhador
    "09-07", // Independência do Brasil
    "10-12", // Nossa Senhora Aparecida
    "11-02", // Finados
    "11-15", // Proclamação da República
    "12-25", // Natal
  ];

  const isHoliday = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return fixedHolidays.includes(`${month}-${day}`);
  };

  const resultDate = new Date(startDate);
  // Garante que o relógio não atrapalhe os dias se quisermos o fim do dia
  resultDate.setHours(23, 59, 59, 999);

  let remainingDays = businessDays;
  
  if (businessDays === 0) {
      // Se não precisa avançar dias, a data de entrega é o próprio dia (ou próximo útil se for feriado)
      // Ajuste para não cair fim de semana se o startDate já for fim de semana
      while (resultDate.getDay() === 0 || resultDate.getDay() === 6 || isHoliday(resultDate)) {
        resultDate.setDate(resultDate.getDate() + 1);
      }
      return resultDate;
  }

  while (remainingDays > 0) {
    resultDate.setDate(resultDate.getDate() + 1);

    // 0 = Domingo, 6 = Sábado
    if (resultDate.getDay() !== 0 && resultDate.getDay() !== 6 && !isHoliday(resultDate)) {
      remainingDays--;
    }
  }

  return resultDate;
}
