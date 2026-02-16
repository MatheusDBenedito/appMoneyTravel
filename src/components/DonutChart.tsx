

interface DonutChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
    size?: number;
    strokeWidth?: number;
}

export default function DonutChart({ data, size = 200, strokeWidth = 20 }: DonutChartProps) {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    if (total === 0) {
        return (
            <div className="flex items-center justify-center text-gray-400 text-sm" style={{ width: size, height: size }}>
                Sem dados
            </div>
        );
    }

    let accumulatedValue = 0;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                {data.map((item, index) => {
                    const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedValue / total) * circumference);
                    accumulatedValue += item.value;

                    return (
                        <circle
                            key={index}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500 ease-out hover:opacity-80"
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-800">${total.toFixed(0)}</span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</span>
            </div>
        </div>
    );
}
