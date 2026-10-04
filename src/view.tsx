import React, { useEffect, useState } from 'react';
import { PolylineF, useGoogleMap } from '@react-google-maps/api';
import Map from './components/Map';
import Box from '@mui/material/Box';
import TrackingStats, { parseTimestamp, TrackingPoint } from './components/TrackingStats';

function TrackingPolyline({ paths }: { paths: google.maps.LatLngLiteral[] }) {
    const map = useGoogleMap();

    useEffect(() => {
        if (!map || paths.length === 0) return;
        const bounds = new google.maps.LatLngBounds();
        paths.forEach(point => bounds.extend(point));
        map.fitBounds(bounds, 48);
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) map.setZoom(17);
    }, [map, paths]);

    return <PolylineF path={paths} options={{
        strokeColor: '#4285f4',
        strokeOpacity: 1,
        strokeWeight: 3,
    }} />;
}

export default function ViewPage({ viewId }: { viewId: string }) {
    const [paths, setPaths] = useState<TrackingPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        setPaths([]);

        async function loadTrackings() {
            try {
                const id = encodeURIComponent(decodeURIComponent(viewId));
                const response = await fetch(
                    `https://api.anticevic.net/user/mate/trackingView/${id}`,
                    { signal: controller.signal },
                );
                if (!response.ok) throw new Error('Unable to load this tracking view.');
                const trackings: unknown = await response.json();
                if (!Array.isArray(trackings)) throw new Error('Invalid tracking view response.');
                const points = trackings.flatMap(tracking => {
                    if (!tracking || typeof tracking !== 'object') return [];
                    const lat = tracking.latitude ?? tracking.lat;
                    const lng = tracking.longitude ?? tracking.lng;
                    return typeof lat === 'number' && typeof lng === 'number'
                        && Number.isFinite(lat) && Number.isFinite(lng)
                        && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
                        ? [{ lat, lng,
                            timestamp: parseTimestamp(tracking.timestamp ?? tracking.dateTime
                                ?? tracking.recordedAt ?? tracking.date ?? tracking.createdAt ?? tracking.time),
                            speed: typeof tracking.speed === 'number' && Number.isFinite(tracking.speed)
                                && tracking.speed >= 0 ? tracking.speed : null,
                        }] : [];
                });
                if (!controller.signal.aborted) {
                    setPaths(points);
                    if (points.length === 0) setError('No tracking points found for this view.');
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(error instanceof Error ? error.message : 'Unable to load this tracking view.');
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        void loadTrackings();
        return () => controller.abort();
    }, [viewId]);

    return <Box sx={{ height: { xs: '100dvh', sm: '100%' }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
            <Map>
                {paths.length > 0 && <TrackingPolyline paths={paths} />}
            </Map>
        </Box>
        {!loading && !error && paths.length > 0 && <TrackingStats points={paths} />}
        {loading && <div className="page-loader" role="status" aria-label="Loading tracking view">
            <div className="loader-spinner" />
        </div>}
        {error && <div className="view-message" role="alert">{error}</div>}
    </Box>;
}
