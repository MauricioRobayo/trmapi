const { dateIsInRange, formatDate } = require("./helpers");

describe("Check if a given date is in range", () => {
  it("should return false for invalid dates given", () => {
    expect(dateIsInRange()).toBe(false);
    expect(dateIsInRange(undefined)).toBe(false);
    expect(dateIsInRange(null)).toBe(false);
    expect(dateIsInRange("31-12-2018")).toBe(false);
    expect(dateIsInRange("2018-10-10", "2013-01-01", null)).toBe(false);
    expect(dateIsInRange("2018-10-10", "2013-01-01", "12-12-2019")).toBe(false);
  });
  it("should test if a valid date is inside range", () => {
    const date = new Date();
    expect(dateIsInRange(formatDate(date))).toBe(true);
    date.setDate(date.getDate() + 1);
    expect(dateIsInRange(formatDate(date))).toBe(false);
    expect(dateIsInRange("2013-01-01")).toBe(true);
    expect(dateIsInRange("2012-12-31")).toBe(false);
    expect(dateIsInRange("2012-12-31", "2012-12-31")).toBe(true);
    expect(dateIsInRange("2013-01-01", "2012-12-31", "2012-12-31")).toBe(false);
  });
});
