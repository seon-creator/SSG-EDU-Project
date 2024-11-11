import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../component/NavBar';  // 상단 메뉴바
import './RecommendationPage.css';

/* global Tmapv2 */ // Tmapv2 전역 변수 선언
const TMAP_API = process.env.REACT_APP_TMAP_API

// 차로 이동 시의 거리 계산 함수
const calculateDrivingDistance = async (startLat, startLon, endLat, endLon) => {
    const headers = { appKey: "RodJLscILK5e9NJhSjh6ya7RWqlGMFJX9mnNIukK" };
    const url = `https://apis.openapi.sk.com/tmap/routes?version=1&format=json&callback=result&startX=${startLon}&startY=${startLat}&endX=${endLon}&endY=${endLat}&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&startName=출발지&endName=도착지`;

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const distance = data.features[0].properties.totalDistance / 1000; // km 단위 거리 반환
            return distance.toFixed(3);
        } else {
            throw new Error("No valid route data found.");
        }
    } catch (error) {
        console.error("Error calculating driving distance:", error);
        return null;
    }
};

// 주변 장소 검색 함수
const searchPOI = async (keyword, lat, lon, mapInstance, searchRadius, markerArr, setMarkerArr, setHospitals, setDistances, searchCache, setSearchCache) => {
    const headers = { appKey: "RodJLscILK5e9NJhSjh6ya7RWqlGMFJX9mnNIukK" };
    const url = `https://apis.openapi.sk.com/tmap/pois/search/around?version=1&format=json&callback=result&categories=${encodeURIComponent(keyword)}&resCoordType=EPSG3857&searchType=name&searchtypCd=A&radius=${searchRadius}&reqCoordType=WGS84GEO&centerLon=${lon}&centerLat=${lat}&count=20`;

    try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        let resultPoisData = data.searchPoiInfo.pois.poi || [];
        resultPoisData = resultPoisData.filter(poi => !poi.name.includes('주차장')); // "주차장" 제외

        // 기존 마커 제거
        markerArr.forEach(marker => marker.setMap(null));
        setMarkerArr([]);

        const newMarkers = [];
        const newDistances = [];

        for (let i = 0; i < resultPoisData.length; i++) {
            const poi = resultPoisData[i];
            const pointCng = new Tmapv2.Point(Number(poi.noorLon), Number(poi.noorLat));
            const projectionCng = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(pointCng);
            const markerPosition = new Tmapv2.LatLng(projectionCng._lat, projectionCng._lng);

            // 캐시 키 생성
            const cacheKey = `${searchRadius}-${lat}-${lon}-${poi.name}`;

            let distance;
            if (searchCache[cacheKey]) {
                distance = searchCache[cacheKey];
            } else {
                distance = await calculateDrivingDistance(lat, lon, projectionCng._lat, projectionCng._lng);
                if (distance) {
                    setSearchCache(prevCache => ({
                        ...prevCache,
                        [cacheKey]: distance,
                    }));
                }
            }

            if (distance && distance <= searchRadius) {
                newDistances.push({ name: poi.name, distance: parseFloat(distance) });

                // 마커 생성 및 지도에 추가
                const marker = new Tmapv2.Marker({
                    position: markerPosition,
                    icon: "http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_p.png", // 기본 병원 마커
                    iconSize: new Tmapv2.Size(16, 26),
                    title: `${poi.name} (${distance} km)`,
                });
                newMarkers.push(marker);
                marker.setMap(mapInstance); // 여기에서 mapInstance에 마커를 추가
            }
        }

        setMarkerArr(newMarkers);
        setHospitals(newDistances.map(item => item.name));
        setDistances(newDistances.map(item => item.distance));

        // 3km 이내에 병원이 없을 경우 가까운 병원 검색
        if (newDistances.length === 0) {
            const allPois = await fetchAllPOIs(keyword, lat, lon, mapInstance, markerArr, setMarkerArr, setSearchCache);
            setHospitals(allPois.map(item => item.name)); // 전체 병원 목록 설정
            setDistances(allPois.map(item => item.distance)); // 전체 병원 거리 설정
        }

    } catch (error) {
        console.error("Error:", error);
    }
};

// 모든 병원 POI 검색 함수
const fetchAllPOIs = async (keyword, lat, lon, mapInstance, markerArr, setMarkerArr, setSearchCache) => {
    const headers = { appKey: "RodJLscILK5e9NJhSjh6ya7RWqlGMFJX9mnNIukK" };
    const url = `https://apis.openapi.sk.com/tmap/pois/search/around?version=1&format=json&callback=result&categories=${encodeURIComponent(keyword)}&resCoordType=EPSG3857&searchType=name&searchtypCd=A&radius=100&reqCoordType=WGS84GEO&centerLon=${lon}&centerLat=${lat}&count=50`; // radius를 더 크게 설정하여 모든 병원 검색

    try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        let resultPoisData = data.searchPoiInfo.pois.poi || [];
        
        const allHospitals = [];

        for (let poi of resultPoisData) {
            const pointCng = new Tmapv2.Point(Number(poi.noorLon), Number(poi.noorLat));
            const projectionCng = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(pointCng);
            const distance = await calculateDrivingDistance(lat, lon, projectionCng._lat, projectionCng._lng);

            allHospitals.push({ name: poi.name, distance: distance, lat: projectionCng._lat, lon: projectionCng._lng }); // 위도와 경도도 포함
        }

        return allHospitals;
    } catch (error) {
        console.error("Error fetching all POIs:", error);
        return [];
    }
}

