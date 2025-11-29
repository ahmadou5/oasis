import { buildSolanaBeachURL, ENV, getSolanaBeachHeaders } from "@/config/env";

interface EpochTimeInfo {
  epoch: number;
  absoluteSlot: number;
  slotIndex: number;
  slotsInEpoch: number;
  percentComplete: number;
  estimatedTimeRemaining: string;
  estimatedEndTime: Date;
  humanReadable: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

/**
 * Converts epoch information to human-readable time format
 * Similar to the image showing "54.5% complete (21h 9m of 1d 22h 31m remaining)"
 */
export class EpochConverter {
  private static readonly SLOT_TIME_MS = 400; // Average slot time in milliseconds

  /**
   * Calculate human-readable epoch information
   */
  static convertEpochToTime(epochInfo: {
    epoch: number;
    absoluteSlot: number;
    slotIndex: number;
    slotsInEpoch: number;
  }): EpochTimeInfo {
    const { epoch, absoluteSlot, slotIndex, slotsInEpoch } = epochInfo;

    // Calculate percentage complete
    const percentComplete = (slotIndex / slotsInEpoch) * 100;

    // Calculate remaining slots
    const remainingSlots = slotsInEpoch - slotIndex;

    // Calculate remaining time in milliseconds
    const remainingMs = remainingSlots * this.SLOT_TIME_MS;

    // Convert to human-readable format
    const humanReadable = this.millisecondsToHuman(remainingMs);

    // Calculate total epoch duration
    const totalEpochMs = slotsInEpoch * this.SLOT_TIME_MS;
    const totalDuration = this.millisecondsToHuman(totalEpochMs);

    // Estimate end time
    const estimatedEndTime = new Date(Date.now() + remainingMs);

    // Format time remaining string (like "21h 9m of 1d 22h 31m remaining")
    const estimatedTimeRemaining = `${this.formatDuration(
      humanReadable
    )} of ${this.formatDuration(totalDuration)} remaining`;

    return {
      epoch,
      absoluteSlot,
      slotIndex,
      slotsInEpoch,
      percentComplete: Math.round(percentComplete * 10) / 10,
      estimatedTimeRemaining,
      estimatedEndTime,
      humanReadable,
    };
  }

  /**
   * Convert milliseconds to human-readable time components
   */
  private static millisecondsToHuman(ms: number): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return {
      days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
    };
  }

  /**
   * Format duration for display (e.g., "1d 22h 31m")
   */
  private static formatDuration(time: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }): string {
    const parts: string[] = [];

    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    if (time.seconds > 0 && time.days === 0) parts.push(`${time.seconds}s`);

    return parts.join(" ") || "0s";
  }

  /**
   * Get current epoch info from Solana Beach API
   */
  static async fetchCurrentEpochInfo(): Promise<EpochTimeInfo | null> {
    try {
      const response = await fetch(
        buildSolanaBeachURL(ENV.SOLANA_BEACH.ENDPOINTS.EPOCH_INFO(30)),
        {
          headers: getSolanaBeachHeaders(),
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return this.convertEpochToTime(data);
    } catch (error) {
      console.error("Error fetching epoch info:", error);
      return null;
    }
  }
}
