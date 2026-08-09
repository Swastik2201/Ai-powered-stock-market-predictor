export interface SIPDataPoint {
  month: number;
  yearLabel: string;
  amountInvested: number;
  sipValue: number;
  fdValue: number;
  wealthGained: number;
}

export interface SIPCalculationResult {
  totalInvested: number;
  finalSipValue: number;
  finalFdValue: number;
  totalWealthGained: number;
  fdGainDifference: number;
  fdGainDifferencePct: number;
  timeline: SIPDataPoint[];
}

export const BANK_FD_EXPECTED_RATE = 6.8; // 6.8% p.a. standard bank FD rate

/**
 * Calculates month-by-month compounding timeline for SIP investments vs Bank FD benchmark
 * @param monthlyInvestment P: Monthly investment amount (e.g. ₹1,000)
 * @param years nYears: Horizon duration in years (e.g. 3)
 * @param annualRate r: Target asset expected annual return rate % (e.g. 12.5)
 */
export function calculateSIP(
  monthlyInvestment: number,
  years: number,
  annualRate: number
): SIPCalculationResult {
  const totalMonths = Math.max(1, Math.round(years * 12));
  const monthlyRateSIP = annualRate / (12 * 100);
  const monthlyRateFD = BANK_FD_EXPECTED_RATE / (12 * 100);

  const timeline: SIPDataPoint[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    const amountInvested = monthlyInvestment * m;

    // Monthly SIP Future Value Formula: P * [((1 + i)^m - 1) / i] * (1 + i)
    let sipValue = 0;
    if (monthlyRateSIP > 0) {
      sipValue =
        monthlyInvestment *
        (((Math.pow(1 + monthlyRateSIP, m) - 1) / monthlyRateSIP) *
          (1 + monthlyRateSIP));
    } else {
      sipValue = amountInvested;
    }

    // Bank FD Future Value Formula
    let fdValue = 0;
    if (monthlyRateFD > 0) {
      fdValue =
        monthlyInvestment *
        (((Math.pow(1 + monthlyRateFD, m) - 1) / monthlyRateFD) *
          (1 + monthlyRateFD));
    } else {
      fdValue = amountInvested;
    }

    const yearNum = Math.ceil(m / 12);
    const monthInYear = ((m - 1) % 12) + 1;
    const yearLabel = monthInYear === 12 || m === totalMonths ? `Yr ${yearNum}` : `M${m}`;

    timeline.push({
      month: m,
      yearLabel,
      amountInvested: Math.round(amountInvested),
      sipValue: Math.round(sipValue),
      fdValue: Math.round(fdValue),
      wealthGained: Math.max(0, Math.round(sipValue - amountInvested)),
    });
  }

  const lastPoint = timeline[timeline.length - 1];
  const totalInvested = lastPoint.amountInvested;
  const finalSipValue = lastPoint.sipValue;
  const finalFdValue = lastPoint.fdValue;

  const totalWealthGained = finalSipValue - totalInvested;
  const fdGainDifference = finalSipValue - finalFdValue;
  const fdGainDifferencePct = finalFdValue > 0 ? (fdGainDifference / finalFdValue) * 100 : 0;

  return {
    totalInvested,
    finalSipValue,
    finalFdValue,
    totalWealthGained,
    fdGainDifference,
    fdGainDifferencePct: Number(fdGainDifferencePct.toFixed(1)),
    timeline,
  };
}
