"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, AlertTriangle } from "lucide-react";

export default function InstallmentCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [downPayment, setDownPayment] = useState<string>("");
  const [repaymentPeriod, setRepaymentPeriod] = useState<string>("");
  const [monthlyInstallment, setMonthlyInstallment] = useState<string>("");
  const [isFocus, setIsFocus] = useState<string>("");
  const [calculatedField, setCalculatedField] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<{
    totalWithProfit: number;
    totalPaid: number;
    missingAmount: number;
  } | null>(null);

  const MONTHLY_PROFIT_RATE = 0.033; // 3.5% monthly

  const parseNumber = (value: string): number => {
    return Number.parseFloat(value) || 0;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("ar-EG").format(Math.round(num));
  };

  const calculateInstallment = (
    price: number,
    down: number,
    period: number
  ): number => {
    const remainingAmount = price - down;
    const totalWithProfit =
      remainingAmount * (1 + MONTHLY_PROFIT_RATE * period);
    return totalWithProfit / period;
  };

  const calculateDownPayment = (
    price: number,
    installment: number,
    period: number
  ): number => {
    const totalInstallments = installment * period;
    const totalWithoutDown = price * (1 + MONTHLY_PROFIT_RATE * period);
    return totalWithoutDown - totalInstallments;
  };

  const calculatePeriod = (
    price: number,
    down: number,
    installment: number
  ): number => {
    const remainingAmount = price - down;
    // Solving: installment * period = remainingAmount * (1 + MONTHLY_PROFIT_RATE * period)
    // This is a linear equation: installment * period = remainingAmount + remainingAmount * MONTHLY_PROFIT_RATE * period
    // Rearranging: period * (installment - remainingAmount * MONTHLY_PROFIT_RATE) = remainingAmount
    const denominator = installment - remainingAmount * MONTHLY_PROFIT_RATE;
    if (denominator <= 0) return 0;
    return remainingAmount / denominator;
  };

  const validateAndCalculate = () => {
    const price = parseNumber(purchasePrice || "0");
    const down = parseNumber(downPayment === "" ? "0" : downPayment);
    const period = parseNumber(repaymentPeriod || "0");
    const installment = parseNumber(monthlyInstallment || "0");

    if (price <= 0) {
      setError("يجب إدخال سعر الشراء");
      setResults(null);
      return;
    }

    const filledFields = [
      downPayment ? "down" : "",
      repaymentPeriod ? "period" : "",
      monthlyInstallment ? "installment" : "",
    ].filter(Boolean);

    if (filledFields.length < 2) {
      setError(
        "يجب ملء حقلين على الأقل من الثلاثة (الدفعة المقدمة، القسط الشهري، فترة السداد)"
      );
      setResults(null);
      return;
    }

    let calculatedDown = down;
    let calculatedPeriod = period;
    let calculatedInstallment = installment;
    let newCalculatedField = "";

    // Calculate based on which fields are filled
    if (
      downPayment &&
      repaymentPeriod &&
      !monthlyInstallment &&
      isFocus !== "installment"
    ) {
      calculatedInstallment = calculateInstallment(price, down, period);
      setMonthlyInstallment(calculatedInstallment.toFixed(2));
      newCalculatedField = "installment";
    } else if (
      monthlyInstallment &&
      repaymentPeriod &&
      !downPayment &&
      isFocus !== "down"
    ) {
      calculatedDown = calculateDownPayment(price, installment, period);
      setDownPayment(calculatedDown.toFixed(2));
      newCalculatedField = "down";
    } else if (
      downPayment &&
      monthlyInstallment &&
      !repaymentPeriod &&
      isFocus !== "period"
    ) {
      calculatedPeriod = calculatePeriod(price, down, installment);
      setRepaymentPeriod(calculatedPeriod.toFixed(0));
      newCalculatedField = "period";
    }

    setCalculatedField(newCalculatedField);

    // Validate if total payments cover the price plus profit
    const finalDown = calculatedDown;
    const finalPeriod = calculatedPeriod;
    const finalInstallment = calculatedInstallment;

    const remainingAmount = price - finalDown;
    const totalWithProfit =
      price + remainingAmount * MONTHLY_PROFIT_RATE * finalPeriod;
    const totalPaid = finalDown + finalInstallment * finalPeriod;
    const missingAmount = totalWithProfit - totalPaid;

    if (isFocus === "period") {
      calculatedInstallment = calculateInstallment(price, down, period);
      setMonthlyInstallment(calculatedInstallment.toFixed(2));
      newCalculatedField = "installment";
    } else if (isFocus === "installment") {
      calculatedPeriod = calculatePeriod(price, down, installment);
      setRepaymentPeriod(calculatedPeriod.toFixed(0));
      newCalculatedField = "period";
    } else if (isFocus === "down") {
      calculatedInstallment = calculateInstallment(price, down, period);
      setMonthlyInstallment(calculatedInstallment.toFixed(2));
      newCalculatedField = "installment";
    } else if (isFocus === "price") {
      calculatedInstallment = calculateInstallment(price, down, period);
      setMonthlyInstallment(calculatedInstallment.toFixed(2));
      newCalculatedField = "installment";
    }

    setResults({
      totalWithProfit,
      totalPaid,
      missingAmount,
    });

    if (missingAmount > 1) {
      // Allow for small rounding differences
      setError(
        ` المبلغ غير كافي لتغطية سعر المنتج . تحتاج إلى: ${formatNumber(
          missingAmount
        )} جنيه`
      );
    } else {
      setError("");
    }
  };

  useEffect(() => {
    if (downPayment === "") {
      setDownPayment("0")
    }
  })

  useEffect(() => {
    if (purchasePrice) {
      validateAndCalculate();
    }
  }, [purchasePrice, downPayment, repaymentPeriod, monthlyInstallment]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              حاسبة الأقساط
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            احسب قيمة الأقساط الشهرية بناءً على المعطيات المختلفة
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                بيانات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="text-sm font-medium">
                  سعر الكاش *
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="أدخل سعر الكاش"
                  value={purchasePrice}
                  onFocus={() => setIsFocus("price")}
                  onBlur={() => setIsFocus("")}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="downPayment" className="text-sm font-medium">
                  المقدم (ان وجد)
                  {calculatedField === "down" && (
                    <span className="text-green-600 text-xs mr-2">
                      (محسوبة تلقائياً)
                    </span>
                  )}
                </Label>
                <Input
                  id="downPayment"
                  type="number"
                  placeholder="أدخل الدفعة المقدمة"
                  value={downPayment || ""}
                  onFocus={() => setIsFocus("down")}
                  onBlur={() => setIsFocus("")}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className={`text-right ${
                    calculatedField === "down"
                      ? "bg-green-50 border-green-200"
                      : ""
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="repaymentPeriod"
                  className="text-sm font-medium"
                >
                  فترة السداد
                  {calculatedField === "period" && (
                    <span className="text-green-600 text-xs mr-2">
                      (محسوبة تلقائياً)
                    </span>
                  )}
                </Label>
                <Input
                  id="repaymentPeriod"
                  type="number"
                  placeholder="أدخل عدد الشهور"
                  value={repaymentPeriod || ""}
                  onFocus={() => setIsFocus("period")}
                  onBlur={() => setIsFocus("")}
                  onChange={(e) => setRepaymentPeriod(e.target.value || "")}
                  className={`text-right ${
                    calculatedField === "period"
                      ? "bg-green-50 border-green-200"
                      : ""
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="monthlyInstallment"
                  className="text-sm font-medium"
                >
                  القسط الشهري
                  {calculatedField === "installment" && (
                    <span className="text-green-600 text-xs mr-2">
                      (محسوب تلقائياً)
                    </span>
                  )}
                </Label>
                <Input
                  id="monthlyInstallment"
                  type="number"
                  placeholder="أدخل قيمة القسط الشهري"
                  value={monthlyInstallment || ""}
                  onFocus={() => setIsFocus("installment")}
                  onBlur={() => setIsFocus("")}
                  onChange={(e) => setMonthlyInstallment(e.target.value)}
                  className={`text-right ${
                    calculatedField === "installment"
                      ? "bg-green-50 border-green-200"
                      : ""
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                نتائج الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results && (
                <div className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-right">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}{" "}
                  {purchasePrice &&
                    downPayment &&
                    repaymentPeriod &&
                    monthlyInstallment &&
                    !error && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <h3 className="font-semibold text-green-800 dark:text-green-200 text-center">
                          ✅ الحساب صحيح
                        </h3>
                      </div>
                    )}
                  {purchasePrice &&
                    downPayment &&
                    repaymentPeriod &&
                    monthlyInstallment && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                        <h3 className="font-semibold text-center mb-3">
                          ملخص التقسيط
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
                            <div className="font-medium text-gray-600 dark:text-gray-300">
                              سعر الشراء
                            </div>
                            <div className="text-lg font-bold">
                              {formatNumber(parseNumber(purchasePrice))}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
                            <div className="font-medium text-gray-600 dark:text-gray-300">
                              الدفعة المقدمة
                            </div>
                            <div className="text-lg font-bold">
                              {formatNumber(parseNumber(downPayment ?? ""))}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
                            <div className="font-medium text-gray-600 dark:text-gray-300">
                              عدد الأقساط
                            </div>
                            <div className="text-lg font-bold">
                              {parseNumber(repaymentPeriod ?? "")} شهر
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
                            <div className="font-medium text-gray-600 dark:text-gray-300">
                              القسط الشهري
                            </div>
                            <div className="text-lg font-bold">
                              {formatNumber(
                                parseNumber(monthlyInstallment ?? "")
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {!purchasePrice && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  أدخل سعر الشراء لبدء الحساب
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            يجب ملء حقلين على الأقل من الثلاثة (الدفعة المقدمة، القسط الشهري،
            فترة السداد)
          </p>
        </div>
      </div>
    </div>
  );
}
