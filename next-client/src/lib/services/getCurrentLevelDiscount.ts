export const LOYALTY_LEVELS = [
    { minReviews: 0, discount: 0, label: "Beginner" },
    { minReviews: 5, discount: 5, label: "Active Critic" },
    { minReviews: 10, discount: 10, label: "Gold Member" },
];

export const getCurrentLevelDiscount = (reviewCount: number) => {
    return [...LOYALTY_LEVELS].reverse().find(level => reviewCount >= level.minReviews)
           || LOYALTY_LEVELS[0];
};

export const getNextLevelDiscount = (reviewCount: number) => {
    return LOYALTY_LEVELS.find(level => reviewCount < level.minReviews) || null;
};