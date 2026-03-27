interface TimePeriod {
  startUtcDateTime: Date;
  endUtcDateTime: Date;
}

export const adjustForStartDate = (
  startUtcDateTime: Date,
  endUtcDateTime: Date
): TimePeriod => {
  if (startUtcDateTime.getTime() > endUtcDateTime.getTime()) {
    endUtcDateTime.setUTCFullYear(startUtcDateTime.getUTCFullYear());
    endUtcDateTime.setUTCMonth(startUtcDateTime.getUTCMonth());
    endUtcDateTime.setUTCDate(startUtcDateTime.getUTCDate());
    if (startUtcDateTime.getTime() > endUtcDateTime.getTime()) {
      endUtcDateTime.setHours(startUtcDateTime.getHours() + 1);
    }
  }
  return {
    startUtcDateTime,
    endUtcDateTime,
  };
};

export const adjustForEndDate = (
  startUtcDateTime: Date,
  endUtcDateTime: Date
): TimePeriod => {
  if (startUtcDateTime.getTime() > endUtcDateTime.getTime()) {
    startUtcDateTime.setUTCFullYear(endUtcDateTime.getUTCFullYear());
    startUtcDateTime.setUTCMonth(endUtcDateTime.getUTCMonth());
    startUtcDateTime.setUTCDate(endUtcDateTime.getUTCDate());
    if (startUtcDateTime.getTime() > endUtcDateTime.getTime()) {
      startUtcDateTime.setHours(endUtcDateTime.getHours() - 1);
    }
  }
  return {
    startUtcDateTime,
    endUtcDateTime,
  };
};

export const adjustForStartTime = (
  startUtcDateTime: Date,
  endUtcDateTime: Date
): TimePeriod => {
  if (startUtcDateTime.getTime() > endUtcDateTime.getTime()) {
    endUtcDateTime.setHours(startUtcDateTime.getHours() + 1);
  }
  return {
    startUtcDateTime,
    endUtcDateTime,
  };
};

export const adjustForEndTime = (
  startUtcDateTime: Date,
  endUtcDateTime: Date
): TimePeriod => {
  if (startUtcDateTime.getTime() > endUtcDateTime.getTime()) {
    startUtcDateTime.setHours(endUtcDateTime.getHours() - 1);
  }
  return {
    startUtcDateTime,
    endUtcDateTime,
  };
};
