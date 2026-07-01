/** Simple exponential moving average smoother for a single scalar signal. */
export class ExponentialSmoother {
  private value: number | null = null;

  constructor(private readonly alpha: number = 0.4) {}

  next(sample: number): number {
    this.value = this.value === null ? sample : this.alpha * sample + (1 - this.alpha) * this.value;
    return this.value;
  }

  reset(): void {
    this.value = null;
  }
}
