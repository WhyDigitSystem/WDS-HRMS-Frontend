// Utility functions for perspective calculations

// Calculate perspective-wise ratings
export const calculatePerspectiveRatings = (performanceData) => {
    if (!performanceData || performanceData.length === 0) {
        return [];
    }

    const validGoals = performanceData.filter((goal) => goal.objectivedesc);
    
    // Group by perspective
    const perspectiveMap = {};
    
    validGoals.forEach(goal => {
        const perspective = goal.perspective || 'Other';
        const appraiserRating = parseFloat(goal.appraiserrating) || 0;
        const perAssigned = parseFloat(goal.perassigned) || 0;
        
        if (!perspectiveMap[perspective]) {
            perspectiveMap[perspective] = {
                perspective,
                totalRating: 0,
                totalWeight: 0,
                count: 0,
                goals: []
            };
        }
        
        perspectiveMap[perspective].totalRating += appraiserRating * (perAssigned / 100);
        perspectiveMap[perspective].totalWeight += perAssigned / 100;
        perspectiveMap[perspective].count += 1;
        perspectiveMap[perspective].goals.push(goal);
    });

    // Calculate weighted average for each perspective
    const perspectives = Object.values(perspectiveMap).map(perspective => ({
        ...perspective,
        averageRating: perspective.totalWeight > 0 ? (perspective.totalRating / perspective.totalWeight) : 0
    }));

    return perspectives;
};

// Calculate overall performance metrics
export const calculatePerformanceMetrics = (performanceData) => {
    if (!performanceData || performanceData.length === 0) {
        return {
            totalGoals: 0,
            percentageAssigned: 0,
            avgSelfRating: 0,
            avgAppraiserRating: 0,
            finalScore: 0
        };
    }

    const validGoals = performanceData.filter((goal) => goal.objectivedesc);

    const totalGoals = validGoals.length;
    const totalSelfRating = validGoals.reduce(
        (sum, goal) => sum + (parseFloat(goal.selfrating) || 0),
        0
    );
    const totalAppraiserRating = validGoals.reduce(
        (sum, goal) => sum + (parseFloat(goal.appraiserrating) || 0),
        0
    );
    const totalAssigned = validGoals.reduce((sum, goal) => {
        const assigned = parseFloat(goal.perassigned) || 0;
        return sum + assigned;
    }, 0);

    const avgSelfRating = totalGoals > 0 ? parseFloat((totalSelfRating / totalGoals).toFixed(1)) : 0;
    const avgAppraiserRating = totalGoals > 0 ? parseFloat((totalAppraiserRating / totalGoals).toFixed(1)) : 0;

    // Calculate final score - Sum of (appraiser rating * percentage assigned)
    const totalScore = validGoals.reduce((sum, goal) => {
        const perAssignedDecimal = (parseFloat(goal.perassigned) || 0) / 100;
        const appraiserRating = parseFloat(goal.appraiserrating) || 0;
        return sum + (appraiserRating * perAssignedDecimal);
    }, 0);

    return {
        totalGoals,
        percentageAssigned: totalAssigned,
        avgSelfRating,
        avgAppraiserRating,
        finalScore: parseFloat(totalScore.toFixed(2))
    };
};

// Helper function to parse percentage values
export const parsePercentage = (value) => {
    if (!value) return 0;
    const num = parseFloat(value.toString().replace('%', '').trim());
    return isNaN(num) ? 0 : num / 100;
};