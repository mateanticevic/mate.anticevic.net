import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import TrackingLineChart from './TrackingLineChart';

export type TrackingPoint = google.maps.LatLngLiteral & {
    timestamp: number | null;
    speed: number | null;
    elevation: number | null;
};

export function parseTimestamp(value: unknown): number | null {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    // Numeric Unix timestamps may be expressed in seconds or milliseconds.
    const timestamp = typeof value === 'number'
        ? new Date(value < 1e12 ? value * 1000 : value).getTime()
        : Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : null;
}

function distanceKm(points: TrackingPoint[]): number {
    const radians = (degrees: number) => degrees * Math.PI / 180;
    return points.slice(1).reduce((total, point, index) => {
        const previous = points[index];
        const a = Math.sin(radians(point.lat - previous.lat) / 2) ** 2
            + Math.cos(radians(previous.lat)) * Math.cos(radians(point.lat))
            * Math.sin(radians(point.lng - previous.lng) / 2) ** 2;
        return total + 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
    }, 0);
}

export default function TrackingStats({ points }: { points: TrackingPoint[] }) {
    const chartPoints = useMemo(() => points
        .filter((point): point is TrackingPoint & { timestamp: number } => point.timestamp !== null)
        .slice().sort((a, b) => a.timestamp - b.timestamp), [points]);
    const times = points.flatMap(point => point.timestamp === null ? [] : [point.timestamp]);
    const from = times.length ? times.reduce((a, b) => Math.min(a, b)) : null;
    const to = times.length ? times.reduce((a, b) => Math.max(a, b)) : null;
    const speeds = points.flatMap(point => point.speed === null ? [] : [point.speed]);
    const maxSpeed = speeds.length ? speeds.reduce((a, b) => Math.max(a, b)) * 3.6 : null;
    const avgSpeed = speeds.length && points.length
        ? speeds.reduce((sum, speed) => sum + speed, 0) / points.length * 3.6 : null;
    const seconds = from !== null && to !== null ? Math.floor((to - from) / 1000) : null;
    const duration = seconds === null ? 'Unavailable'
        : `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${seconds % 60}s`;
    const formatDate = (value: number | null) => value === null ? 'Unavailable'
        : new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium', timeStyle: 'medium', hourCycle: 'h23',
        }).format(value);
    const stats = [
        ['Duration', duration],
        ['Max speed', maxSpeed === null ? 'Unavailable' : `${maxSpeed.toFixed(1)} km/h`],
        ['Distance (approx.)', `${distanceKm(points).toFixed(2)} km`],
        ['Avg speed', avgSpeed === null ? 'Unavailable' : `${avgSpeed.toFixed(1)} km/h`],
    ];

    return <Card component="section" aria-label="Tracking statistics" elevation={4} sx={{
        position: { xs: 'relative', sm: 'fixed' },
        top: { xs: 'auto', sm: 24 }, left: { xs: 'auto', sm: 24 },
        width: { xs: '100%', sm: 320 }, maxWidth: { xs: 'none', sm: 360 },
        flexShrink: 0, maxHeight: { xs: '50dvh', sm: 'calc(100% - 48px)' },
        overflowY: 'auto', borderRadius: { xs: '16px 16px 0 0', sm: 3 },
    }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': {
            pb: { xs: 'max(16px, env(safe-area-inset-bottom))', sm: 2.5 },
        } }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 } }}>
                Tracking stats
            </Typography>
            <Box component="dl" sx={{ m: 0 }}>
                <Box sx={{ display: { xs: 'grid', sm: 'block' }, gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {[['From', formatDate(from)], ['To', formatDate(to)]].map(([label, value]) =>
                    <Box key={label} sx={{ mb: { xs: 0.5, sm: 1.5 }, minWidth: 0 }}>
                        <Typography component="dt" variant="caption" color="text.secondary">{label}</Typography>
                        <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 500 }}>{value}</Typography>
                    </Box>)}
                </Box>
                <Typography variant="caption" color="text.secondary">
                    Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </Typography>
                <Divider sx={{ my: { xs: 1, sm: 2 } }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: { xs: 1, sm: 2 } }}>
                    {stats.map(([label, value]) => <Box key={label}>
                        <Typography component="dt" variant="caption" color="text.secondary">{label}</Typography>
                        <Typography component="dd" variant="body1" sx={{ m: 0, fontWeight: 600 }}>{value}</Typography>
                    </Box>)}
                </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'grid', gap: 2 }}>
                <TrackingLineChart title="Elevation" unit="m" color="#2e7d32"
                    samples={chartPoints.map(point => ({ timestamp: point.timestamp, value: point.elevation }))}
                    from={from} to={to} />
                <TrackingLineChart title="Speed" unit="km/h" color="#1976d2"
                    samples={chartPoints.map(point => ({ timestamp: point.timestamp,
                        value: point.speed === null ? null : point.speed * 3.6 }))}
                    from={from} to={to} />
            </Box>
        </CardContent>
    </Card>;
}
