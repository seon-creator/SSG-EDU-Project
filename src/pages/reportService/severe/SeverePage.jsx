import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { nodeApi, predictionApi } from '../../../utils/api';
import './SeverePage.css';

/* global Tmapv2 */
const TMAP_API_KEY = process.env.REACT_APP_TMAP_API;
const SeverePage = () => {
    const location = useLocation();
    const { symptoms, address } = location.state || {};
    const [emergencyRooms, setEmergencyRooms] = useState([]);
    const [dutyNames, setDutyNames] = useState([]);
    const mapInstance = useRef(null);
    const [startlat, setStartlat] = useState(null);
    const [startlon, setStartlon] = useState(null);
    const [markerArr, setMarkerArr] = useState([]);
    const [distances, setDistances] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [selectedER, setSelectedER] = useState(null);

    // Address parsing
    const parts = address.split(' ');
    const city = parts[0];
    const district = parts[1];
    const streetAndNumber = parts.slice(2).join(' ');
    // Get Emergency Info using nodeApi
    const GetEmergencyInfo = useCallback(async () => {
        try {
            const response = await nodeApi.get(`/api/v1/api/getEmergencyInfo`, {
                params: {
                    stage1: city,
                    stage2: district
                }
            });

            const data = response.data;
            if (data && data.response && data.response.body && data.response.body.items) {
                // 응급실 정보 items에 저장
                const items = data.response.body.items.item;
                if (Array.isArray(items)) {
                    setEmergencyRooms(items);
                    // 기관명 매칭
                    setDutyNames(items.map(item => item.dutyName));
                } else if (items) {
                    setEmergencyRooms([items]);
                    setDutyNames([items.dutyName]);
                } else {
                    setEmergencyRooms([]);
                }
                setError(null);
            } else {
                setEmergencyRooms([]);
                setDutyNames([]);
                setError("데이터가 없습니다.");
            }
        } catch (error) {
            console.error("API 요청 중 오류 발생:", error);
            setError("데이터 요청 중 오류가 발생했습니다.");
            setEmergencyRooms([]);
        } finally {
            setLoading(false);
        }
    }, [city, district]);

    // Initialize map
    const initializeMap = useCallback(() => {
        if (!emergencyRooms) return;

        const mapDiv = document.getElementById('mapContainer');
        if (mapDiv && !mapDiv.firstChild && window.Tmapv2) {
            mapInstance.current = new Tmapv2.Map("mapContainer", {
                center: new Tmapv2.LatLng(37.5665, 126.9780),
                width: "100%",
                height: "100%",
                zoom: 14
            });

            if (address) {
                const geocodeUrl = `https://apis.openapi.sk.com/tmap/geo/geocoding?version=1&format=json&city_do=${encodeURIComponent(city)}&gu_gun=${encodeURIComponent(district)}&dong=${encodeURIComponent(streetAndNumber)}&addressFlag=F00&coordType=WGS84GEO&appKey=${TMAP_API_KEY}`;

                fetch(geocodeUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.coordinateInfo && data.coordinateInfo.newLat && data.coordinateInfo.newLon) {
                            const lat = parseFloat(data.coordinateInfo.newLat);
                            const lon = parseFloat(data.coordinateInfo.newLon);
                            setStartlat(lat);
                            setStartlon(lon);

                            mapInstance.current.setCenter(new Tmapv2.LatLng(lat, lon));

                            new Tmapv2.Marker({
                                position: new Tmapv2.LatLng(lat, lon),
                                icon: "http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_p.png",
                                iconSize: new Tmapv2.Size(24, 38),
                                map: mapInstance.current,
                            });
                        } else {
                            alert("환자 위치의 좌표를 찾을 수 없습니다.");
                        }
                    })
                    .catch(error => {
                        console.error("지오코딩 중 오류 발생:", error);
                    });
            }
        }
    }, [address, city, district, streetAndNumber, emergencyRooms]);
    // Calculate driving distance
    const calculateDrivingDistance = async (startLat, startLon, endLat, endLon) => {
        const headers = {
            'appKey': TMAP_API_KEY,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        const url = `https://apis.openapi.sk.com/tmap/routes?version=1&format=json`;
        const body = {
            startX: startLon,
            startY: startLat,
            endX: endLon,
            endY: endLat,
            reqCoordType: "WGS84GEO",
            resCoordType: "WGS84GEO",
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const distance = data.features[0].properties.totalDistance / 1000;
                return distance.toFixed(3);
            }
            throw new Error("No valid route data found.");
        } catch (error) {
            console.error("Error calculating driving distance:", error);
            return null;
        }
    };

    // Calculate predicted time using ML model
    const calculateDrivingTime = async (startLat, startLon, distance) => {
        try {
            const response = await predictionApi.calculateTime(startLat, startLon, distance);
            return response.data.predicted_time;
        } catch (error) {
            console.error("시간 계산 중 오류 발생:", error);
            return null;
        }
    };

    // Search and mark POIs
    const searchAndMarkPois = async () => {
        markerArr.forEach(marker => marker.setMap(null));
        setMarkerArr([]);
        setDistances([]);
        setLocations([]);

        const distanceResults = [];
        const locationResults = [];

        for (const dutyname of dutyNames) {
            const url = `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${encodeURIComponent(dutyname)}&searchType=all&searchtypCd=A&page=1&count=1&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&appKey=${TMAP_API_KEY}`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.searchPoiInfo && data.searchPoiInfo.pois.poi.length > 0) {
                    const poi = data.searchPoiInfo.pois.poi[0];
                    const lat = parseFloat(poi.noorLat);
                    const lon = parseFloat(poi.noorLon);

                    const distance = await calculateDrivingDistance(startlat, startlon, lat, lon);

                    const marker = new Tmapv2.Marker({
                        position: new Tmapv2.LatLng(lat, lon),
                        icon: "http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_p.png",
                        iconSize: new Tmapv2.Size(24, 38),
                        title: `${dutyname} (${distance} km)`,
                        map: mapInstance.current,
                    });

                    setMarkerArr(prev => [...prev, marker]);
                    locationResults.push({ dutyname, lat, lon });

                    if (distance !== null) {
                        distanceResults.push({ dutyname, distance });
                    }
                }
            } catch (error) {
                console.error(`"${dutyname}"에 대한 위치 정보 요청 중 오류 발생:`, error);
            }
        }

        setDistances(distanceResults);
        setLocations(locationResults);
    };
    // Update destination using nodeApi
    const updateDestination = async (selectedHospital) => {
        try {
            await nodeApi.patch('/api/v1/report/update-destination', {
                address,
                symptoms,
                destination: selectedHospital
            });
            console.log('Report updated successfully with destination.');
        } catch (error) {
            console.error('Report 업데이트 중 오류 발생:', error);
            throw new Error('병원 정보를 업데이트하는 중 오류가 발생했습니다.');
        }
    };

    // Handle hospital selection
    const handleHospitalSelection = async () => {
        if (!selectedER) {
            alert('병원을 선택해주세요!');
            return;
        }

        const matchedLocation = locations.find(location => location.dutyname === selectedER.dutyName);
        const matchedDistance = distances.find(distance => distance.dutyname === selectedER.dutyName);

        if (!matchedLocation) {
            alert('병원의 위치 정보를 찾을 수 없습니다.');
            return;
        }

        try {
            await updateDestination(selectedER.dutyName);

            const predictedTime = await calculateDrivingTime(
                startlat,
                startlon,
                matchedDistance ? parseFloat(matchedDistance.distance) : 0
            );

            navigate('/route/guide', {
                state: {
                    patientLat: startlat,
                    patientLon: startlon,
                    hospitalLat: matchedLocation.lat,
                    hospitalLon: matchedLocation.lon,
                    roadDistance: matchedDistance ? matchedDistance.distance : null,
                    selectedHospital: selectedER.dutyName,
                    address,
                    predictedTime
                }
            });
        } catch (error) {
            alert(error.message);
        }
    };

    // Effects
    useEffect(() => {
        GetEmergencyInfo();
    }, [GetEmergencyInfo]);

    useEffect(() => {
        if (emergencyRooms) {
            if (!window.Tmapv2) {
                const script = document.createElement('script');
                script.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${TMAP_API_KEY}`;
                script.async = true;
                script.onload = () => {
                    initializeMap();
                };
                document.head.appendChild(script);
            } else {
                initializeMap();
            }
        }
    }, [initializeMap, emergencyRooms]);

    useEffect(() => {
        if (mapInstance.current && startlat !== null && startlon !== null) {
            searchAndMarkPois();
        }
    }, [startlat, startlon, mapInstance.current, dutyNames]);
    if (loading) return <p>데이터를 불러오는 중입니다...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="severe-diagnosis-page">
            <div className="severe-title-area">
                <h1 className="page-title">증상 기반 진단결과: 중증</h1>
                <p className="page-subtitle">{city} {district} 주변 응급실을 확인해보세요.</p>
            </div>

            <div className="severe-content-container">
                {/* 지도 영역 */}
                <div className="map-container" id="mapContainer"></div>

                {/* 응급실 목록 영역 */}
                <div className="emergency-room-list">
                    <div className="emergency-room-list-scroll">
                        <h3>* 5,000개 이상 구급 출동 데이터로 학습된 인공지능 모델이 거리에 따른 소요시간을 예측합니다.</h3>

                        {emergencyRooms.length > 0 ? (
                            emergencyRooms.map((er, index) => {
                                const matchedDistance = distances.find(
                                    distance => distance.dutyname === er.dutyName
                                );

                                return (
                                    <div
                                        className={`emergency-room-card ${selectedER?.dutyName === er.dutyName ? 'selected' : ''}`}
                                        key={index}
                                        onClick={() => setSelectedER(er)}
                                    >
                                        <h2 className="emergency-room-name">
                                            {er.dutyName}
                                        </h2>
                                        <p className="emergency-room-details">
                                            입력일시: {`${String(er.hvidate).slice(0, 4)}-${String(er.hvidate).slice(4, 6)}-${String(er.hvidate).slice(6, 8)} ${String(er.hvidate).slice(8, 10)}:${String(er.hvidate).slice(10, 12)}:${String(er.hvidate).slice(12, 14)}`}
                                        </p>
                                        <p className="emergency-room-details">
                                            응급실: {er.hvec}
                                        </p>
                                        <p className="emergency-room-details">
                                            수술실: {er.hvoc}
                                        </p>
                                        <p className="emergency-room-details">
                                            구급차 가용 여부: {er.hvamyn}
                                        </p>
                                        <p className="emergency-room-details">
                                            응급실 전화: {er.dutyTel3}
                                        </p>
                                        <p className="emergency-room-details">
                                            거리: {matchedDistance
                                                ? `${matchedDistance.distance} km`
                                                : "정보 없음"}
                                        </p>

                                        {/* 선택된 카드에만 버튼 표시 */}
                                        {selectedER?.dutyName === er.dutyName && (
                                            <div className="select-button-wrapper">
                                                <button
                                                    className="select-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleHospitalSelection();
                                                    }}
                                                >
                                                    선택하기
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            !loading && <p>응급실 정보가 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeverePage;