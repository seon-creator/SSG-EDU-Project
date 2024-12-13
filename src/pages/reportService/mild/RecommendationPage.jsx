import React, { useState, useEffect, useCallback } from 'react';
import './RecommendationPage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { flaskApi } from '../../../utils/api';
/* global Tmapv2 */ // Tmapv2 전역 변수 선언
const TMAP_API_KEY = process.env.REACT_APP_TMAP_API

// 차로 이동 시의 거리 계산 함수
const calculateDrivingDistance = async (startLat, startLon, endLat, endLon) => {
    const headers = { appKey: TMAP_API_KEY };
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
    const headers = { appKey: TMAP_API_KEY };
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

    } catch (error) {
        console.error("Error:", error);
    }
};

function MildPage() {
    const { state } = useLocation();
    const { symptoms, address } = state || {};
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [markerArr, setMarkerArr] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [distances, setDistances] = useState([]);
    const [recommendedDepartment, setRecommendedDepartment] = useState('');
    const [searchCache, setSearchCache] = useState({});
    const navigate = useNavigate();
    const radius = 3; // 반경을 3km로 설정

    // 추천 과목을 받아오는 함수
    const fetchRecommendedDepartment = useCallback(async () => {
        try {
            const response = await flaskApi.post('/predict/multiclass', { symptoms });
            const data = response
            setRecommendedDepartment(data.data.predicted_department);
        } catch (error) {
            console.error('추천 진료과 가져오기 중 오류:', error);
        }
    }, [symptoms]);

    const parts = address.split(' ');

    const city = parts[0];               // 첫 번째 부분
    const district = parts[1];           // 두 번째 부분
    const streetAndNumber = parts.slice(2).join(' ');  // 나머지 부분

    // 지도 초기화 함수 (추천 과목을 받은 후에 실행)
    const initializeMap = useCallback(() => {
        if (!recommendedDepartment) return; // 추천 과목이 없으면 지도 초기화하지 않음

        const mapDiv = document.getElementById('mapContainer');
        if (mapDiv && !mapDiv.firstChild && window.Tmapv2) {
            const mapInstance = new Tmapv2.Map("mapContainer", {
                center: new Tmapv2.LatLng(37.5665, 126.9780),
                width: "100%",
                height: "400px",
                zoom: 14
            });

            if (address) {
                const geocodeUrl = `https://apis.openapi.sk.com/tmap/geo/geocoding?version=1&format=json&city_do=${encodeURIComponent(city)}&gu_gun=${encodeURIComponent(district)}&dong=${encodeURIComponent(streetAndNumber)}&addressFlag=F00&coordType=WGS84GEO&appKey=${TMAP_API_KEY}`;
                fetch(geocodeUrl)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        if (data.coordinateInfo && data.coordinateInfo.newLat && data.coordinateInfo.newLon) {
                            const lat = parseFloat(data.coordinateInfo.newLat);
                            const lon = parseFloat(data.coordinateInfo.newLon);

                            mapInstance.setCenter(new Tmapv2.LatLng(lat, lon));

                            new Tmapv2.Marker({
                                position: new Tmapv2.LatLng(lat, lon),
                                icon: "http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_p.png",
                                iconSize: new Tmapv2.Size(24, 38),
                                map: mapInstance,
                            });

                            // 추천된 과목에 맞춰 병원 검색
                            searchPOI(recommendedDepartment, lat, lon, mapInstance, radius, markerArr, setMarkerArr, setHospitals, setDistances, searchCache, setSearchCache);
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
    }, [address, recommendedDepartment, radius, markerArr, searchCache, setMarkerArr, setHospitals, setDistances, setSearchCache, city, district, streetAndNumber]);

    // 추천 과목을 먼저 받아오고, 그 후에 지도를 초기화함
    useEffect(() => {
        if (symptoms) {
            fetchRecommendedDepartment();
        }
    }, [fetchRecommendedDepartment, symptoms]);

    // 추천 과목을 받아온 후에 지도를 초기화
    useEffect(() => {
        if (recommendedDepartment) {
            if (!window.Tmapv2) {
                const script = document.createElement('script');
                script.src = "https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=RodJLscILK5e9NJhSjh6ya7RWqlGMFJX9mnNIukK";
                script.async = true;
                script.onload = initializeMap;
                document.head.appendChild(script);
            } else {
                initializeMap();
            }
        }
    }, [initializeMap, recommendedDepartment]);

    const handleHospitalClick = (hospital, marker) => {
        if (selectedHospital === hospital) {
            // 선택된 항목 다시 클릭 시 선택 해제
            setSelectedHospital(null);
        } else {
            // 새로운 항목 선택
            setSelectedHospital(hospital);
        }
        // 클릭한 병원 마커를 사용자가 제공한 이미지로 변경
        marker.setIcon("http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_p.png"); // public 폴더에 위치한 이미지 파일
        // 모든 마커를 원래 색상으로 재설정
        markerArr.forEach(m => {
            if (m !== marker) {
                m.setIcon("http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_p.png");
            }
        });
    };

    const handleSelectHospital = async () => {
        if (selectedHospital) {
            // 선택된 병원의 데이터를 가져옴
            const markerIndex = hospitals.indexOf(selectedHospital);
            const selectedMarker = markerArr[markerIndex];

            if (selectedMarker) {
                // 선택된 병원의 위도와 경도
                const { _lat: hospitalLat, _lng: hospitalLon } = selectedMarker.getPosition();

                try {
                    // 환자 위치 지오코딩 (위도, 경도 가져오기)
                    const geocodeUrl = `https://apis.openapi.sk.com/tmap/geo/geocoding?version=1&format=json&city_do=${encodeURIComponent(city)}&gu_gun=${encodeURIComponent(district)}&dong=${encodeURIComponent(streetAndNumber)}&addressFlag=F00&coordType=WGS84GEO&appKey=${TMAP_API_KEY}`;
                    const response = await fetch(geocodeUrl);
                    const data = await response.json();

                    if (data.coordinateInfo && data.coordinateInfo.newLat && data.coordinateInfo.newLon) {
                        const patientLat = parseFloat(data.coordinateInfo.newLat);
                        const patientLon = parseFloat(data.coordinateInfo.newLon);

                        // 도로 기준 거리 계산
                        const roadDistance = await calculateDrivingDistance(patientLat, patientLon, hospitalLat, hospitalLon);

                        // 지도 중심을 선택된 병원으로 이동
                        const mapInstance = new Tmapv2.Map("mapContainer");
                        mapInstance.setCenter(new Tmapv2.LatLng(hospitalLat, hospitalLon));

                        // 선택된 병원에 마커 추가
                        new Tmapv2.Marker({
                            position: new Tmapv2.LatLng(hospitalLat, hospitalLon),
                            icon: "free-icon-hospital-6743757.png",
                            iconSize: new Tmapv2.Size(24, 38),
                            map: mapInstance,
                        });

                        // 경로 안내 페이지로 이동하며 데이터 전달 (address 추가)
                        navigate('/route/guide', {
                            state: {
                                patientLat,
                                patientLon,
                                hospitalLat,
                                hospitalLon,
                                roadDistance,
                                selectedHospital,
                                address, // 환자 위치 텍스트 추가
                            },
                        });
                    } else {
                        alert("환자 위치의 좌표를 찾을 수 없습니다.");
                    }
                } catch (error) {
                    console.error("Error fetching geocode data or calculating distance:", error);
                }
            }
        } else {
            alert("병원을 선택해 주세요.");
        }
    };

    return (


        <div className="recommendation-page">

            <div className="recommendation-page-header">
                <h1>진단 결과: 경증</h1>
            </div>
            <div className="content-container">
                <div className="left-section">
                    <div className="diagnosis-box">
                        <div className="diagnosis-item">
                            <span className="diagnosis-title">증상:</span>
                            <span className="diagnosis-content">{symptoms || '증상 정보 없음'}</span>
                        </div>
                        <div className="diagnosis-item">
                            <span className="diagnosis-title">추천 과목:</span>
                            <span className="diagnosis-content-recommend">{recommendedDepartment || '추천 과목 없음'}</span>
                        </div>
                        <div className="diagnosis-item">
                            <span className="diagnosis-title">환자 위치:</span>
                            <span className="diagnosis-content">{address || '위치 정보 없음'}</span>
                        </div>
                    </div>
                    <div className="map-container" id="mapContainer"></div>
                </div>
                <div className="right-section">
                    <div className="hospital-list-container">
                        <strong>추천 병원</strong>
                        <hr className="section-divider" />
                        <div className="hospital-list-and-distance">
                            <ul className="hospital-list">
                                {hospitals.length > 0 ? hospitals.map((hospital, index) => (
                                    <div
                                        key={index}
                                        className={`hospital-item ${selectedHospital === hospital ? 'selected' : ''}`}
                                        onClick={() => handleHospitalClick(hospital, markerArr[index])}
                                    >
                                        <li className="hospital">{hospital}</li>
                                        <span className="hospital-distance">
                                            {distances[index] ? `${distances[index]} km` : '거리 계산 중...'}
                                        </span>
                                    </div>
                                )) : <li>3km 이내에 병원이 없습니다. 가장 가까운 병원을 추천합니다.</li>}
                            </ul>
                        </div>
                    </div>
                    <button className="hospital-select-button" onClick={handleSelectHospital}>병원 선택</button>
                </div>
            </div>
        </div>
    );
}

export default MildPage;