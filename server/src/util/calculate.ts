export const calculatePoweredScores = (
    data: any[],
    labelList: any[]
): { label: string; question: string; score: number }[] => {
    const scoreMap: Record<string, number> = {};

    data.forEach((item) => {
        const power = item.dayBefore + 1;
        const poweredScore = Math.pow(item.score, power);

        if (!scoreMap[item.label]) {
            scoreMap[item.label] = 0;
        }

        scoreMap[item.label] += poweredScore;
    });

    const result = Object.entries(scoreMap)
        .map(([label, score]) => {
            const found = labelList.find((l) => l.label === label);
            if (!found) return null;
            return {
                label,
                question: found.question,
                score: Number(score.toFixed(4)),
            };
        })
        .filter((item): item is { label: string; question: string; score: number } => item !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    return result;
};
