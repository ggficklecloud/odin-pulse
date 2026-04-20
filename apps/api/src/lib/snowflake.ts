const EPOCH = 1_704_067_200_000n;

export class Snowflake {
  private sequence = 0n;
  private lastTimestamp = 0n;

  constructor(
    private readonly machineId = 1n,
    private readonly nodeId = 1n,
  ) {}

  nextId(): string {
    let timestamp = BigInt(Date.now());
    if (timestamp < this.lastTimestamp) {
      timestamp = this.lastTimestamp;
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & 0xfffn;
      if (this.sequence === 0n) {
        while (timestamp <= this.lastTimestamp) {
          timestamp = BigInt(Date.now());
        }
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - EPOCH) << 22n) |
      (this.machineId << 17n) |
      (this.nodeId << 12n) |
      this.sequence;

    return id.toString();
  }
}

export const snowflake = new Snowflake();
