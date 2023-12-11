export function calculateMortgage(
  principal,
  loanTerm,
  annualRate,
  repaymentType
) {
  // 确保参数合法性
  if (principal <= 0 || loanTerm <= 0 || annualRate <= 0) {
    throw new Error("参数必须为正数。");
  }

  // 将年化利率转换为月利率
  const monthlyRate = annualRate / 100 / 12;

  if (repaymentType === "等额本息") {
    // 等额本息
    const totalPayments = loanTerm * 12;
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    const totalInterest = totalPayments * monthlyPayment - principal;
    return {
      firstMonthPayment: monthlyPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      principal,
      loanTerm,
      annualRate,
      repaymentType,
    };
  } else if (repaymentType === "等额本金") {
    // 等额本金
    const totalPayments = loanTerm * 12;
    const monthlyPrincipalPayment = principal / totalPayments;
    let totalInterest = 0;
    const firstMonthPayment = monthlyPrincipalPayment + principal * monthlyRate;
    for (let i = 1; i <= totalPayments; i++) {
      const monthlyInterest = principal * monthlyRate;
      totalInterest += monthlyInterest;
      principal -= monthlyPrincipalPayment;
    }
    return {
      firstMonthPayment: firstMonthPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      principal,
      loanTerm,
      annualRate,
      repaymentType,
    };
  } else {
    throw new Error("无效的还款方式。");
  }
}
