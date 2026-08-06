export function calculateEMI(principal, annualRate, tenure, frequency = "MONTHLY") {
  const periodsPerYear = { DAILY: 365, WEEKLY: 52, BI_WEEKLY: 26, MONTHLY: 12 };
  const n = periodsPerYear[frequency] || 12;
  const ratePerPeriod = (annualRate / 100) / n;
  const totalPeriods = tenure * (n / 12);

  // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const compounded = Math.pow(1 + ratePerPeriod, totalPeriods);
  const emi = principal * ratePerPeriod * compounded / (compounded - 1);

  const totalPayable = emi * totalPeriods;
  const totalInterest = totalPayable - principal;

  // Generate schedule
  const schedule = [];
  let balance = principal;
  for (let i = 1; i <= totalPeriods; i++) {
    const interestForPeriod = balance * ratePerPeriod;
    const principalForPeriod = emi - interestForPeriod;
    balance -= principalForPeriod;
    if (i === totalPeriods) {
      // Adjust last installment to clear balance
      schedule.push({
        installmentNo: i,
        dueDate: null, // caller sets this
        emiAmount: Math.round((emi + balance) * 100) / 100,
        principalAmount: Math.round((principalForPeriod + balance) * 100) / 100,
        interestAmount: Math.round(interestForPeriod * 100) / 100,
        balanceAmount: 0,
      });
    } else {
      schedule.push({
        installmentNo: i,
        dueDate: null,
        emiAmount: Math.round(emi * 100) / 100,
        principalAmount: Math.round(principalForPeriod * 100) / 100,
        interestAmount: Math.round(interestForPeriod * 100) / 100,
        balanceAmount: Math.round(Math.max(balance, 0) * 100) / 100,
      });
    }
  }

  return {
    emiAmount: Math.round(emi * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
    numberOfInstallments: totalPeriods,
    schedule,
  };
}

export function generateRepaymentSchedule(loan, disbursementDate) {
  const result = calculateEMI(
    loan.principal_amount,
    loan.interest_rate,
    loan.tenure,
    loan.recovery_frequency,
  );

  const startDate = new Date(disbursementDate);
  const intervalMap = { DAILY: 1, WEEKLY: 7, BI_WEEKLY: 14, MONTHLY: 30 };
  const daysInterval = intervalMap[loan.recovery_frequency] || 30;

  result.schedule.forEach((item, index) => {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + (index + 1) * daysInterval);
    item.dueDate = dueDate.toISOString().slice(0, 10);
  });

  return result;
}