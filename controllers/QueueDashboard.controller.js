const reminderQueue = require("../Queue/reminder.queue");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");

// Existing stats
const getQueueStats = async (req, res, next) => {
  try {
    const counts = await reminderQueue.getJobCounts();
    const metrics = await reminderQueue.getMetrics();

    return sendResponse(res, {
      success: true,
      message: "Queue stats fetched successfully",
      data: { counts, metrics },
    });
  } catch (error) {
    next(new ApiError(500, `Error fetching queue stats: ${error.message}`));
  }
};

// New trend endpoint
const getQueueTrends = async (req, res, next) => {
  try {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Bull metrics API
    const completedMetrics = await reminderQueue.getMetrics("completed", oneWeekAgo, now);
    const failedMetrics = await reminderQueue.getMetrics("failed", oneWeekAgo, now);

    // Format daily buckets
    const formatMetrics = (metrics) => {
      return metrics.map((m) => ({
        date: new Date(m.timestamp).toISOString().split("T")[0],
        count: m.count,
        meanMs: m.meanMs,
      }));
    };

    return sendResponse(res, {
      success: true,
      message: "Queue trends fetched successfully",
      data: {
        completed: formatMetrics(completedMetrics),
        failed: formatMetrics(failedMetrics),
      },
    });
  } catch (error) {
    next(new ApiError(500, `Error fetching queue trends: ${error.message}`));
  }
};

// New monthly aggregation endpoint
const getQueueMonthlyStats = async (req, res, next) => {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1).getTime();

    const completedMetrics = await reminderQueue.getMetrics("completed", oneYearAgo, now.getTime());
    const failedMetrics = await reminderQueue.getMetrics("failed", oneYearAgo, now.getTime());

    const aggregateByMonth = (metrics) => {
      const buckets = {};
      metrics.forEach((m) => {
        const d = new Date(m.timestamp);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!buckets[key]) buckets[key] = { count: 0, meanMs: 0, samples: 0 };
        buckets[key].count += m.count;
        buckets[key].meanMs += m.meanMs;
        buckets[key].samples++;
      });
      return Object.entries(buckets).map(([month, data]) => ({
        month,
        count: data.count,
        avgDurationMs: (data.meanMs / data.samples).toFixed(0),
      }));
    };

    return sendResponse(res, {
      success: true,
      message: "Monthly queue stats fetched successfully",
      data: {
        completed: aggregateByMonth(completedMetrics),
        failed: aggregateByMonth(failedMetrics),
      },
    });
  } catch (error) {
    next(new ApiError(500, `Error fetching monthly queue stats: ${error.message}`));
  }
};


module.exports = { getQueueStats, getQueueTrends, getQueueMonthlyStats };