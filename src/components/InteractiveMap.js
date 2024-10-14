import React, { useEffect, useState, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { supabase } from '/lib/supabaseClient';
import { scaleQuantize } from 'd3-scale';
import { max } from 'd3-array';
import { interpolateGreens } from 'd3-scale-chromatic';
import { geoMercator } from 'd3-geo';

const mapUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const InteractiveMap = () => {
    const [countriesData, setCountriesData] = useState([]);
    const [countryMapping, setCountryMapping] = useState({});
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [tooltipData, setTooltipData] = useState({ osType: '', deviceType: '', count: 0 });
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1.5); // Initial zoom level
    const [translate, setTranslate] = useState([-500, 0]); // Adjusted initial translation
    const svgRef = useRef();

    const projection = geoMercator()
        .scale(150)
        .center([0, 10]) // Center on the globe
        .translate([svgRef.current ? svgRef.current.clientWidth / 2 : 0, svgRef.current ? svgRef.current.clientHeight / 2 : 0]); // Center dynamically

    useEffect(() => {
        const fetchCountryMapping = async () => {
            const response = await fetch('/assets/data/country_names.json');
            const data = await response.json();
            setCountryMapping(data);
        };
        fetchCountryMapping();
    }, []);

    const fetchCountryStats = async () => {
        const { data, error } = await supabase
            .from('qr_code_scans')
            .select('country, os_type, device_type');

        if (error) {
            console.error('Error fetching country stats:', error);
            return;
        }

        const groupedData = data.reduce((acc, scan) => {
            const { country, os_type, device_type } = scan;
            if (country) {
                acc[country] = acc[country] || { count: 0, osTypes: {}, deviceTypes: {} };
                acc[country].count += 1;
                acc[country].osTypes[os_type] = (acc[country].osTypes[os_type] || 0) + 1;
                acc[country].deviceTypes[device_type] = (acc[country].deviceTypes[device_type] || 0) + 1;
            }
            return acc;
        }, {});

        const formattedData = Object.entries(groupedData).map(([country, { count, osTypes, deviceTypes }]) => ({
            country,
            count,
            osTypes,
            deviceTypes,
        }));

        setCountriesData(formattedData);
    };

    useEffect(() => {
        fetchCountryStats();
    }, []);

    const getCountryStats = (countryCode) => {
        const country = countriesData.find(c => c.country === countryCode);
        return country ? country : { count: 0, osTypes: {}, deviceTypes: {} };
    };

    const colorScale = scaleQuantize()
        .domain([0, max(countriesData.map(d => d.count)) || 1])
        .range(interpolateGreens);

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev * 1.2, 4));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev / 1.2, 1));
    };

    const handleDragStart = (event) => {
        event.preventDefault();
        const [startX, startY] = [event.clientX, event.clientY];

        const handleDrag = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            setTranslate(prev => [prev[0] + dx * 0.1, prev[1] + dy * 0.1]);
        };

        const handleDragEnd = () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
        };

        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', handleDragEnd);
    };

    return (
        <div className="container mx-auto my-8">
            <div className="mt-8 w-full bg-white shadow-md rounded-lg p-4 relative ">
                <svg
                    ref={svgRef}
                    width="100%"
                    height={400}
                    style={{ backgroundColor: '#f0f0f0' }}
                    onMouseDown={handleDragStart}
                >
                    <g transform={`translate(${translate[0]}, ${translate[1]}) scale(${scale})`}>
                        <ComposableMap projection={projection}>
                            <Geographies geography={mapUrl}>
                                {({ geographies }) =>
                                    geographies.map(geo => {
                                        const countryName = geo.properties.name;
                                        const countryCode = Object.keys(countryMapping).find(code => countryMapping[code] === countryName);
                                        const countryStats = getCountryStats(countryCode);
                                        const scanCount = countryStats.count;

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={scanCount > 0 ? colorScale(scanCount) : "#eeeeee"}
                                                stroke="#000"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: "none", transition: 'all 0.3s ease' },
                                                    hover: { fill: "#2e7d32", transition: "all 0.3s" },
                                                    pressed: { outline: "none" }
                                                }}
                                                onMouseEnter={(event) => {
                                                    setHoveredCountry(countryName);
                                                    setTooltipPosition({ x: event.clientX, y: event.clientY });
                                                    const osType = Object.entries(countryStats.osTypes).reduce((a, b) => b[1] > a[1] ? b : a, ["", 0])[0];
                                                    const deviceType = Object.entries(countryStats.deviceTypes).reduce((a, b) => b[1] > a[1] ? b : a, ["", 0])[0];
                                                    setTooltipData({ osType, deviceType, count: scanCount });
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredCountry(null);
                                                    setTooltipData({ osType: '', deviceType: '', count: 0 });
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ComposableMap>
                    </g>
                </svg>
                {hoveredCountry && (
                    <CustomTooltip
                        country={hoveredCountry}
                        count={tooltipData.count}
                        osType={tooltipData.osType}
                        deviceType={tooltipData.deviceType}
                        position={tooltipPosition}
                    />
                )}
                <div className="absolute bottom-4 right-4 flex flex-col">
                    <button
                        onClick={handleZoomIn}
                        className="p-2 bg-blue-600 text-white rounded-lg mb-1 transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center"
                    >
                        <span role="img" aria-label="Zoom In">🔍</span>
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-2 bg-red-600 text-white rounded-lg transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center"
                    >
                        <span role="img" aria-label="Zoom Out">🔍</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const CustomTooltip = ({ country, count, osType, deviceType, position }) => (
    <div className="tooltip" style={{
        position: 'absolute',
        left: position.x + 10,
        top: position.y + 10,
        pointerEvents: 'none',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: '8px',
        borderRadius: '5px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        transition: 'opacity 0.3s ease',
        opacity: 0.9,
    }}>
        <h4 style={{ margin: 0 }}>{country}</h4>
        <p style={{ margin: '5px 0' }}>Scans: {count}</p>
        {osType && <p style={{ margin: '5px 0' }}>OS: {osType}</p>}
        {deviceType && <p style={{ margin: '5px 0' }}>Device: {deviceType}</p>}
    </div>
);

export default InteractiveMap;
