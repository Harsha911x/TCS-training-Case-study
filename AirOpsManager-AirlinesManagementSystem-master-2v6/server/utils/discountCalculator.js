/**
 * Discount Calculator Module
 * 
 * This module handles all discount calculations for bookings:
 * - Quantity-based discounts (bulk booking)
 * - Customer tier discounts (loyalty program)
 * - Advance booking discounts
 * 
 * All discount percentages are configurable via constants at the top.
 */

// ==================== CONFIGURATION CONSTANTS ====================
// These can be easily adjusted without changing the logic

// Quantity Discount Tiers (based on number of seats booked)
const QUANTITY_DISCOUNTS = {
  minSeats: 1,        // Minimum seats for any discount
  maxSeats: 10,       // Maximum seats allowed per booking
  tiers: {
    1: 0,             // 1 seat: 0% discount
    2: 3,             // 2-4 seats: 3% discount
    5: 7,             // 5-7 seats: 7% discount
    8: 12             // 8-10 seats: 12% discount
  }
};

// Customer Tier Thresholds (based on bookings last month)
const CUSTOMER_TIERS = {
  Silver: {
    minBookings: 5,
    maxBookings: 9,
    discountPercent: 5    // 5% discount for Silver tier
  },
  Gold: {
    minBookings: 10,
    maxBookings: 14,
    discountPercent: 10   // 10% discount for Gold tier
  },
  Platinum: {
    minBookings: 15,
    maxBookings: Infinity,
    discountPercent: 15   // 15% discount for Platinum tier
  }
};

