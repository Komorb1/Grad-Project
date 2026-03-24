import { evaluateReadingForEvent } from "@/lib/events/evaluate-reading";

describe("evaluateReadingForEvent", () => {
  describe("gas sensor", () => {
    it("returns null for normal gas readings", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "gas", rawValue: "299" })
      ).toBeNull();
    });

    it("returns a high gas event at the warning threshold", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "gas", rawValue: "300" })
      ).toEqual({
        event_type: "gas",
        severity: "high",
        title: "High gas level detected",
        description: "Gas reading reached 300.",
      });
    });

    it("returns a critical gas event at the critical threshold", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "gas", rawValue: "600" })
      ).toEqual({
        event_type: "gas",
        severity: "critical",
        title: "Critical gas level detected",
        description: "Gas reading reached 600. Immediate action recommended.",
      });
    });
  });

  describe("smoke sensor", () => {
    it("returns null for normal smoke readings", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "smoke", rawValue: "199" })
      ).toBeNull();
    });

    it("returns a high smoke event at the warning threshold", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "smoke", rawValue: "200" })
      ).toEqual({
        event_type: "smoke",
        severity: "high",
        title: "High smoke level detected",
        description: "Smoke reading reached 200.",
      });
    });

    it("returns a critical smoke event at the critical threshold", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "smoke", rawValue: "400" })
      ).toEqual({
        event_type: "smoke",
        severity: "critical",
        title: "Critical smoke level detected",
        description: "Smoke reading reached 400.",
      });
    });
  });

  describe("flame sensor", () => {
    it("returns null when flame is not detected", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "flame", rawValue: "0" })
      ).toBeNull();
    });

    it("returns a critical flame event when flame is detected", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "flame", rawValue: "1" })
      ).toEqual({
        event_type: "flame",
        severity: "critical",
        title: "Flame detected",
        description: "Flame sensor reported a detection.",
      });
    });
  });

  describe("motion sensor", () => {
    it("returns null when no motion is detected", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "motion", rawValue: "0" })
      ).toBeNull();
    });

    it("returns an intrusion event when motion is detected", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "motion", rawValue: "1" })
      ).toEqual({
        event_type: "intrusion",
        severity: "medium",
        title: "Motion detected",
        description: "Motion sensor reported activity.",
      });
    });
  });

  describe("door sensor", () => {
    it("returns null when the door is closed", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "door", rawValue: "0" })
      ).toBeNull();
    });

    it("returns an intrusion event when the door is opened", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "door", rawValue: "1" })
      ).toEqual({
        event_type: "intrusion",
        severity: "medium",
        title: "Door opened",
        description: "Door sensor reported an open state.",
      });
    });
  });

  describe("invalid or non-numeric values", () => {
    it("returns null for non-numeric strings", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "gas", rawValue: "abc" })
      ).toBeNull();
    });

    it("returns null for Infinity", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "smoke", rawValue: "Infinity" })
      ).toBeNull();
    });

    it("returns null for NaN", () => {
      expect(
        evaluateReadingForEvent({ sensorType: "door", rawValue: "NaN" })
      ).toBeNull();
    });
  });
});