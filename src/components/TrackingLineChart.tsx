import React, { useId } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Sample = { timestamp: number; value: number | null };
type Props = {
    title: string;
    unit: string;
    color: string;
    samples: Sample[];
    from: number | null;
    to: number | null;
};

export default function TrackingLineChart({ title, unit, color, samples, from, to }: Props) {
    const id = useId();
    const values = samples.flatMap(sample => sample.value !== null && Number.isFinite(sample.value)
        ? [sample.value] : []);
    if (!values.length || from === null || to === null) {
        return <Box>
            <Typography component="h3" variant="subtitle2">{title}</Typography>
            <Typography variant="body2" color="text.secondary">{title} unavailable</Typography>
        </Box>;
    }

    const minimum = values.reduce((a, b) => Math.min(a, b));
    const maximum = values.reduce((a, b) => Math.max(a, b));
    const padding = maximum === minimum ? Math.max(Math.abs(minimum) * 0.05, 1)
        : (maximum - minimum) * 0.1;
    const low = minimum - padding;
    const high = maximum + padding;
    const duration = to - from;
    const left = 56;
    const right = 302;
    const top = 24;
    const bottom = 134;
    const x = (timestamp: number) => duration === 0 ? (left + right) / 2
        : left + (timestamp - from) / duration * (right - left);
    const y = (value: number) => bottom - (value - low) / (high - low) * (bottom - top);
    const segments: Sample[][] = [];
    let segment: Sample[] = [];
    for (const sample of samples) {
        if (sample.value === null || !Number.isFinite(sample.value)) {
            if (segment.length) segments.push(segment);
            segment = [];
        } else {
            segment.push(sample);
        }
    }
    if (segment.length) segments.push(segment);
    const numberLabel = (value: number) => new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 1, notation: Math.abs(value) >= 10000 ? 'compact' : 'standard',
    }).format(value);
    const timeFormat = new Intl.DateTimeFormat(undefined, {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    });
    const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'short' });
    const fullTimeFormat = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium', timeStyle: 'medium', hourCycle: 'h23',
    });
    const showDates = dateFormat.format(from) !== dateFormat.format(to);
    const timeTicks = duration === 0 ? [from] : [from, from + duration / 2, to];

    return <Box component="section" aria-label={`${title} chart`} sx={{ minWidth: 0 }}>
        <Typography component="h3" variant="subtitle2">{title}</Typography>
        <Box component="svg" viewBox={`0 0 320 ${showDates ? 200 : 180}`} role="img"
            aria-labelledby={`${id}-title ${id}-description`}
            sx={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible',
                fontFamily: 'inherit', fontSize: 11, color: 'text.secondary' }}>
            <title id={`${id}-title`}>{`${title} over time`}</title>
            <desc id={`${id}-description`}>
                {`${title} in ${unit}, from ${numberLabel(minimum)} to ${numberLabel(maximum)}, between ${fullTimeFormat.format(from)} and ${fullTimeFormat.format(to)} (${timeFormat.resolvedOptions().timeZone}). Missing measurements appear as gaps.`}
            </desc>
            <text x={left} y={14} fill="currentColor">{unit}</text>
            {[0, 0.5, 1].map(fraction => {
                const value = low + (high - low) * fraction;
                return <g key={fraction}>
                    <line x1={left} x2={right} y1={y(value)} y2={y(value)} stroke="currentColor" opacity={0.15} />
                    <text x={left - 6} y={y(value)} dy="0.35em" textAnchor="end" fill="currentColor">
                        {numberLabel(value)}
                    </text>
                </g>;
            })}
            {timeTicks.map((timestamp, index) => {
                const position = x(timestamp);
                return <g key={index}>
                    <line x1={position} x2={position} y1={top} y2={bottom} stroke="currentColor" opacity={0.1} />
                    <text x={position} y={bottom + 18}
                        textAnchor={duration === 0 || index === 1 ? 'middle' : index === 0 ? 'start' : 'end'}
                        fill="currentColor">
                        <tspan x={position}>{timeFormat.format(timestamp)}</tspan>
                        {showDates && <tspan x={position} dy={14}>{dateFormat.format(timestamp)}</tspan>}
                    </text>
                </g>;
            })}
            {segments.map((points, index) => points.length === 1
                ? <circle key={index} cx={x(points[0].timestamp)} cy={y(points[0].value!)} r={3} fill={color} />
                : <path key={index} d={points.map((point, i) =>
                    `${i === 0 ? 'M' : 'L'} ${x(point.timestamp)} ${y(point.value!)}`).join(' ')}
                    fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
                    vectorEffect="non-scaling-stroke" />)}
            <text x={(left + right) / 2} y={showDates ? 194 : 174} textAnchor="middle" fill="currentColor">
                Time (HH:mm:ss)
            </text>
        </Box>
    </Box>;
}
