import React, { useState, useEffect, useCallback } from 'react';
import './RouteguidancePage.css';
import { useLocation } from 'react-router-dom';
import { flaskApi } from '../../utils/api';
/* global Tmapv2 */ // Tmapv2 전역 변수 선언 (Tmap API 사용)
const TMAP_API_KEY = process.env.REACT_APP_TMAP_API; // 환경 변수에서 Tmap API 키 가져오기
const FLASK_URL = process.env.REACT_APP_FLASK_URL;

// RouteguidancePage 컴포넌트 정의
function RouteguidancePage() {
    // 이전 페이지에서 전달된 state 값을 받아옴
    const { state } = useLocation();
    const {
        patientLat,       // 환자 위치 위도
        patientLon,       // 환자 위치 경도
        hospitalLat,      // 병원 위치 위도
        hospitalLon,      // 병원 위치 경도
        roadDistance,     // 도로 기준 거리
        selectedHospital, // 선택된 병원 이름
        address,          // 환자 위치 텍스트 (주소)
    } = state || {};
    console.log(hospitalLat, hospitalLon);
    // React 상태 정의
    const [map, setMap] = useState(null);                // 지도 인스턴스
    const [currentMarker, setCurrentMarker] = useState(null); // 환자 위치 마커
    const [destinationMarker, setDestinationMarker] = useState(null); // 병원 위치 마커
    const [routeLine, setRouteLine] = useState(null);    // 경로 라인
    const [estimatedTime, setEstimatedTime] = useState(null); // 예상 도착 시간
    const [isInitialized, setIsInitialized] = useState(false); // 초기화 상태 변수

    // 지도 초기화 함수
    const initializeMap = useCallback(() => {
        const mapDiv = document.getElementById('mapContainer');
        // Tmap API가 로드되었고, 지도 요소가 비어 있을 경우 지도 초기화
        if (mapDiv && !mapDiv.firstChild && window.Tmapv2) {
            const mapInstance = new Tmapv2.Map("mapContainer", {
                center: new Tmapv2.LatLng(patientLat, patientLon), // 환자 위치를 중심으로 설정
                width: "800px",
                height: "500px",
                zoom: 14, // 초기 줌 레벨 설정
            });
            setMap(mapInstance); // 지도 인스턴스를 상태에 저장
            setIsInitialized(true); // 초기화 상태 설정
        }
    }, [patientLat, patientLon]);

    // 경로 및 마커 표시 함수
    const displayRoute = useCallback(async () => {
        // 지도 인스턴스와 환자/병원 위치 정보가 존재할 경우 실행
        if (map && patientLat && patientLon && hospitalLat && hospitalLon) {
            // 환자 위치 마커 설정
            const currentMarkerInstance = new Tmapv2.Marker({
                position: new Tmapv2.LatLng(patientLat, patientLon),
                icon: "http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_p.png",
                title: "환자 위치",
                iconSize: new Tmapv2.Size(24, 38),
                map: map,
            });
            setCurrentMarker(currentMarkerInstance);

            // 병원 위치 마커 설정
            const destinationMarkerInstance = new Tmapv2.Marker({
                position: new Tmapv2.LatLng(hospitalLat, hospitalLon),
                icon: "http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_p.png",
                title: selectedHospital,
                iconSize: new Tmapv2.Size(24, 38),
                map: map,
            });
            setDestinationMarker(destinationMarkerInstance);

            // Tmap API를 사용하여 경로 안내 데이터 요청
            const routeUrl = `https://apis.openapi.sk.com/tmap/routes?version=1&format=json&appKey=${TMAP_API_KEY}&startX=${patientLon}&startY=${patientLat}&endX=${hospitalLon}&endY=${hospitalLat}&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&startName=환자 위치&endName=${selectedHospital}&trafficInfo=Y`;
            const routeResponse = await fetch(routeUrl);
            const routeData = await routeResponse.json();

            // 경로 데이터를 받아서 폴리라인으로 표시
            if (routeData.features && routeData.features.length > 0) {
                const route = routeData.features
                    .filter(feature => feature.geometry.type === "LineString")
                    .map(feature => feature.geometry.coordinates.map(coord => new Tmapv2.LatLng(coord[1], coord[0])))
                    .flat();

                // 경로 라인 생성
                const routePolyline = new Tmapv2.Polyline({
                    path: route,
                    strokeColor: "#FF0000",
                    strokeWeight: 6,
                    strokeOpacity: 1,
                    map: map,
                });
                setRouteLine(routePolyline);
            }

            // Flask 서버에 예상 도착 시간 요청
            // console.log("환자 위치", patientLat, patientLon);
            // console.log("병원 위치", hospitalLat, hospitalLon);
            // console.log("도로 기준 거리", roadDistance);
            try {

                const response = await flaskApi.post('/predict/calculate_time', {
                    startLat: patientLat,
                    startLon: patientLon,
                    distance: roadDistance,
                });
                // console.log(response);


                // const response = await fetch(`${FLASK_URL}/predict/calculate_time`, {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json",
                //         'Authorization': `Bearer ${token}`, // Bearer 토큰 형식으로 전달
                //     },
                //     body: JSON.stringify({
                //         startLat: patientLat,
                //         startLon: patientLon,
                //         distance: roadDistance,
                //     }),
                // });

                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = response.data;
                // 서버에서 반환된 예상 도착 시간을 상태에 저장
                setEstimatedTime(data.estimated_time);
            } catch (error) {
                console.error("Error fetching estimated time from Flask API:", error);
            }
        }
    }, [map, patientLat, patientLon, hospitalLat, hospitalLon, roadDistance, selectedHospital]);

    // 지도 초기화 효과
    useEffect(() => {
        // Tmap API 스크립트를 동적으로 로드
        if (!window.Tmapv2) {
            const script = document.createElement('script');
            script.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${TMAP_API_KEY}`;
            script.async = true;
            script.onload = initializeMap;
            document.head.appendChild(script);
        } else {
            initializeMap();
        }
    }, [initializeMap]);


    // 경로 표시
    useEffect(() => {
        if (isInitialized) {
            displayRoute();
        }
    }, [isInitialized, displayRoute]);

    // UI 렌더링
    return (
        <div className="Routeguidance-Page">
            <div className="Route-guidance-container">
                <h1>경로 및 소요시간 안내</h1>
                <div className="info-box">
                    <ul>
                        <li>
                            <span className="info-title">선택된 병원:</span>
                            <span className="info-content">{selectedHospital}</span>
                        </li>
                        <li>
                            <span className="info-title">환자 위치:</span>
                            <span className="info-content">{address}</span>
                        </li>
                        <li>
                            <span className="info-title">도로 기준 거리:</span>
                            <span className="info-content">{roadDistance} km</span>
                        </li>
                        {estimatedTime && (
                            <li>
                                <span className="info-title">예상 소요 시간:</span>
                                <span className="info-content">{estimatedTime} 분</span>
                            </li>
                        )}
                    </ul>
                </div>
                <div id="mapContainer" style={{ width: '100%', height: '500px', border: '1px solid black', marginTop: '20px' }}></div>
            </div>
        </div>
    );
}

export default RouteguidancePage;
