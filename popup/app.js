// @ts-nocheck
$(document).ready(function () {
  // Set the default active tab
  $("#tab1").addClass("active");
  $("#content1").addClass("active");
  let current_active = "tab1";
  // Handle tab click event
  $(".tab").click(function () {
    // Remove 'active' class from all tabs and tab content
    $(".tab").removeClass("active");
    $(".tab-content").removeClass("active");

    // Add 'active' class to the clicked tab and corresponding content
    var tabId = $(this).attr("id");
    current_active = tabId;
    $("#" + tabId).addClass("active");
    $("#content" + tabId.slice(-1)).addClass("active");
  });

  $("#cal-fd").click(function () {
    console.log("current_active", current_active);
    if (current_active === "tab1") {
      const account = $(".account").val();
      const year = $(".year").val();
      const rate = $(".rate").val();
      if (
        !account ||
        !year ||
        !rate ||
        isNaN(Number(account)) ||
        isNaN(Number(year)) ||
        isNaN(Number(rate))
      ) {
        $(".error").css("display", "block");
        return;
      }
      $(".error").css("display", "none");
      const method = $(".method").val();
      const result = calculateMortgage(
        Number(account) * 10000,
        Number(year),
        Number(rate),
        method
      );
      console.log("result", result);
      $(".result").html(`
        <p>借款金额${account}万，贷款年限${year}年，利率${rate},以${method}方式</p>
        <p style="color: red">您的总利息为${result.totalInterest},${
        method === "等额本息" ? "每" : "首"
      }月需还款${result.firstMonthPayment}</p>
      `);
    } else if (current_active === "tab2") {
      const account = $(".d-account").val();
      const year = $(".d-year").val();
      const rate = $(".d-rate").val();
      if (
        !account ||
        !year ||
        !rate ||
        isNaN(Number(account)) ||
        isNaN(Number(year)) ||
        isNaN(Number(rate))
      ) {
        $(".error").css("display", "block");
        return;
      }
      $(".error").css("display", "none");
      const result = calculateInvestmentReturns(
        Number(year),
        Number(rate),
        Number(account)
      );
      $(".result").html(`
      <p>每月定投${account}元，定投年限${year}年，预期收益${rate}</p>
      <p style="color: red">您的总收益为${result.principal},投资收益为${
        result.returns
      }万, 本金为${result.principal - result.returns},</p>
    `);
    } else {
      const rate = $(".s-rate").val();
      const list = rate.split(",");
      if (
        list.every((item) => typeof item === "string" && !isNaN(Number(item)))
      ) {
        const arr = list.map((_) => Number(_));
        const avgResult = arr.reduce((t, v) => t + v, 0) / arr.length;
        const incomeResult = calculateGeometricMean(arr) || 0;
        $(".result").html(`
        <p style="color: red">几何均值收益：${incomeResult}</p>
        <p style="color: red">算数均值收益：${avgResult}</p>
      `);
      } else {
        $(".error").css("display", "block");
      }
    }
  });

  $(".online").click(function (event) {
    event.preventDefault(); // 阻止默认的点击行为
    console.log("jahah");
    var url = "https://tools.yeshaojun.com/house"; // 你想跳转的URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: url }); // 更新当前活动的选项卡页的URL
    });
  });
});

function calculateMortgage(principal, loanTerm, annualRate, repaymentType) {
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

function calculateInvestmentReturns(years, annualRate, monthlyInvestment) {
  // 确保参数合法性
  if (years <= 0 || annualRate <= 0 || monthlyInvestment <= 0) {
    throw new Error("参数必须为正数。");
  }

  // 将年化收益率转换为每期增长率
  const monthlyRate = (1 + annualRate / 100) ** (1 / 12) - 1;

  let principal = 0;
  let returns = [];

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      // 计算每月结束时的本金
      principal = (principal + monthlyInvestment) * (1 + monthlyRate);
    }

    // 将结果保存到数组
    returns.push({
      year,
      principal: principal.toFixed(2),
      returns: (principal - monthlyInvestment * 12 * year).toFixed(2),
    });
  }
  console.log("returns", returns);
  return returns[returns.length - 1];
}

function calculateGeometricMean(returns) {
  // 确保数组不为空
  if (returns.length === 0) {
    return undefined;
  }

  // 将收益率转换为增长率
  const growthRates = returns.map((returnRate) => 1 + returnRate / 100);

  // 计算几何均值
  const product = growthRates.reduce((acc, rate) => acc * rate, 1);
  const geometricMean = Math.pow(product, 1 / returns.length) - 1;

  return geometricMean * 100; // 将结果转为百分比形式
}