// Advance Booking Discount
const ADVANCE_BOOKING = {
  minDays: 5,              // Minimum days in advance
  discountPercent: 8       // 8% discount for advance booking
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate quantity discount based on number of seats
 * @param {number} seatCount - Number of seats being booked (1-10)
 * @returns {number} Discount percentage (0-12)
 */
function getQuantityDiscount(seatCount) {
  if (seatCount < QUANTITY_DISCOUNTS.minSeats || seatCount > QUANTITY_DISCOUNTS.maxSeats) {
    return 0;
  }

  if (seatCount === 1) {
    return QUANTITY_DISCOUNTS.tiers[1];
  } else if (seatCount >= 2 && seatCount <= 4) {
    return QUANTITY_DISCOUNTS.tiers[2];
  } else if (seatCount >= 5 && seatCount <= 7) {
    return QUANTITY_DISCOUNTS.tiers[5];
  } else if (seatCount >= 8 && seatCount <= 10) {
    return QUANTITY_DISCOUNTS.tiers[8];
  }

  return 0;
}

/**
 * Determine customer tier based on number of bookings last month
 * @param {number} bookingsLastMonth - Number of confirmed bookings in previous month
 * @returns {string} Tier name: "None" | "Silver" | "Gold" | "Platinum"
 */
function getCustomerTier(bookingsLastMonth) {
  if (bookingsLastMonth >= CUSTOMER_TIERS.Platinum.minBookings) {
    return "Platinum";
  } else if (bookingsLastMonth >= CUSTOMER_TIERS.Gold.minBookings) {
    return "Gold";
  } else if (bookingsLastMonth >= CUSTOMER_TIERS.Silver.minBookings) {
    return "Silver";
  }
  return "None";
}

/**
 * Get discount percentage for a customer tier
 * @param {string} tier - Customer tier: "None" | "Silver" | "Gold" | "Platinum"
 * @returns {number} Discount percentage
 */
function getTierDiscount(tier) {
  if (tier === "Platinum") return CUSTOMER_TIERS.Platinum.discountPercent;
  if (tier === "Gold") return CUSTOMER_TIERS.Gold.discountPercent;
  if (tier === "Silver") return CUSTOMER_TIERS.Silver.discountPercent;
  return 0;
}

/**
 * Check if advance booking discount applies
 * @param {string} departureTime - Flight departure time (format: "YYYY-MM-DD HH:mm:ss")
 * @returns {boolean} True if booking is at least N days in advance
 */
function isAdvanceBooking(departureTime) {
  if (!departureTime) return false;

  try {
    const depDate = new Date(departureTime.replace(" ", "T"));
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    const diffTime = depDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= ADVANCE_BOOKING.minDays;
  } catch (error) {
    console.error("Error checking advance booking:", error);
    return false;
  }
}

// ==================== MAIN CALCULATION FUNCTION ====================

/**
 * Calculate total price with all applicable discounts
 * 
 * Discounts are applied sequentially:
 * 1. Quantity discount (on base price)
 * 2. Tier discount (on price after quantity discount)
 * 3. Advance booking discount (on price after tier discount)
 * 
 * @param {Object} params - Booking parameters
 * @param {number} params.basePricePerSeat - Base fare per seat
 * @param {number} params.seatCount - Number of seats (1-10)
 * @param {number} params.bookingsLastMonth - Client's bookings count last month
 * @param {string} params.departureTime - Flight departure time
 * @returns {Object} Price breakdown with all discounts
 */
function calculatePriceWithDiscounts({
  basePricePerSeat,
  seatCount,
  bookingsLastMonth = 0,
  departureTime = null
}) {
  // Validate inputs
  if (!basePricePerSeat || basePricePerSeat <= 0) {
    throw new Error("Base price per seat must be greater than 0");
  }

  if (!seatCount || seatCount < 1 || seatCount > 10) {
    throw new Error("Seat count must be between 1 and 10");
  }

  // Step 1: Calculate base total (before any discounts)
  const baseTotal = basePricePerSeat * seatCount;

  // Step 2: Apply quantity discount
  const quantityDiscountPercent = getQuantityDiscount(seatCount);
  const quantityDiscountAmount = (baseTotal * quantityDiscountPercent) / 100;
  const priceAfterQuantity = baseTotal - quantityDiscountAmount;

  // Step 3: Determine customer tier and apply tier discount
  const customerTier = getCustomerTier(bookingsLastMonth);
  const tierDiscountPercent = getTierDiscount(customerTier);
  const tierDiscountAmount = (priceAfterQuantity * tierDiscountPercent) / 100;
  const priceAfterTier = priceAfterQuantity - tierDiscountAmount;

  // Step 4: Check and apply advance booking discount
  const isAdvance = isAdvanceBooking(departureTime);
  const advanceDiscountPercent = isAdvance ? ADVANCE_BOOKING.discountPercent : 0;
  const advanceDiscountAmount = (priceAfterTier * advanceDiscountPercent) / 100;
  const finalTotal = priceAfterTier - advanceDiscountAmount;

  // Calculate total discount amount
  const totalDiscountAmount = quantityDiscountAmount + tierDiscountAmount + advanceDiscountAmount;
  const totalDiscountPercent = (totalDiscountAmount / baseTotal) * 100;

  return {
    // Base pricing
    basePricePerSeat: basePricePerSeat,
    seatCount: seatCount,
    baseTotal: Math.round(baseTotal * 100) / 100,

    // Quantity discount
    quantityDiscount: {
      percent: quantityDiscountPercent,
      amount: Math.round(quantityDiscountAmount * 100) / 100,
      applied: quantityDiscountPercent > 0
    },

    // Tier discount
    tierDiscount: {
      tier: customerTier,
      percent: tierDiscountPercent,
      amount: Math.round(tierDiscountAmount * 100) / 100,
      applied: tierDiscountPercent > 0,
      bookingsLastMonth: bookingsLastMonth
    },

    // Advance booking discount
    advanceDiscount: {
      percent: advanceDiscountPercent,
      amount: Math.round(advanceDiscountAmount * 100) / 100,
      applied: isAdvance,
      daysInAdvance: isAdvance ? Math.floor(
        (new Date(departureTime.replace(" ", "T")) - new Date()) / (1000 * 60 * 60 * 24)
      ) : null
    },

    // Final totals
    totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
    totalDiscountPercent: Math.round(totalDiscountPercent * 100) / 100,
    finalTotal: Math.round(finalTotal * 100) / 100,

    // Summary
    savings: Math.round(totalDiscountAmount * 100) / 100
  };
}

// ==================== EXPORTS ====================

module.exports = {
  calculatePriceWithDiscounts,
  getCustomerTier,
  getQuantityDiscount,
  isAdvanceBooking,
  // Export constants for reference
  QUANTITY_DISCOUNTS,
  CUSTOMER_TIERS,
  ADVANCE_BOOKING
};