function RecommendationPage({ diagnosisResult = '진단 결과 없음', recommendedDepartment = '추천 과목 없음' }) {
    const { state } = useLocation();
    const { currentAddress } = state || {};
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [markerArr, setMarkerArr] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [distances, setDistances] = useState([]);
    const [searchCache, setSearchCache] = useState({});
    const navigate = useNavigate();
    const radius = 3; // 반경을 3km로 설정

    const initializeMap = useCallback(() => {
        const mapDiv = document.getElementById('mapContainer');
        if (mapDiv && !mapDiv.firstChild && window.Tmapv2) {
            const mapInstance = new Tmapv2.Map("mapContainer", {
                center: new Tmapv2.LatLng(37.5665, 126.9780),
                width: "650px",
                height: "500px",
                zoom: 14
            });

            if (currentAddress) {
                const geocodeUrl = `https://apis.openapi.sk.com/tmap/geo/fullAddrGeo?version=1&format=json&appKey=RodJLscILK5e9NJhSjh6ya7RWqlGMFJX9mnNIukK&fullAddr=${encodeURIComponent(currentAddress)}`;

                fetch(geocodeUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.coordinateInfo && data.coordinateInfo.coordinate.length > 0) {
                            const coord = data.coordinateInfo.coordinate[0];
                            const lat = coord.lat;
                            const lon = coord.lon;

                            mapInstance.setCenter(new Tmapv2.LatLng(lat, lon));

                            new Tmapv2.Marker({
                                position: new Tmapv2.LatLng(lat, lon),
                                icon: "http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_p.png",
                                iconSize: new Tmapv2.Size(24, 38),
                                map: mapInstance,
                            });

                            if (recommendedDepartment) {
                                searchPOI(recommendedDepartment, lat, lon, mapInstance, radius, markerArr, setMarkerArr, setHospitals, setDistances, searchCache, setSearchCache);
                            }
                        } else {
                            alert("환자 위치의 좌표를 찾을 수 없습니다.");
                        }
                    })
                    .catch(error => {
                        console.error("지오코딩 중 오류 발생:", error);
                    });
            } else {
                console.error("환자 위치가 제공되지 않았습니다.");
            }
        } else if (!window.Tmapv2) {
            console.error("Tmap API가 로드되지 않았습니다.");
        }
    }, [currentAddress, recommendedDepartment, radius, markerArr, searchCache]);

    useEffect(() => {
        if (!window.Tmapv2) {
            const script = document.createElement('script');
            script.src = "https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=RodJLscILK5e9NJhSjh6ya7RWqlGMFJX9mnNIukK";
            script.async = true;
            script.onload = initializeMap;
            document.head.appendChild(script);
        } else {
            initializeMap();
        }
    }, [initializeMap]);

    const handleHospitalClick = (hospital, marker) => {
        setSelectedHospital(hospital);
        // 클릭한 병원 마커를 사용자가 제공한 이미지로 변경
        marker.setIcon("free-icon-hospital-6743757.png"); // public 폴더에 위치한 이미지 파일
        // 모든 마커를 원래 색상으로 재설정
        markerArr.forEach(m => {
            if (m !== marker) {
                m.setIcon("http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_p.png");
            }
        });
    };

    const handleSelectHospital = () => {
        if (selectedHospital) {
            const selectedHospitalData = hospitals.find(h => h === selectedHospital);
            const markerIndex = hospitals.indexOf(selectedHospital);
            const selectedMarker = markerArr[markerIndex];

            if (selectedHospitalData && selectedMarker) {
                const { lat, lon } = selectedMarker.getPosition(); // 병원의 위도와 경도

                // 지도 중심을 선택된 병원으로 이동
                const mapInstance = new Tmapv2.Map("mapContainer");
                mapInstance.setCenter(new Tmapv2.LatLng(lat, lon));

                // 선택된 병원에 마커 추가
                new Tmapv2.Marker({
                    position: new Tmapv2.LatLng(lat, lon),
                    icon: "free-icon-hospital-6743757.png", // 선택된 병원 이미지로 설정
                    iconSize: new Tmapv2.Size(24, 38),
                    map: mapInstance,
                });

                navigate('/directions', { state: { hospital: selectedHospital } });
            }
        } else {
            alert("병원을 선택해 주세요.");
        }
    };

    return (
        <div className="recommendation-page">
            <NavBar />
            <h1>병원 추천</h1>
            <div className="recommendation-container">
                <div className="left-section">
                <strong>추천 병원</strong>
                    <div className="diagnosis-box">
                        <p><strong>진단 결과:</strong> {diagnosisResult || '진단 결과 없음'}</p>
                        <p><strong>추천 과목:</strong> {recommendedDepartment || '추천 과목 없음'}</p>
                        <p><strong>환자 위치:</strong> {currentAddress || '위치 정보 없음'}</p>
                    </div>
                    <div className="map" id="mapContainer" />
                </div>

                <div className="right-section">
                    <div className="hospital-list-container">
                        <strong>추천 병원</strong>
                        <div className="hospital-list-and-distance" style={{ overflowY: 'scroll' }}>
                            <ul className="hospital-list">
                                {hospitals.length > 0 ? hospitals.map((hospital, index) => (
                                    <div key={index} className="hospital-item">
                                        <li
                                            className={`hospital ${selectedHospital === hospital ? 'selected' : ''}`}
                                            onClick={() => handleHospitalClick(hospital, markerArr[index])} // 클릭 시 해당 마커를 전달
                                        >
                                            {hospital}
                                        </li>
                                        <span className="hospital-distance">
                                            {distances[index] ? `${distances[index]} km` : '거리 계산 중...'}
                                        </span>
                                    </div>
                                )) : <li>3km 이내에 병원이 없습니다. 가장 가까운 병원을 추천합니다.</li>}
                            </ul>
                        </div>
                    </div>
                    <button className="select-button" onClick={handleSelectHospital}>병원 선택</button>
                </div>
            </div>
        </div>
    );
}

export default RecommendationPage;
